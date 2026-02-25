# ADR-004 — Biome for Linting and Formatting

**Date:** 2026-02-25
**Status:** Accepted
**Deciders:** fjacquet

---

## Context

The project needs consistent code formatting and static analysis. The standard React/TypeScript stack typically uses ESLint + Prettier, which requires two separate tools, multiple plugins, and configuration that can conflict (especially around formatting rules).

## Decision

Use **Biome** as the single tool for both linting and formatting, replacing ESLint + Prettier.

Configuration: `biome.json` at project root. Disabled rule: `noSvgWithoutTitle` (inline SVG icons in header/UI do not need accessible titles for this admin tool context).

CI step: `npm run lint` runs `biome check src` — fails on any lint or format violation.

## Consequences

**Positive**
- Single tool, single config file — no ESLint/Prettier conflict risk
- Significantly faster than ESLint (Rust-based, ~10–35 ms on this codebase vs hundreds of ms)
- Format and lint in one pass: `biome check --write` both formats and fixes
- No plugin ecosystem fragmentation — Biome ships all rules in one package

**Negative**
- Smaller rule ecosystem than ESLint — some specialised plugins (e.g., `eslint-plugin-react-hooks`) have no Biome equivalent yet
- Less community adoption — fewer Stack Overflow answers; less IDE-specific documentation
- `noSvgWithoutTitle` must be explicitly disabled — Biome's defaults are stricter than ESLint's

## Alternatives Considered

| Option | Reason Rejected |
|---|---|
| ESLint + Prettier | Two tools, frequent version conflicts, slower, more config files |
| ESLint only (no Prettier) | Inconsistent formatting without a dedicated formatter |
| oxlint | Even newer/less complete than Biome at time of decision |
