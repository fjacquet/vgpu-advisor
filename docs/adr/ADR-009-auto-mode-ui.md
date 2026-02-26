# ADR-009 — Auto-Mode UI: Capacity Plan as Default, 4 Tabs When GPU Selected

**Date:** 2026-02-26
**Status:** Accepted (supersedes ADR-008)
**Deciders:** fjacquet

---

## Context

ADR-008 added the Capacity Plan as a **5th output tab** alongside the four analysis tabs
(Profiles, Density, Recommendations, Config). This created a UX problem: the Capacity Plan
is designed for users who have *not yet* chosen a specific GPU (they want to discover which
GPU to buy), while the four analysis tabs require a GPU selection to produce meaningful output.

Putting them all in the same tab bar forced users to either:
1. Select a GPU first (defeating the purpose of the Capacity Plan), or
2. Switch back and forth between the GPU-centric tabs and the catalog-search tab

Additionally, the sidebar showed profile filter controls (series Q/B/A/C) that are meaningless
without a GPU selection, and the Capacity Plan's series/VRAM selectors lived inside the right-panel
table component rather than the left sidebar — breaking the established left-sidebar-for-inputs /
right-panel-for-outputs pattern.

## Decision

Split the UI into two **distinct modes**, automatically selected by whether a GPU is chosen:

| State | Mode | Right Panel | Left Sidebar |
|---|---|---|---|
| No GPU selected | **Capacity Plan mode** | `CapacityPlanTable` directly (no tabs) | GPU Selector + `CapacityFilterPanel` + DeploymentPanel |
| GPU selected | **Analysis mode** | 4-tab interface (Profiles / Density / Recommendations / Config) | GPU Selector + `ProfileFilterPanel` + DeploymentPanel |

The `CapacityFilterPanel` (new component) lives in the left sidebar and contains:
- Series card selector (Q / B / A / C) — single-select, card-style with description
- VRAM size picker — buttons showing only sizes available for the chosen series
- VRAM InfoTooltip explaining the trade-off

The `CapacityPlanTable` becomes a pure output component reading `capacitySeries` and
`capacityVramGb` from the Zustand store (URL-persisted) rather than local component state.

`capacitySeries` and `capacityVramGb` are added to `PersistedState` in `urlStorage.ts` so
sharing a URL restores the full capacity plan configuration — correcting the limitation noted
in ADR-008's Consequences section.

The 'capacity' string is **removed** from the `activeTab` union in `configStore.ts`. The tab
bar only manages the four analysis tabs.

A shared `SeriesCardGroup` component is extracted (DRY) and used by both `CapacityFilterPanel`
(single-select) and `ProfileFilterPanel` (multi-select).

## Consequences

**Positive**
- Capacity Plan and Analysis modes are now UX-coherent: each mode's sidebar inputs match
  its right-panel outputs
- No tab switching required: the correct view appears automatically based on GPU selection
- `capacitySeries` and `capacityVramGb` are URL-persisted — shared links restore full state
- `CapacityPlanTable` is now a pure output component (no local state) — easier to test
- `SeriesCardGroup` eliminates duplicated card-style rendering logic

**Negative**
- Users cannot view the Capacity Plan while a GPU is selected (must clear GPU first)
- The auto-mode switch may be surprising to users who expect a tab to always be visible
- 'capacity' can no longer appear as an `activeTab` value in URL hashes written by older versions
  (old URLs with `activeTab=capacity` will fall back to the default 'profiles' tab)

## Alternatives Considered

| Option | Reason Rejected |
|---|---|
| Keep 5-tab layout, move selectors to sidebar | Still confuses the two mental models; sidebar would show capacity selectors even in GPU-analysis context |
| Add a dedicated page/route for Capacity Plan | No router in use (ADR-001); would require React Router or similar |
| Make Capacity Plan always visible in both modes | Right panel would always show a partly-irrelevant table when a GPU is selected |
