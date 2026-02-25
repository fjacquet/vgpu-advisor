# ADR-007 — Citrix / XenServer Config Toggle in Config Tab

**Date:** 2026-02-25
**Status:** Accepted
**Deciders:** fjacquet

---

## Context

vGPU Advisor targets administrators in multinational organisations. Many Horizon admins also manage
Citrix Virtual Apps and Desktops (CVAD) environments. NVIDIA vGPU profiles are identical across
both platforms (same Q/B/A/C series naming, same VRAM sizes), but the configuration syntax differs:

- **Omnissa Horizon** — profiles registered in `graphic-profiles.properties` on the Connection Server
- **Citrix CVAD on XenServer/XCP-ng** — profiles assigned per-VM via `xe vgpu-create` CLI commands
- **Citrix CVAD on vSphere** — vGPU profile set in vCenter VM hardware settings (no Citrix-specific file)

Admins needed a way to get the platform-appropriate config snippet without leaving the app.

## Decision

Add a **Horizon | Citrix / XenServer** two-button platform toggle as **local component state**
inside the existing `HorizonConfigSnippet` component. No new top-level tab is added — the toggle
lives within the Config tab to keep the main navigation at 5 tabs.

The Citrix snippet generates `xe vgpu-create` CLI commands for each selected profile.
XenServer GRID type names are derived at runtime from the GPU model and profile data:

```
GRID {gpu.model.replace("NVIDIA ", "")}-{vram_gb}{series}
Example: NVIDIA L40S + 4Q → GRID L40S-4Q
```

A note in the Citrix snippet explains that on vSphere + Citrix CVAD, the profile is set in
vCenter and no `xe` commands are needed.

## Consequences

**Positive**
- Adds immediate value for the Citrix admin segment without complicating the nav
- XenServer type names are derived automatically — no separate data to maintain
- Toggle state is ephemeral (local React state) — no URL persistence needed; Horizon is always the default
- Copy button always copies the currently-visible snippet

**Negative**
- XenServer type name derivation is a best-effort approximation — NVIDIA occasionally deviates from
  the `GRID {MODEL}-{VRAM}{SERIES}` pattern for exotic GPU variants; admin must verify against
  `xe vgpu-type-list` on their actual XenServer host
- Does not cover Citrix on Hyper-V (RemoteFX/DDA) — out of scope; that is a passthrough model only

## Alternatives Considered

| Option | Reason Rejected |
|---|---|
| New top-level "Citrix Config" tab | Adds a 6th nav tab for content that is a minor variant of Config; visual clutter |
| Separate page / route | No router in use (ADR-001); adds complexity for a single toggle |
| Citrix-specific data file | Profile names and GRID types are derivable from existing GPU catalog — duplication avoided |
