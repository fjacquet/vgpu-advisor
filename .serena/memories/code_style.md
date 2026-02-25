# Code Style & Conventions

## Formatting (Biome)
- Indent: 2 spaces
- Quotes: single quotes for JS/TS
- Trailing commas: ES5 style
- Organize imports: enabled (Biome auto-sorts)
- `noSvgWithoutTitle`: disabled (inline SVG icons)

## TypeScript
- Strict mode enabled
- No `any` types
- Pure functions preferred for engine logic (no side effects)
- Interfaces over type aliases for object shapes

## React
- Functional components only
- `useTranslation()` hook for all UI text
- Zustand `useConfigStore()` for shared state — no prop drilling
- `no-print` className on elements hidden during print
- `print-only` className on elements visible only during print

## Naming
- Files: PascalCase for components (e.g. `ProfilePanel.tsx`), camelCase for utilities
- Variables/functions: camelCase
- Types/interfaces: PascalCase
- Constants: UPPER_SNAKE_CASE (e.g. `SERIES_INFO`, `ARCHITECTURE_ORDER`)
- i18n keys: dot-notation nested (e.g. `nav.profiles`, `deployment.slots`)
