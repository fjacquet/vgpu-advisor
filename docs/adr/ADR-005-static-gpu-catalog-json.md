# ADR-005 — Static GPU Catalog in JSON

**Date:** 2026-02-25
**Status:** Accepted
**Deciders:** fjacquet

---

## Context

The app needs a catalog of NVIDIA GPUs with their topology (slot width, GPU count per card, VRAM) and vGPU profile definitions. This data changes infrequently — NVIDIA releases new GPU architectures roughly annually, and vGPU profile sets are stable within a driver generation.

## Decision

Store the GPU catalog as a **static JSON file** at `src/data/gpus.json`, imported directly into the bundle at build time. vGPU profiles are **derived at runtime** by the density engine from each GPU's profile size arrays, not stored as individual records.

Each GPU entry contains:
- Topology fields: `vram_gb`, `gpu_count_per_card`, `slot_width`, `cooling`, `form_factor`
- Performance fields: `fp32_tflops`, `memory_bandwidth_gbps`, `cuda_cores`, `nvenc_count`, `nvdec_count`
- Profile size arrays: `q_profile_sizes_gb`, `b_profile_sizes_gb`, `a_profile_sizes_gb`, `c_profile_sizes_gb`

The density engine (`deriveProfile`) constructs `VgpuProfile` objects dynamically from these arrays plus the `SERIES_INFO` constants (display count, resolution, FPS, license type per series).

## Consequences

**Positive**
- No API call required — catalog loads instantly as part of the JS bundle
- Strongly typed via `GpuCard` TypeScript interface — catalog errors caught at build time
- Adding a GPU requires one JSON entry — no schema migration, no database
- Profile counts stay correct automatically when profile size arrays are updated

**Negative**
- Catalog updates require a code commit and redeploy (acceptable — NVIDIA GPU releases are infrequent)
- All 18 GPUs are always bundled regardless of which one the user selects (bundle size impact is negligible — JSON is ~8 kB)
- Performance figures (TFLOPS, bandwidth) must be manually researched and entered; there is no authoritative machine-readable NVIDIA API for this data
- Export-restricted GPU variants (L2, A800, H800) have approximate performance specs

## Alternatives Considered

| Option | Reason Rejected |
|---|---|
| NVIDIA API / scraping | No public machine-readable API exists for vGPU profile data |
| CMS / headless DB (Supabase, Contentful) | Violates ADR-001; adds hosting cost and complexity |
| Separate JSON CDN fetch | Adds a network round-trip and failure mode for a ~8 kB file |
| Individual profile records (not derived) | ~500+ records vs 18 GPU entries; massive duplication; harder to maintain |
