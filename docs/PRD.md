# Product Requirements Document — vGPU Advisor

**Version:** 1.1
**Date:** 2026-02-26
**Status:** Active

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-02-25 | Initial release |
| 1.1 | 2026-02-26 | Auto-mode UI; Citrix/XenServer support; OCP cluster type; realistic slider limits; updated non-goals |

---

## 1. Overview

### 1.1 Problem Statement

Sizing NVIDIA vGPU profiles for VDI deployments on Omnissa Horizon and Citrix Virtual Apps and
Desktops is error-prone and time-consuming. Administrators must manually cross-reference GPU
datasheets, vGPU profile documentation, and host topology to estimate VM density — a process
with no tooling support and significant risk of under- or over-provisioning.

An equally common but separate need is **reverse planning**: starting from a target VM count
and discovering which GPU hardware is needed — without first committing to a specific card.

### 1.2 Product Vision

**vGPU Advisor** is a browser-based calculator for VDI architects. It covers two modes:

- **Capacity Plan mode** (no GPU selected): enter a VM target → see all compatible GPU options
  ranked by hardware efficiency. Supports all Horizon and Citrix series (Q/B/A/C).
- **Analysis mode** (GPU selected): configure host topology → see profile densities,
  a recommendation, and a ready-to-paste config snippet for Horizon or Citrix/XenServer.

### 1.3 Target URL

`https://fjacquet.github.io/vgpu-advisor/`

---

## 2. Target Users

| Persona | Role | Primary Need |
|---|---|---|
| **VDI Architect** | Designs Horizon/Citrix deployments | Right-size vGPU profiles before purchasing hardware |
| **Pre-Sales Engineer** | Builds customer proposals | Quick density estimates for different GPU options |
| **Horizon / Citrix Admin** | Manages production VDI | Generate config snippets without manual lookup |
| **Procurement** | Buys server/GPU hardware | Understand trade-offs between GPU models at a glance |

---

## 3. Core Features

### 3.1 GPU Selector

- Catalog of 18 NVIDIA GPUs across 6 architectures (Blackwell, Ada, Ampere, Turing, Volta, Maxwell)
- Each GPU shows: VRAM, architecture, slot width, TDP, cooling type, GPU count per card
- Performance facts: FP32 TFLOPS, memory bandwidth, CUDA cores, NVENC/NVDEC encoder counts

### 3.2 Auto-Mode UI

The right panel switches automatically based on GPU selection:

| State | Right panel | Left sidebar inputs |
|---|---|---|
| No GPU selected | Capacity Plan table (full width) | CapacityFilterPanel (series + VRAM) + DeploymentPanel (VM target) |
| GPU selected | 4-tab analysis (Profiles / Density / Recommendations / Config) | ProfileFilterPanel (series filter) + DeploymentPanel (PCIe/hosts/workload) |

### 3.3 Capacity Plan (no GPU required)

- Enter a target VM count (slider, 10–20,000 in steps of 10)
- Select profile series (Q/B/A/C) and VRAM size
- All 18 GPUs are queried; results table shows hosts needed, GPUs needed, cards needed, VMs/host, utilisation
- Most-efficient options (fewest hosts) highlighted with ★
- Supports Omnissa Horizon and Citrix/XenServer deployments on ESXi, Nutanix AHV, and OpenShift Virtualization

### 3.4 Profile Browser (Profiles tab)

- All available vGPU profiles for the selected GPU
- Filter by series: Q (vWS), B (vPC), A (vCS), C (Compute)
- Per-profile data: framebuffer, max VMs/GPU, displays, resolution, FPS, license tier
- Framebuffer utilisation bar per profile
- One-click copy of the profile Horizon or Citrix string

### 3.5 VM Density Calculator (Density tab)

- Deployment inputs: PCIe slots/host, host count, workload type, cluster type
- Derived values: cards/host, GPUs/host, total VRAM/host
- Per-profile density: VMs/GPU, VMs/host, VMs/cluster
- Bar chart: VMs per cluster by profile (colour-coded by series)

### 3.6 Recommendation Engine (Recommendations tab)

- Scores profiles against workload type (Workstation / Knowledge Worker / Compute)
- Returns top 3 ranked profiles with fit reasoning (natural-language bullet points)
- Shows density numbers for each recommendation

### 3.7 Config Snippet (Config tab)

- Generates ready-to-paste `graphic-profiles.properties` content for **Omnissa Horizon**
- Generates `xe` CLI commands for **Citrix / XenServer** vGPU assignment (toggle in tab)
- Profile name format is identical between Horizon and Citrix (e.g. `nvidia_l40s-4q`)
- One-click copy to clipboard

### 3.8 Cluster Type Selector

Available in Analysis mode (GPU selected). Controls the `hostCount` slider maximum:

| Cluster type | Max hosts | Notes |
|---|---|---|
| Horizon VDI | 32 | Best-practice HA cluster (n+1) |
| vSphere 8 | 64 | Platform maximum |
| vSphere 9 | 128 | Next-gen platform maximum |
| OpenShift Virtualization | 64 | Bare-metal worker nodes; GPU Operator required |

### 3.9 Deployment Configuration

| Input | Range | Notes |
|---|---|---|
| PCIe slots per host | 1 – 6 (SW) or 1 – 8 (DW) | Dynamic: single-width GPU max 6 × 1-slot = 6; double-width GPU max 4 × 2-slot = 8 |
| GPU count per host | 1 – max cards × GPUs/card | Derived from PCIe slots and selected GPU |
| Host count | 1 – cluster type max | Clamped when cluster type changes |
| VM target | 10 – 20,000 (step 10) | Matches one Horizon pod / Citrix zone maximum |

### 3.10 Share & Print

