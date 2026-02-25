# ADR-006 — Internationalisation with i18next

**Date:** 2026-02-25
**Status:** Accepted
**Deciders:** fjacquet

---

## Context

vGPU Advisor targets administrators in multinational organisations. French-speaking (Switzerland, France, Belgium, Canada) and German/Italian-speaking (DACH, Switzerland) Horizon admins are a significant part of the target audience. UI text should be available in their preferred language without requiring separate app deployments.

## Decision

Use **i18next** + **react-i18next** + **i18next-browser-languagedetector** for internationalisation.

- Translation files: `src/i18n/locales/{en,fr,de,it}/common.json`
- All 96 UI text keys translated into EN, FR, DE, IT
- Language auto-detected from browser `Accept-Language` header on first load
- Fallback language: `en`
- User can override via `<select>` dropdown in the header

## Consequences

**Positive**
- Industry-standard i18n library with excellent React integration
- Browser language detection works without any server involvement
- Adding a new language requires only a new JSON file + one import line
- `useTranslation()` hook is ergonomic; all components access translations uniformly
- TypeScript-safe key lookup (with appropriate i18next TS plugin if desired)

**Negative**
- All 4 locale files are bundled together (~63 kB gzip for the i18n chunk) — acceptable for this app
- Translation maintenance is manual — no translation management platform (TMS) is used; keys can drift
- `i18next-browser-languagedetector` may not detect language correctly if `navigator.language` is not set (rare in modern browsers)
- No plural form support implemented yet (not required for current UI text)

## Languages Supported

| Code | Language | Coverage |
|---|---|---|
| `en` | English | 100% (source language) |
| `fr` | French | 100% |
| `de` | German | 100% |
| `it` | Italian | 100% |

## Alternatives Considered

| Option | Reason Rejected |
|---|---|
| `react-intl` (FormatJS) | More complex API for the same outcome; better suited for ICU message format heavy apps |
| Custom `t()` function + JSON | Would need to re-implement language detection and fallback — reinventing i18next |
| Separate deployments per language | Operational overhead; no single shareable URL across languages |
| No i18n (English only) | Excludes significant portion of target audience |
