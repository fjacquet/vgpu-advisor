# Changelog

All notable changes to vGPU Advisor are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.1.0] — 2026-02-25

### Added

#### Application
- Static React 19 + TypeScript 5 (strict) single-page application
- Vite 7 build toolchain with base path `/vgpu-advisor/` for GitHub Pages
- Tailwind CSS 4 via `@tailwindcss/vite` plugin
- GitHub Actions CI/CD pipeline: typecheck → lint → test → build → deploy to GitHub Pages

#### GPU Catalog (`src/data/gpus.json`)
- 18 NVIDIA GPU cards across 6 architectures: Blackwell, Ada Lovelace, Ampere, Turing, Volta, Maxwell
- Cards: RTX PRO 6000 Blackwell, L40S, L40, L4, L2, RTX 5000 Ada, RTX 5880 Ada, RTX 6000 Ada, A2, A10, A16, A40, RTX A5000, RTX A5500, RTX A6000, T4, V100, M10
- Performance fields per GPU: `fp32_tflops`, `memory_bandwidth_gbps`, `cuda_cores`, `nvenc_count`, `nvdec_count`
- Multi-GPU card support (A16: 4× GA107, M10: 4× Maxwell) with aggregate card totals

#### Density Engine (`src/engines/densityEngine.ts`)
- Pure calculation functions with no side effects
- `deriveProfile(gpu, series, vramGb)` — builds a `VgpuProfile` from GPU + series + VRAM
- `getProfilesForGpu(gpu, seriesFilter?)` — returns filtered profile list
- `calculateDensity(input)` — computes VMs/GPU, VMs/host, VMs/cluster, framebuffer utilisation
- `getRecommendations(gpu, workloadType, slots, hosts)` — scores and ranks top 3 profiles
- 14 unit tests (Vitest) covering T4 single-width, L40S double-width, A16 multi-GPU topologies

#### UI — Cockpit Layout
- **InputSidebar** — GPU selector, profile series filter, deployment config panel
- **OutputDashboard** — tabbed output: Profiles, Density, Recommendations, Config Snippet
- **GpuSelectorPanel** — grouped GPU list by architecture with search
- **ProfileFilterPanel** — toggle filter for Q / B / A / C series
- **DeploymentPanel** — PCIe slots/host, host count, VM target, workload type
- **ProfileGrid** — card grid with framebuffer utilisation bar and copy button
- **DensityBar** — summary stat cards + Recharts bar chart (VMs/cluster by profile)
- **RecommendationCard** — ranked top-3 profiles with reasoning bullets
- **HorizonConfigSnippet** — generated `graphic-profiles.properties` with copy button

#### Internationalisation
- `i18next` + `react-i18next` + `i18next-browser-languagedetector`
- **English (EN)** — default locale
- **French (FR)** — full translation
- **German (DE)** — full translation
- **Italian (IT)** — full translation
- 4-language `<select>` dropdown in header (replaced binary EN↔FR toggle)

#### Share Feature
- URL hash state persistence via `lz-string` + `Zustand` `subscribeWithSelector`
- Full configuration encoded in URL: GPU, series filter, slots, host count, workload
- Share button copies current URL to clipboard with confirmation feedback

#### Print Output
- `@media print` CSS: hides header and sidebar, shows `.print-only` content
- `PrintView` component renders all 4 output sections as compact tables (no charts)
- Sections: config summary, available profiles, VM density, recommendations, Horizon snippet
- Print button (🖨) in header calls `window.print()`

#### State Management
- Zustand 5 store (`src/store/configStore.ts`) with `subscribeWithSelector` middleware
- URL serialisation/deserialisation in `src/store/urlStorage.ts`

### Technical

- Biome for linting and formatting (zero warnings on all 33 source files)
- TypeScript strict mode with `noEmit` typecheck step
- All density calculations verified against manual calculations for 3 representative GPU topologies

---

[Unreleased]: https://github.com/fjacquet/vgpu-advisor/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/fjacquet/vgpu-advisor/releases/tag/v0.1.0
