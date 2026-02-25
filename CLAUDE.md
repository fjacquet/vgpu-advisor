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
```

Run a single test file:
```bash
npx vitest run src/engines/densityEngine.test.ts
```

## Architecture

### Data Flow
1. `src/data/gpus.json` — static GPU catalog (18 cards with per-series profile size arrays)
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

## Deployment

Push to `main` → GitHub Actions runs typecheck → lint → test → build → GitHub Pages deploy. The Vite `base` is `/vgpu-advisor/` — all asset paths must account for this.
