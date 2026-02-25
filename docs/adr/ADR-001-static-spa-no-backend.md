# ADR-001 — Static SPA with No Backend

**Date:** 2026-02-25
**Status:** Accepted
**Deciders:** fjacquet

---

## Context

vGPU Advisor needs to be distributable to VDI architects, pre-sales engineers, and administrators — including those who work in air-gapped or highly restricted corporate networks. The tool performs pure calculations (no user data, no auth, no persistence beyond the URL) and reads from a static GPU catalog.

## Decision

Build a **fully static single-page application** with no backend, no API, and no database. Deploy exclusively to GitHub Pages.

All state lives in:
1. React component state / Zustand store (in-memory, per-session)
2. URL hash (cross-session sharing via lz-string compression)

## Consequences

**Positive**
- Zero hosting cost — GitHub Pages is free
- No authentication or infrastructure to maintain
- Trivially shareable: one URL encodes the full configuration
- Works offline after first load (browser cache)
- No CORS, no rate limiting, no server downtime risk
- CI/CD is a simple build + static upload

**Negative**
- No server-side analytics (must use client-side or accept none)
- GPU catalog updates require a code commit + deploy
- No saved workspaces or user history across devices
- URL length is bounded — extremely large states could exceed browser limits (mitigated by lz-string compression)

## Alternatives Considered

| Option | Reason Rejected |
|---|---|
| Next.js with API routes | Server overhead, more complex hosting, no benefit for pure calculation |
| Supabase / Firebase backend | Adds auth complexity, cost, and privacy concerns for a calculator tool |
| Electron desktop app | Distribution friction; no benefit over browser for this use case |