- **Share:** Encodes full configuration to URL hash (lz-string compressed) — shareable link restores exact state including cluster type, capacity series, and VRAM selection
- **Print:** `window.print()` renders a clean single-page report with all output sections as tables (no charts, no nav)

### 3.11 Internationalisation

- UI available in English (EN), French (FR), German (DE), Italian (IT)
- Language auto-detected from browser; switchable via dropdown in header
- All tooltip/help text is i18n-keyed — no hardcoded English strings in components

---

## 4. Non-Goals (v1)

- **No authentication / user accounts** — fully anonymous, no data stored server-side
- **No hardware pricing** — cost comparison is out of scope
- **No MIG support** — multi-instance GPU partitioning not modelled
- **No live NVIDIA API integration** — GPU catalog is curated static JSON
- **No cluster scheduler awareness** — vSphere DRS, reservation, and affinity rules not considered
- **No Microsoft AVD / Windows 365 support** — cloud-only; AVD has no on-premises hypervisor story compatible with NVIDIA vGPU in the same way Horizon/Citrix do
- **No NVSwitch / NVLink topologies** — multi-GPU high-speed interconnects not modelled
- **No Nutanix AHV cluster type selector** — AHV max is 32 (same as VDI slot); covered in sizing-reference.md

---

## 5. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | User can select any GPU from the catalog | Must |
| FR-02 | Profile list updates immediately on GPU selection | Must |
| FR-03 | Density calculation updates on any input change | Must |
| FR-04 | Recommendation engine returns ≥ 1 result for any valid GPU + workload | Must |
| FR-05 | Config snippet is valid `graphic-profiles.properties` syntax for Horizon | Must |
| FR-06 | Config snippet generates valid `xe` CLI commands for Citrix/XenServer | Must |
| FR-07 | Shared URL fully restores state on load (incl. capacity series, VRAM, cluster type) | Must |
| FR-08 | Print output fits on A4/Letter without clipping | Should |
| FR-09 | UI renders correctly in Chrome, Firefox, Safari, Edge | Must |
| FR-10 | UI is responsive down to 1024 px wide | Should |
| FR-11 | All text (incl. tooltips) is translatable via i18n keys | Must |
| FR-12 | Capacity Plan mode works without selecting a GPU | Must |
| FR-13 | Cluster type selector clamps host count when max decreases | Must |
| FR-14 | PCIe slot max is dynamic: 6 for SW GPUs, 8 for DW GPUs | Must |
| FR-15 | VM target slider allows up to 20,000 | Must |

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

# Reverse capacity plan (per GPU):
instancesPerHost    = instancesPerGpu × gpusPerHost
hostsNeeded         = ceil(vmTarget / instancesPerHost)
gpuUtilization      = vmTarget / (hostsNeeded × instancesPerHost)
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
| `slot_width` | 1 \| 2 | PCIe slot width (1 = single-width, 2 = double-width) |
| `tdp_watts` | number | Thermal design power |
| `fp32_tflops` | number | FP32 single-precision throughput (card total) |
| `memory_bandwidth_gbps` | number | Memory bandwidth in GB/s (card total) |
| `cuda_cores` | number | CUDA core count (card total) |
| `nvenc_count` | number | Hardware video encoder units (card total) |
| `nvdec_count` | number | Hardware video decoder units (card total) |

### URL-Persisted State (`src/store/urlStorage.ts` — `PersistedState`)

| Field | Type | Default |
|---|---|---|
| `selectedGpuId` | string \| null | null |
| `selectedSeries` | string[] | ['Q'] |
| `pcieSlotsPerHost` | number | 8 |
| `gpuCountPerHost` | number | 4 |
| `hostCount` | number | 8 |
| `vmTarget` | number | 100 |
| `workloadType` | string | 'knowledge_worker' |
| `clusterType` | string | 'vdi' |
| `capacitySeries` | string | 'B' |
| `capacityVramGb` | number | 4 |

---

## 9. Platform Coverage

| | ESXi / vSphere | Nutanix AHV | OpenShift Virtualization |
|---|---|---|---|
| **Omnissa Horizon** | ✅ Full vGPU | ✅ GA (Horizon 2512) | ✅ Manual pools GA; vGPU ✅ |
| **Citrix VAD / DaaS** | ✅ Full vGPU | ✅ GA — vGPU GA | ✅ GA (VAD 2511+); GPU/SR-IOV 🔄 |
| **Microsoft AVD / RDS** | ✅ (on-prem RDS only) | ❌ | ❌ |

See `docs/sizing-reference.md` for full limits and sources.

---

## 10. Success Metrics

| Metric | Target |
|---|---|
| Accurate density calculation vs manual calculation | 100% match |
| All 14 unit tests pass | 100% |
| Build deploys to GitHub Pages on push to main | Automated |
| Languages available | 4 (EN, FR, DE, IT) |
| GPUs in catalog | 18 |
| Cluster types supported | 4 (VDI, vSphere 8, vSphere 9, OCP) |

---

## 11. Out-of-Scope / Future Considerations

- **vGPU driver version awareness** — profile availability changes across driver versions
- **MIG support** — multi-instance GPU partitioning (Ampere+)
- **NVSwitch / NVLink topologies** — multi-GPU high-speed interconnects
- **Export-controlled GPU variants** — L2, A800, H800 specs are approximate
- **Cost-per-VM analysis** — GPU capex divided by VM count
- **Saved configurations** — persist multiple sizing scenarios
- **PDF export** — dedicated PDF generation (vs browser print)
- **Nutanix AHV cluster type** — 32-node max (same as VDI slot); not differentiated
- **N+1 HA headroom** — tool shows raw capacity; admins must apply their own overhead factor
