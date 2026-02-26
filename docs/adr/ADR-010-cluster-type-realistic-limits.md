# ADR-010 — Cluster Type Selector and Realistic Sizing Limits

**Date:** 2026-02-26
**Status:** Accepted
**Deciders:** fjacquet

---

## Context

The original slider defaults were not grounded in real-world infrastructure limits:

| Slider | Old max | Problem |
|---|---|---|
| `hostCount` | 100 | No supported cluster type reaches 100; vSphere 8 caps at 64, vSphere 9 at 128 |
| `pcieSlotsPerHost` | 16 | No production GPU server fits 16 DW PCIe cards; real ceiling is 4 DW = 8 slots or 6 SW = 6 slots |
| `vmTarget` | 5,000 | A single Horizon pod supports up to 20,000 active sessions |

The host count maximum also depended on which hypervisor / cluster type the user was sizing for —
a VDI best-practice Horizon cluster is 8–16 hosts (≤32 for HA), while vSphere 9 supports 128.
There was no way to express this without hardcoding a single arbitrary number.

Sources researched and documented in `docs/sizing-reference.md`.

## Decision

### 1. Cluster Type Selector

Add a radio-button **cluster type** selector to `DeploymentPanel` with four options:

| Value | Label | `hostCount` max |
|---|---|---|
| `vdi` | Horizon VDI (≤32 hosts) | 32 |
| `vsphere8` | vSphere 8 max (≤64 hosts) | 64 |
| `vsphere9` | vSphere 9 max (≤128 hosts) | 128 |
| `ocp` | OpenShift Virtualization (≤64 nodes) | 64 |

When the user switches cluster type, if `hostCount` exceeds the new maximum it is clamped to the
new maximum. `clusterType` is stored in Zustand and URL-persisted (`PersistedState`).

The selector is shown only in GPU-analysis mode (`hasGpu = true`) because the Capacity Plan mode
expresses its own "hosts needed" as a computed output, not a user input.

### 2. PCIe Slots per Host

`pcieSlotsPerHost` max becomes **dynamic** based on the selected GPU's `slot_width`:

| `slot_width` | Max cards | PCIe slots consumed | `pcieSlotsPerHost` max |
|---|---|---|---|
| 1 (single-width) | 6 cards | 6 × 1 = 6 | **6** |
| 2 (double-width) | 4 cards | 4 × 2 = 8 | **8** |
| No GPU selected | — | — | **8** (default) |

These are conservative production maximums from vendor datasheets (Dell PowerEdge R750xa,
HP ProLiant DL380 Gen10+, Lenovo SR670 V2, Supermicro SYS-4029GP).

### 3. VM Target

`vmTarget` maximum raised from **5,000 to 20,000** to match one Horizon / Citrix pod maximum
(20,000 active sessions per Connection Server pod / resource location zone).

For deployments beyond 20,000: use Cloud Pod Architecture (Horizon) or multi-zone (Citrix)
and run the capacity plan per pod/zone.

### 4. OpenShift Virtualization (OCP) Support

OCP is added as a 4th cluster type (practical VDI size: 16–64 bare metal nodes). OCP supports:
- Omnissa Horizon: manual pools GA, Instant Clone in development, vGPU via NVIDIA GPU Operator ✅
- Citrix VAD (2511+): GA, GPU/SR-IOV in testing 🔄

OCP nodes require bare metal (no nested virtualization); GPU mode is exclusive per node
(vGPU, passthrough, or container — not mixed).

## Consequences

**Positive**
- Slider limits are grounded in real vendor documentation and best practices
- Cluster type selector makes the host count constraint explicit and self-documenting
- OCP users can size their bare-metal cluster correctly
- `vmTarget` now covers full pod capacity — no need to manually multiply
- All sources documented in `docs/sizing-reference.md`

**Negative**
- Adding `clusterType` to `PersistedState` means URLs without this field (written before this change)
  will deserialise with `clusterType: undefined`, requiring a safe default (`'vdi'`)
- `pcieSlotsPerHost` dynamic max means the slider range changes when a GPU is selected or cleared —
  the displayed value is clamped with `Math.min(pcieSlotsPerHost, maxPcieSlots)` to avoid showing
  an out-of-range value without silently writing invalid state to the store
- OCP bare-metal constraint (no nested virt) is not enforced by the tool; it is documented only

## Alternatives Considered

| Option | Reason Rejected |
|---|---|
| Single hardcoded max (e.g. 128) | Misleading for VDI architects sizing a Horizon best-practice cluster |
| Separate `maxHostCount` input field | Adds UX friction; cluster type already encodes the correct maximum |
| Nutanix AHV as cluster type | AHV max is 32 (same as VDI slot), adding it would duplicate; AHV covered in sizing-reference.md |
| Keep vmTarget max at 5,000 | Undersizes a pod; architects planning for 10,000+ VMs would need to guess the ceiling |
