# vGPU Advisor — Project Overview

## Purpose
Static React SPA deployed to GitHub Pages. Calculates NVIDIA vGPU profile options and VM density for Omnissa Horizon deployments.
URL: https://fjacquet.github.io/vgpu-advisor/

## Tech Stack
- React 19 + TypeScript 5 (strict)
- Vite 7 (base: '/vgpu-advisor/')
- Tailwind CSS 4 (@tailwindcss/vite plugin)
- Zustand 5 + lz-string (URL hash state persistence)
- Recharts (bar charts)
- i18next + react-i18next + i18next-browser-languagedetector (EN/FR/DE/IT)
- Biome 1.9 (linting + formatting — noSvgWithoutTitle disabled)
- Vitest (unit tests)

## Key Files
- `src/data/gpus.json` — GPU catalog (18 cards, vram, tflops, bandwidth, cuda_cores, nvenc, nvdec, per-series profile sizes)
- `src/engines/densityEngine.ts` — pure calculation functions (deriveProfile, getProfilesForGpu, calculateDensity, getRecommendations)
- `src/store/configStore.ts` — Zustand store with URL hash persistence
- `src/types/gpu.ts` — GpuCard, VgpuProfile, SERIES_INFO, ARCHITECTURE_ORDER
- `src/types/results.ts` — DensityInput, DensityResult, RecommendationResult
- `src/i18n/locales/{en,fr,de,it}/common.json` — i18n translation files
- `src/components/layout/` — Header, Cockpit, PrintView
- `src/components/inputs/` — Sidebar input controls
- `src/components/outputs/` — Profile, Density, Recommendation, Config tabs

## Folder Structure
```
src/
├── App.tsx, main.tsx, index.css
├── data/gpus.json
├── engines/densityEngine.ts
├── store/configStore.ts
├── types/{gpu,results}.ts
├── hooks/
├── i18n/locales/{en,fr,de,it}/common.json
└── components/
    ├── layout/   (Header, Cockpit, PrintView)
    ├── inputs/   (sidebar panels)
    ├── outputs/  (tab panels)
    └── common/
```

## Deployment
GitHub Actions (.github/workflows/static.yml): push to main → typecheck → lint → test → build → GitHub Pages
