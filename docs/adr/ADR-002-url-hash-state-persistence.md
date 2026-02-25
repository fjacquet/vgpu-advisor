# ADR-002 — URL Hash State Persistence with lz-string

**Date:** 2026-02-25
**Status:** Accepted
**Deciders:** fjacquet

---

## Context

Users need to share a specific vGPU configuration (GPU model, profile filter, host topology, workload type) with colleagues or save it as a bookmark. The app has no backend, so persistence must happen client-side.

The configuration state is a small object (~7 fields). URLs must remain copyable and shareable via email or chat.

## Decision

Encode the full configuration state as a **JSON object compressed with lz-string and stored in the URL hash** (`window.location.hash`).

```
https://fjacquet.github.io/vgpu-advisor/#N4IgZglgNgpgziAXKCA...
```

Implementation:
- `src/store/urlStorage.ts` — `saveToUrl(state)` / `loadFromUrl()` using `lz-string` `compressToEncodedURIComponent` / `decompressFromEncodedURIComponent`
- Zustand `subscribeWithSelector` triggers `saveToUrl` on any state change
- On app init, `loadFromUrl()` seeds the initial store state

## Consequences

**Positive**
- Zero backend required for sharing
- Instant save/restore — no user action needed beyond copying the URL
- Survives browser refresh
- State is versioned implicitly via URL (old links stay valid)

**Negative**
- Hash changes do not trigger browser navigation history entries (intentional — avoids cluttering history)
- Compressed hash is opaque — not human-readable
- If the state schema changes incompatibly, old URLs silently fall back to defaults (acceptable for a calculator tool)
- Very large states (unlikely for this app) could exceed URL limits in some browsers

## Alternatives Considered

| Option | Reason Rejected |
|---|---|
| `localStorage` | Not shareable — state stays on one device/browser |
| `sessionStorage` | Same problem; also lost on tab close |
| Query string (uncompressed) | Readable but URL becomes very long; breaks in email clients |
| Server-side session store | Requires a backend — violates ADR-001 |
