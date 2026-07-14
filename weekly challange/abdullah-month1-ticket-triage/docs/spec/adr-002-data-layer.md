# ADR-002: Data Layer — Prisma + SQLite

**Status:** Accepted  
**Date:** 2026-06-16

## Context

The scaffold needs a typed ORM and database that:
- Runs in CI with no external infrastructure
- Generates TypeScript types from the schema
- Supports migrations committed to the repo
- Can be swapped to Postgres in Month 2 without a schema rewrite

## Decision

Use **Prisma 5** as the ORM with **SQLite** as the database for Month 1.

- `prisma/schema.prisma` is the single source of truth for the data model
- `prisma migrate dev` handles local migrations; CI runs `prisma generate` only
- SQLite file at `prisma/dev.db` (gitignored) keeps setup to one command
- Moving to Postgres in Month 2 requires changing only the `datasource` block

## Alternatives Rejected

| Option | Reason rejected |
|--------|----------------|
| Prisma + PostgreSQL | Requires a running Postgres — adds infrastructure Month 1 doesn't need |
| Drizzle + SQLite | Migration tooling less mature; less Bistec team experience |
| Kysely | No schema-first codegen; type safety requires more manual work |

## Consequences

**Positive:**
- Zero infrastructure: `cp .env.example .env && pnpm db:migrate` and you're running
- Prisma generates typed client from schema — no `any` risk in DB layer
- Migrations are tracked in git

**Negative:**
- SQLite does not support concurrent writes — not suitable for multi-instance production
- Prisma Client size adds ~2 MB to the bundle (acceptable for an internal tool)
- Must remember to run `prisma generate` in CI before `next build`
