# ADR-001: Framework — Next.js 15 App Router

**Status:** Accepted  
**Date:** 2026-06-16

## Context

The PMO ticket triage tool needs a full-stack TypeScript framework that can:
- Serve a server-rendered dashboard with grouped ticket views
- Expose a JSON API (GET + PATCH) from the same codebase
- Run in CI without a separate server process
- Be maintained by Bistec trainees familiar with React

## Decision

Use **Next.js 15 App Router**.

- Server components render the dashboard with zero client JS on first load (FR-1, FR-2)
- Route Handlers at `app/api/...` serve the JSON API (FR-4, FR-5)
- Single `pnpm build` produces both UI and API — one deployment unit
- `experimental.typedRoutes: true` gives compile-time route safety

## Alternatives Rejected

| Option | Reason rejected |
|--------|----------------|
| Express + React SPA | Two repos, two deployments, double the boilerplate |
| Remix 2 | Smaller Bistec team familiarity; fewer training examples |
| tRPC + Next | Adds abstraction layer unnecessary for 2 endpoints |

## Consequences

**Positive:**
- Single monorepo, single CI job
- Server components keep initial render fast (NFR: <1.5s)
- Strong TypeScript support out of the box

**Negative:**
- Tied to Next.js/Vercel conventions
- App Router learning curve for trainees used to Pages Router
- `typedRoutes` is experimental — may break on Next.js minor bumps
