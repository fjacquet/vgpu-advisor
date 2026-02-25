# Suggested Commands

## Development
```bash
npm run dev          # local dev server
npm run build        # TypeScript check + Vite production build
npm run preview      # preview production build locally
```

## Code Quality
```bash
npm run typecheck    # TypeScript check only (tsc --noEmit)
npm run lint         # Biome check src (must pass in CI)
npm run format       # Biome format --write src (auto-fix)
```

## Testing
```bash
npm test             # Vitest run (14 unit tests on densityEngine)
npm run test:watch   # Vitest watch mode
```

## Git / Deploy
```bash
git push origin main                         # triggers CI → GitHub Pages deploy
gh run list --repo fjacquet/vgpu-advisor     # check workflow runs
```

## Task Completion Checklist
1. `npm run typecheck` — no TS errors
2. `npm run lint` — no Biome errors
3. `npm test` — all 14 tests pass
4. `npm run build` — clean build
