# Task Completion Protocol

After every code change:
1. `npm run typecheck` — must be clean
2. `npm run lint` — must be clean (zero warnings)
3. `npm test` — all 14 tests must pass
4. `npm run build` — must succeed

If adding new UI text: add translation key to all 4 locale files (en/fr/de/it common.json).
If modifying GPU data: update both `src/data/gpus.json` AND `src/types/gpu.ts` GpuCard interface.
If modifying density formulas: update tests in `tests/` to match.

Commit to `main` → CI auto-deploys to https://fjacquet.github.io/vgpu-advisor/
