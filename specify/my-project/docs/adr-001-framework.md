# ADR-001 — Framework: Next.js 15 (App Router)

**Status:** Accepted · **Date:** 2026-06-16

## Context

The PMO tool needs a server-rendered dashboard (fast first paint, reads straight
from the database) and a small JSON API in the same deployable unit, owned by one
person, on a tight timebox. The training stack also fixes Next.js 15 App Router.

## Decision

Use **Next.js 15 with the App Router**. The dashboard is a React Server
Component that queries the database directly; the API lives in route handlers
under `src/app/api/`, with the reusable logic in `src/server/routes/`. One
project, one build, one deploy.

## Consequences

- Server Components render the board with no client-side data fetching, which
  helps the < 1.5s first-render target.
- API and UI share types and the Prisma client — no duplicated contracts.
- The dashboard page and the ticket API can't share the `/tickets` path (a
  segment can't be both a page and a route), so the API is namespaced under
  `/api/tickets`. Documented in the README.
- Some App Router edges must be respected — e.g. dynamic route `params` is async
  in Next 15 and must be awaited.

## Rejected alternatives

- **Separate React SPA + standalone Express API.** Rejected: two repos/builds to
  deploy and a hand-maintained client/server contract, for no benefit at this
  size.
- **Remix.** Rejected: capable and a fine fit, but it is outside the fixed
  training stack and adds nothing the App Router doesn't already give us here.
