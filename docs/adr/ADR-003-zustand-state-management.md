# ADR-003 — Zustand for Client State Management

**Date:** 2026-02-25
**Status:** Accepted
**Deciders:** fjacquet

---

## Context

The app has a single shared configuration state (selected GPU, series filter, deployment params, active tab) that is read by multiple unrelated components across the component tree. State changes in the sidebar (GPU selection, slot count) must immediately update the output panels.

## Decision

Use **Zustand 5** with the `subscribeWithSelector` middleware as the single client state manager.

```typescript
export const useConfigStore = create<ConfigState>()(
  subscribeWithSelector((set) => ({ ... }))
);
```

`subscribeWithSelector` enables the URL persistence subscription (ADR-002) without re-rendering the component tree.

## Consequences

**Positive**
- Minimal boilerplate vs Redux — store defined in a single file (`src/store/configStore.ts`)
- No Provider wrapper required — components call `useConfigStore()` directly
- `subscribeWithSelector` allows external subscribers (URL persistence) without coupling to React render cycle
- Excellent TypeScript inference — no action type unions required
- Tiny bundle footprint (~3 kB gzip)

**Negative**
- Less structured than Redux Toolkit — no enforced action pattern (acceptable for this app's scale)
- No Redux DevTools integration out of the box (can be added via `zustand/middleware` if needed)
- Global singleton store makes unit testing components slightly more involved (must reset store between tests)

## Alternatives Considered

| Option | Reason Rejected |
|---|---|
| React Context + `useReducer` | Causes full subtree re-renders on every state change; verbose for many fields |
| Redux Toolkit | Significantly more boilerplate for this app's small, flat state shape |
| Jotai / Recoil | Atom model adds complexity; Zustand's flat store matches the config object shape directly |
| `useState` prop drilling | Impractical — sidebar and output panels are siblings, not parent/child |
