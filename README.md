# vGPU Advisor

**NVIDIA vGPU Profile Calculator for Omnissa Horizon**

A static, zero-backend single-page application that helps Horizon administrators
calculate vGPU profile options, VM density, and deployment recommendations for
NVIDIA vGPU-enabled ESXi hosts.

**Live app:** https://fjacquet.github.io/vgpu-advisor/

---

## Features

- **GPU Catalog** — 18 NVIDIA GPUs from T4/M10 through RTX PRO 6000 Blackwell, with
  VRAM, CUDA cores, FP32 TFLOPs, memory bandwidth, NVENC/NVDEC counts
- **Profile Explorer** — all Q/B/A/C-series vGPU profiles derived automatically from
  each GPU's VRAM configuration
- **Density Calculator** — VMs per GPU, per host, and per cluster based on PCIe slot
  count, card width, and GPU count per card
- **Workload Recommendations** — top-3 profiles ranked for Workstation, Knowledge
  Worker, or Compute workloads
- **Horizon Config Snippet** — ready-to-paste `graphic-profiles.properties` entries
- **Shareable URL** — full configuration serialised into the URL hash (lz-string
  compressed) so any config can be bookmarked or shared
- **Print / PDF export** — browser print produces a clean single-page report with all
  sections (no sidebar, no charts)
- **Multilingual UI** — English, French, German, Italian; language auto-detected from
  browser locale

---

## Supported GPUs

| Architecture | GPUs |
|---|---|
| Blackwell | RTX PRO 6000 Blackwell |
| Ada Lovelace | L40S · L40 · RTX 6000 Ada · RTX 5880 Ada · RTX 5000 Ada |
| Ampere | A40 · RTX A6000 · RTX A5500 · A16 · RTX A5000 · A10 · A2 |
| Turing / Volta | L4 · L2 · T4 · V100 · M10 |

---

## Local Development

**Prerequisites:** Node.js 22+, npm 10+

```bash
git clone https://github.com/fjacquet/vgpu-advisor.git
cd vgpu-advisor
npm install
npm run dev          # http://localhost:5173/vgpu-advisor/
```

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript + Vite production build |
| `npm run preview` | Preview production build locally |
| `npm run typecheck` | TypeScript type check (no emit) |
| `npm run lint` | Biome lint check |
| `npm run format` | Biome auto-format (writes files) |
| `npm test` | Vitest unit tests (single run) |
| `npm run test:watch` | Vitest in watch mode |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript 5 (strict) |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| State | Zustand 5 + lz-string (URL hash persistence) |
| Charts | Recharts |
| i18n | i18next + react-i18next + i18next-browser-languagedetector |
| Linting | Biome (replaces ESLint + Prettier) |
| Tests | Vitest |
| Hosting | GitHub Pages (GitHub Actions CI/CD) |

---

## Project Structure

```
src/
├── App.tsx                        # Root: Header + Cockpit + PrintView
├── data/
│   └── gpus.json                  # Static GPU catalog (18 cards)
├── engines/
│   └── densityEngine.ts           # Pure calculation functions
├── store/
│   └── configStore.ts             # Zustand store + URL hash sync
├── types/
│   ├── gpu.ts                     # GpuCard, VgpuProfile, SERIES_INFO
│   └── results.ts                 # DensityInput, DensityResult, RecommendationResult
├── i18n/
│   └── locales/{en,fr,de,it}/
│       └── common.json            # Translation strings
└── components/
    ├── layout/                    # Header, Cockpit, PrintView
    ├── inputs/                    # GPU selector, series filter, deployment panels
    ├── outputs/                   # Profile grid, density chart, recommendations, config
    └── common/                    # Shared UI components
```

### Key Density Formulas

```
maxCardsPerHost    = floor(pcieSlotsPerHost / slot_width)
totalGpusPerHost   = maxCardsPerHost × gpu_count_per_card
instancesPerGpu    = floor(vram_per_gpu / profile.vram_gb)
instancesPerHost   = instancesPerGpu × totalGpusPerHost
instancesPerCluster = instancesPerHost × hostCount
```

---

## Architecture Decisions

See [`docs/adr/`](docs/adr/README.md) for the full set of Architecture Decision Records:

- [ADR-001](docs/adr/ADR-001-static-spa-no-backend.md) — Static SPA, no backend
- [ADR-002](docs/adr/ADR-002-url-hash-state-persistence.md) — URL hash state with lz-string
- [ADR-003](docs/adr/ADR-003-zustand-state-management.md) — Zustand for state management
- [ADR-004](docs/adr/ADR-004-biome-linting-formatting.md) — Biome for linting/formatting
- [ADR-005](docs/adr/ADR-005-static-gpu-catalog-json.md) — Static GPU catalog in JSON
- [ADR-006](docs/adr/ADR-006-i18n-react-i18next.md) — i18next for internationalisation

---

## Deployment

Every push to `main` triggers the GitHub Actions workflow:

1. TypeScript type check
2. Biome lint
3. Vitest unit tests
4. Vite production build
5. Deploy to GitHub Pages

---

## Adding a New GPU

1. Add an entry to `src/data/gpus.json` following the existing schema
2. No other changes required — profiles are derived automatically by the density engine
3. Run `npm run build` to verify no TypeScript errors

## Adding a New Language

1. Create `src/i18n/locales/<code>/common.json` with all keys translated
2. Add one import line and one resource entry in `src/i18n/index.ts`
3. Add the language option to the `LANGS` array in `src/components/layout/Header.tsx`

---

## License

Private. All rights reserved.
