# ADR-008 — Reverse Capacity Planning Tab

**Date:** 2026-02-25
**Status:** Superseded by [ADR-009](ADR-009-auto-mode-ui.md)
**Deciders:** fjacquet

---

## Context

The original density calculation answers: *"I have N hosts with this GPU — how many VMs can I run?"*
(forward planning). A common complementary question from Horizon architects is the reverse:
*"I need to serve N VMs with profile X — which GPUs should I buy, and how many hosts?"*

This is a procurement / capacity planning question, not a utilisation question. The correct flow
starts from requirements (VM count + profile specification) and discovers which hardware options
satisfy them — without requiring the user to pre-select a specific GPU first.

The `vmTarget` field was already present in the Zustand store and the `DeploymentPanel` slider
from the initial implementation but had no output tab consuming it.

## Decision

Add a **"Capacity Plan"** tab as the 5th output tab. The tab is **self-contained**: it has its
own series and VRAM size selectors (local component state), and reads `vmTarget` and
`pcieSlotsPerHost` from the existing Zustand store (both already URL-persisted).

A new pure function `reverseCapacityPlanAllGpus(allGpus, vmTarget, pcieSlotsPerHost, series, vramGb)`
queries **all 18 GPUs** in the catalog for the requested profile and returns hardware requirements:

```
For each GPU that supports the requested profile:
  vramPerGpu     = gpu.vram_gb / gpu.gpu_count_per_card
  maxCardsPerHost = floor(pcieSlotsPerHost / slot_width)
  totalGpusPerHost = maxCardsPerHost × gpu_count_per_card
  instancesPerGpu  = floor(vramPerGpu / targetVramGb)
  instancesPerHost = instancesPerGpu × totalGpusPerHost
  hostsNeeded      = ceil(vmTarget / instancesPerHost)
  gpuUtilization   = vmTarget / (hostsNeeded × instancesPerHost)
```

Results are sorted by `hostsNeeded` ASC, then `gpusNeeded` ASC as tiebreaker.
The most-efficient rows (minimum `hostsNeeded`) are highlighted with ★.

A dynamic VRAM selector shows only sizes available across ≥1 GPU for the selected series,
computed at render time from the GPU catalog — no separate data structure maintained.

## Consequences

**Positive**
- Correctly implements the intended use case: start from requirements, discover hardware options
- No GPU pre-selection required — the tab works independently of the sidebar GPU selector
- `reverseCapacityPlanAllGpus()` is a pure function — fully testable, no side effects
- Zero new Zustand state — `vmTarget` and `pcieSlotsPerHost` were already persisted in URL
- Dynamic VRAM options eliminate the possibility of selecting an unsupported profile
- Sorting by hostsNeeded gives procurement teams an instant "minimum hardware" answer

**Negative**
- Does not account for host failure headroom (N+1 sizing) — admins must apply their own overhead
- Assumes `pcieSlotsPerHost` is fixed; does not optimise across varying slot configurations
- Sorting by `hostsNeeded` ASC does not reflect NVIDIA licensing cost (more dense profiles may
  carry higher per-user licence cost) — admins must evaluate total cost of ownership separately
- The series/VRAM state in the Capacity Plan tab is not URL-persisted (local component state);
  sharing a URL does not restore the selected profile spec in this tab

## Alternatives Considered

| Option | Reason Rejected |
|---|---|
| Require GPU pre-selection (original v1 design) | Backwards from the user's mental model; forces a procurement decision before the planning step |
| Store series/vramGb in Zustand + URL | Capacity plan inputs are tab-local and ephemeral; adding them to the shared URL would clutter it and confuse users who share config URLs |
| Show only the optimal (fewest hosts) GPU | Loses comparison context — admins need to evaluate cost, existing inventory, and availability |
| Separate page / route | No router in use (ADR-001) |
