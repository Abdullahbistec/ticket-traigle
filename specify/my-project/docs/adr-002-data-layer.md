# ADR-002 — Data layer: Prisma + SQLite

**Status:** Accepted · **Date:** 2026-06-16

## Context

We need persistence for a single `Ticket` entity, a clean migration story, and a
typed client so the "zero `any`" NFR holds end to end. The dataset is small
(tens of tickets) and runs locally and in CI without external infrastructure.
The training stack fixes Prisma + SQLite.

## Decision

Use **Prisma ORM** with a **SQLite** datasource (`file:./dev.db`). Prisma
generates a fully typed client from `schema.prisma`; migrations are versioned;
the database is a single file that needs no server in dev or CI.

Because **SQLite has no native enum type**, `priority` and `status` are stored as
`String` and constrained by Zod (`src/lib/validation.ts`) at every write path
(seed and PATCH). The narrow union types are reconstructed once, at the read
boundary in `src/server/routes/tickets.ts`.

## Consequences

- One typed client shared by the dashboard and the API; model changes surface as
  type errors, supporting the zero-`any` goal.
- SQLite needs no container, so CI just needs `prisma generate` + a migration —
  helping the < 3-minute CI target.
- Enum-like fields are only as safe as the Zod layer in front of them; validation
  is therefore non-optional on writes.
- Swapping to Postgres later is a datasource + migration change, not an
  application rewrite (Prisma abstracts the client).

## Rejected alternatives

- **`better-sqlite3` with hand-written SQL.** Rejected: fast, but we'd hand-roll
  types and migrations and lose the typed client that underpins the zero-`any`
  NFR.
- **Postgres in Docker.** Rejected for this milestone: operationally heavier in
  dev and CI than the dataset warrants; revisit when concurrency or multi-user
  access is real.
