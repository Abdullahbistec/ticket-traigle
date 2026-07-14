# Ticket Triage Dashboard

PMO internal tool. Lightweight ticket triage dashboard built spec-first with Next.js 15, Prisma + SQLite, TypeScript strict, Tailwind.

## Quick start

```bash
pnpm install
cp .env.example .env
pnpm db:migrate        # creates prisma/dev.db
pnpm db:seed           # loads 7 seed tickets
pnpm dev               # http://localhost:3000
```

## Checks

```bash
pnpm lint              # ESLint strict
pnpm typecheck         # tsc --noEmit
pnpm test              # Vitest (8 smoke tests)
pnpm build             # Next.js production build
pnpm check             # all four in sequence
```

## API

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/tickets` | All tickets, grouped by priority |
| PATCH | `/api/tickets/:id` | Update priority / owner / status |

### PATCH body (all optional)

```json
{ "priority": "P0", "owner": "engineering", "status": "IN_PROGRESS" }
```

## Regenerate with Claude Code

```bash
claude "Read docs/spec/prd.md and speckit.yaml. \
  Execute each task in order, files listed per task. \
  Do not add fields, routes, or components not in the PRD."
```

## Stack

- **Next.js 15** App Router (server components, no client state)
- **TypeScript** strict + `noUncheckedIndexedAccess`
- **Prisma 5** + SQLite
- **Zod** for API input validation
- **Tailwind CSS 3**
- **Vitest** for unit/smoke tests
- **GitHub Actions** CI (lint → typecheck → test → build)

## Project structure

```
src/
  app/
    api/tickets/route.ts         GET /api/tickets
    api/tickets/[id]/route.ts    PATCH /api/tickets/:id
    tickets/page.tsx             Dashboard UI
    layout.tsx
    globals.css
  lib/db.ts                      Prisma singleton
  types/ticket.ts                Zod schemas + type exports
prisma/
  schema.prisma
  seed.ts
tests/
  smoke.test.ts                  8 Vitest tests (no DB needed)
docs/spec/
  prd.md
  adr-001-framework.md
  adr-002-data-layer.md
speckit.yaml                     Agent-executable task plan
```
