# S-001 — List open tickets from a JSON seed

**As a** PMO coordinator **I want** the dashboard to load tickets from a seed
file **so that** I control the data without touching a database console.

Implements: FR-1 · Tasks: T1, T2

## Acceptance criteria
- **Given** `prisma/seed-data/tickets.json` is loaded via `pnpm db:seed`,
  **when** I open `/tickets`, **then** all `open` tickets appear and `closed`
  tickets do not.
- **Given** the seed file, **when** it is re-run, **then** the result is
  identical (idempotent reseed).
