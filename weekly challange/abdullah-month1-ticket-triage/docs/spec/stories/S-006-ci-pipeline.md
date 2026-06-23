# S-006 — CI passes lint, typecheck, smoke test, and build

**As a** maintainer **I want** CI to gate every PR **so that** broken or untyped
code never reaches `main`.

Implements: FR-5 · Tasks: T9

## Acceptance criteria
- **Given** a pull request, **when** CI runs, **then** ESLint (0 errors),
  `tsc --noEmit` (0 errors), Vitest (≥1 passing test), and `next build` (exit 0)
  all pass.
- **Given** a failing check, **when** CI completes, **then** the merge is blocked.
- **Given** repeated runs, **when** CI executes, **then** end-to-end time is
  < 3 minutes (pnpm + Next build caching).
