# Product Requirements Document — vGPU Advisor

**Version:** 1.0
**Date:** 2026-02-25
**Status:** Active

---

## 1. Overview

### 1.1 Problem Statement

Sizing NVIDIA vGPU profiles for Omnissa Horizon (formerly VMware Horizon) VDI deployments is error-prone and time-consuming. Administrators must manually cross-reference GPU datasheets, vGPU profile documentation, and host topology to estimate VM density — a process with no tooling support and significant risk of under- or over-provisioning.

### 1.2 Product Vision

**vGPU Advisor** is a browser-based calculator that lets VDI architects select an NVIDIA GPU, configure their host topology, and instantly see which vGPU profiles fit their workload — with VM density numbers, recommendations, and a ready-to-paste Horizon config snippet.

### 1.3 Target URL

`https://fjacquet.github.io/vgpu-advisor/`

---

## 2. Target Users

| Persona | Role | Primary Need |
|---|---|---|
| **VDI Architect** | Designs Horizon deployments | Right-size vGPU profiles before purchasing hardware |
| **Pre-Sales Engineer** | Builds customer proposals | Quick density estimates for different GPU options |
| **Horizon Admin** | Manages production VDI | Generate `graphic-profiles.properties` config without manual lookup |
| **Procurement** | Buys server/GPU hardware | Understand trade-offs between GPU models at a glance |

---

## 3. Core Features

### 3.1 GPU Selector

- Catalog of 18 NVIDIA GPUs across 5 architectures (Blackwell, Ada, Ampere, Turing, Volta, Maxwell)
- Each GPU shows: VRAM, architecture, slot width, TDP, cooling type
- Performance facts: FP32 TFLOPS, memory bandwidth, CUDA cores, NVENC/NVDEC encoder counts

### 3.2 Profile Browser (Profiles tab)

- All available vGPU profiles for the selected GPU
- Filter by series: Q (vWS), B (vPC), A (vCS), C (Compute)
- Per-profile data: framebuffer, max VMs/GPU, displays, resolution, FPS, license tier
- Framebuffer utilization bar per profile
- One-click copy of the profile Horizon string

### 3.3 VM Density Calculator (Density tab)

- Deployment inputs: PCIe slots/host, host count, workload type
- Derived values: cards/host, GPUs/host, total VRAM/host
- Per-profile density: VMs/GPU, VMs/host, VMs/cluster
- Bar chart: VMs per cluster by profile (colour-coded by series)

### 3.4 Recommendation Engine (Recommendations tab)

- Scores profiles against workload type (Workstation / Knowledge Worker / Compute)
- Returns top 3 ranked profiles with fit reasoning (natural-language bullet points)
- Shows density numbers for each recommendation

### 3.5 Horizon Config Snippet (Config tab)

- Generates ready-to-paste `graphic-profiles.properties` content
- Includes GPU metadata header and display capability comments
- One-click copy to clipboard

### 3.6 Share & Print

- **Share:** Encodes full configuration to URL hash (lz-string compressed) — shareable link restores exact state
- **Print:** `window.print()` renders a clean single-page report with all 4 output sections as tables (no charts, no nav)

### 3.7 Internationalisation

- UI available in English (EN), French (FR), German (DE), Italian (IT)
- Language auto-detected from browser; switchable via dropdown in header

---

## 4. Non-Goals (v1)

- **No authentication / user accounts** — fully anonymous, no data stored server-side
- **No hardware pricing** — cost comparison is out of scope
- **No MIG support** — multi-instance GPU partitioning not modelled
- **No live NVIDIA API integration** — GPU catalog is curated static JSON
- **No cluster scheduler awareness** — vSphere DRS, reservation, and affinity rules not considered
- **No Citrix/RDS support** — scoped to Omnissa Horizon only

---

## 5. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | User can select any GPU from the catalog | Must |
| FR-02 | Profile list updates immediately on GPU selection | Must |
| FR-03 | Density calculation updates on any input change | Must |
| FR-04 | Recommendation engine returns ≥ 1 result for any valid GPU + workload | Must |
| FR-05 | Config snippet is valid `graphic-profiles.properties` syntax | Must |
| FR-06 | Shared URL fully restores state on load | Must |
| FR-07 | Print output fits on A4/Letter without clipping | Should |
| FR-08 | UI renders correctly in Chrome, Firefox, Safari, Edge | Must |
| FR-09 | UI is responsive down to 1024 px wide | Should |
| FR-10 | All text is translatable via i18n keys | Must |

---

## 6. Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-01 | Initial load time (cold, no cache) | < 3 s on 10 Mbit/s |
| NFR-02 | Bundle size (gzip) | < 150 kB JS + CSS |
| NFR-03 | TypeScript strict mode — no `any` | 100% |
| NFR-04 | Biome lint passes with zero warnings | 100% |
| NFR-05 | Unit test coverage for density engine | 14 test cases |
| NFR-06 | CI pipeline passes on every push to `main` | 100% |
| NFR-07 | Static hosting — no server required | GitHub Pages |

---

## 7. Key Formulas

```
cardsPerHost        = floor(pcieSlotsPerHost / gpu.slot_width)
gpusPerHost         = cardsPerHost × gpu.gpu_count_per_card
vramPerGpu          = gpu.vram_gb / gpu.gpu_count_per_card
instancesPerGpu     = floor(vramPerGpu / profile.vram_gb)
instancesPerHost    = instancesPerGpu × gpusPerHost
instancesPerCluster = instancesPerHost × hostCount
framebufferUtil     = instancesPerGpu × profile.vram_gb / vramPerGpu
```

---

## 8. Data Model

### GPU Catalog (`src/data/gpus.json`)

Each GPU entry contains topology, physical, and performance fields:

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique slug |
| `model` | string | Display name |
| `architecture` | enum | blackwell / ada / ampere / turing / volta / maxwell |
| `vram_gb` | number | Total card VRAM (sum across all chips) |
| `gpu_count_per_card` | number | Physical GPU chips on the card |
| `slot_width` | 1 \| 2 | PCIe slot width |
| `tdp_watts` | number | Thermal design power |
| `fp32_tflops` | number | FP32 single-precision throughput (card total) |
| `memory_bandwidth_gbps` | number | Memory bandwidth in GB/s (card total) |
| `cuda_cores` | number | CUDA core count (card total) |
| `nvenc_count` | number | Hardware video encoder units (card total) |
| `nvdec_count` | number | Hardware video decoder units (card total) |

---

## 9. Success Metrics

| Metric | Target |
|---|---|
| Accurate density calculation vs manual calculation | 100% match |
| All 14 unit tests pass | 100% |
| Build deploys to GitHub Pages on push to main | Automated |
| Languages available | 4 (EN, FR, DE, IT) |
| GPUs in catalog | 18 |

---

## 10. Out-of-Scope / Future Considerations

- **vGPU driver version awareness** — profile availability changes across driver versions
- **NVSwitch / NVLink topologies** — multi-GPU high-speed interconnects
- **Export-controlled GPU variants** — L2, A800, H800 specs are approximate
- **Cost-per-VM analysis** — GPU capex divided by VM count
- **Saved configurations** — persist multiple sizing scenarios
- **PDF export** — dedicated PDF generation (vs browser print)
- **Dark/light theme toggle** — currently follows OS preference only
