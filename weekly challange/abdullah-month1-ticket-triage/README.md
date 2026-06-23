# PMO Ticket Triage

A lightweight triage dashboard for the Bistec PMO. Open tickets are seeded from a
JSON file, grouped into P0 / P1 / P2 lanes with count badges, and updated through
a Zod-validated API. Built **spec-first**: the spec in [`docs/spec/`](docs/spec/)
came before any code, and the whole scaffold is regenerable from it (see below).

**Stack:** Next.js 15 (App Router) · TypeScript (strict) · Prisma + SQLite ·
Tailwind v4 · Zod · Vitest.

## Prerequisites

- Node.js >= 20
- pnpm (`corepack enable`)
- No database server — SQLite is a local file.

## Run it

```bash
pnpm install
cp .env.example .env          # DATABASE_URL="file:./dev.db"
pnpm db:generate              # prisma generate
pnpm db:migrate               # creates + applies the initial SQLite migration
pnpm db:seed                  # loads prisma/seed-data/tickets.json
pnpm dev                      # http://localhost:3000  → redirects to /tickets
```

First-time `pnpm db:migrate` creates `prisma/migrations/` and `prisma/dev.db`.

## Scripts

| Script | Does |
|--------|------|
| `pnpm dev` | Next dev server |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm lint` | ESLint (strict, bans `any`) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest smoke tests |
| `pnpm db:generate` / `db:migrate` / `db:seed` | Prisma client / migration / seed |
| `pnpm setup` | generate + migrate + seed in one step |

## API

The dashboard lives at `/tickets`, so the API is namespaced under `/api`
(a route segment can't be both a page and a handler).

```bash
# List open tickets, grouped by priority with counts
curl http://localhost:3000/api/tickets

# Update a ticket's priority and/or owner (Zod-validated)
curl -X PATCH http://localhost:3000/api/tickets/<id> \
  -H 'content-type: application/json' \
  -d '{"priority":"P0","owner":"Nadia Perera"}'
```

Invalid input returns `400` with field errors; an unknown id returns `404`.

## Structure

```
docs/spec/        PRD, ADRs, user stories (the source of truth)
prisma/           schema.prisma, seed.ts, seed-data/tickets.json
src/app/tickets/  dashboard (server component)
src/app/api/      route handlers (thin) -> src/server/routes/tickets.ts
src/lib/          db client, priority helpers, Zod schemas
tests/            Vitest smoke tests
speckit.yaml      agent-executable task plan (T1..T9)
.github/workflows/ci.yml
```

## Regenerate from the spec (single command)

With Claude Code, from the repo root:

```bash
claude "Read docs/spec/prd.md, docs/spec/adr-001-framework.md, \
  docs/spec/adr-002-data-layer.md and speckit.yaml. \
  Execute the Speckit plan T1..T9 in order, writing only the files each task \
  lists. Do not add fields or endpoints beyond the PRD."
```

## Notes on the NFRs

- **Zero `any`:** enforced by `tsc` strict + ESLint `no-explicit-any`.
- **Validation:** every write goes through Zod (`src/lib/validation.ts`).
- **CI:** `.github/workflows/ci.yml` runs install → prisma generate → lint →
  typecheck → test → build, with pnpm and Next build caching.
