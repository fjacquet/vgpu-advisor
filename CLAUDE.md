# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**vGPU Advisor** — a static React app for calculating NVIDIA vGPU profile density in Omnissa Horizon deployments. Deployed to GitHub Pages at `https://fjacquet.github.io/vgpu-advisor/`.

## Commands

```bash
npm run dev          # Local dev server (Vite)
npm run build        # TypeScript compile + Vite production build
npm run typecheck    # TypeScript check only (no emit)
npm run lint         # Biome linter check
npm run format       # Biome auto-format (writes files)
npm test             # Vitest unit tests (single run)
npm run test:watch   # Vitest in watch mode
npm run test:run     # Vitest single run (alias used by CI)
```

Run a single test file:
```bash
npx vitest run src/engines/densityEngine.test.ts
```

## Architecture

### Data Flow
1. `src/data/gpus.json` — static GPU catalog (per-series profile size arrays + `architecture` for the generation filter)
2. `src/engines/densityEngine.ts` — pure calculation functions (no side effects, fully tested)
3. `src/store/configStore.ts` — Zustand store; state auto-serializes to URL hash via `lz-string`
4. `src/hooks/` — React hooks bridging store + engine (`useDensityCalc`, `useFilteredProfiles`)
5. `src/components/` — UI components split into `layout/`, `inputs/`, `outputs/`, `common/`

### Layout Structure
- `App.tsx` — root: `<Header>` + `<Cockpit>` (screen) + `<PrintView>` (print-only)
- `Cockpit` — two-panel layout: `InputSidebar` (left, fixed width) + `OutputDashboard` (right, flex)
- `InputSidebar` — GPU selector, series filter, deployment config panels
- `OutputDashboard` — tabbed view: profiles grid, density bar chart, recommendations, config snippet

### Key Engine Functions (`densityEngine.ts`)
- `deriveProfile(gpu, series, vramGb)` → `VgpuProfile` — builds profile metadata + Horizon string (e.g. `nvidia_l40s-4q`)
- `getProfilesForGpu(gpu, seriesFilter?)` → `VgpuProfile[]`
- `calculateDensity(input)` → `DensityResult` — core density math
- `getRecommendations(gpu, workloadType, slots, hosts)` → top-3 `RecommendationResult[]`
- `reverseCapacityPlan(gpu, ...)` / `reverseCapacityPlanAllGpus(gpus, ...)` — **capacity mode**: reverse sizing (given a VM target, compute hosts/cards needed); powers the Capacity Plan tab

### Two Modes
- **Density mode** (a GPU is selected): forward calc — how many VMs fit. Driven by `selectedGpuId`/`selectedSeries`.
- **Capacity mode** (no GPU selected): reverse calc — hosts/cards needed for `vmTarget`. Driven by `capacitySeries`, `capacityVramGb`, `capacityArchitectures` (GPU-generation filter), and pod/superpod inputs (`maxVmsPerPod`, `podsPerSuperpod`). UI: `CapacityFilterPanel` (input) + `CapacityPlanTable` (output tab).

### Density Formulas
```
maxCardsPerHost = min(floor(pcieSlotsPerHost / slot_width), ceil(gpuCountPerHost / gpuCountPerCard))
totalGpusPerHost = maxCardsPerHost × gpuCountPerCard
instancesPerGpu = floor(vramPerGpu / profile.vram_gb)
instancesPerHost = instancesPerGpu × totalGpusPerHost
instancesPerCluster = instancesPerHost × hostCount
```

### Profile Series
| Series | License | Use Case |
|--------|---------|----------|
| Q | NVIDIA vWS | Professional workstation, CAD/3D |
| B | NVIDIA vPC | Knowledge worker, office |
| A | NVIDIA vCS | Compute, AI inference |
| C | NVIDIA vCS | Headless compute, ML training |

## Key Conventions

- **Linter**: Biome with `noSvgWithoutTitle` disabled (icon SVGs don't need titles)
- **Formatting**: 2-space indent, single quotes, ES5 trailing commas
- **TypeScript**: Strict mode; prefer `type` imports (`import type`)
- **State persistence**: Only `configStore` state (not `activeTab`) serializes to URL hash — `loadFromUrl`/`saveToUrl` in `src/store/urlStorage.ts`
- **i18n**: 4 locales (en/fr/de/it) in `src/i18n/locales/`; use `useTranslation()` hook in components
- **Profile ID format**: `{gpuId}-{size}{series_lower}` e.g. `l40s-4q`; parsed with regex `/^.+-(\d+)([qbac])$/`

## CI/CD

All workflows delegate to the central reusable workflows in `fjacquet/ci@v1` (thin callers in `.github/workflows/`):
- `ci.yml` → `web-ci.yml` — typecheck/lint/test/build on push/PR to `main`
- `security.yml` → `web-security.yml` — CodeQL + OSV scan
- `deploy.yml` → `web-deploy.yml` — GitHub Pages deploy on push to `main`
- `release.yml` → `web-release.yml` — **triggered by pushing a `v*` tag**: GitHub Release (dist archives + CycloneDX SBOM + SHA256SUMS + SLSA build-provenance attestation) + Docker image to ghcr.io. `publish-npm` is on (this repo is a published package); the caller grants `contents`/`packages`/`id-token`/`attestations: write`.

To cut a release: bump `package.json` version, then push a `v<version>` tag. The Vite `base` is `/vgpu-advisor/` — all asset paths must account for this.
