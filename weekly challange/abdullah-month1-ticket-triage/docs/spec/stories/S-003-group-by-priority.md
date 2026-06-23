# S-003 — Group tickets by priority with count badges

**As a** PMO coordinator **I want** tickets grouped into P0/P1/P2 with counts
**so that** I can see at a glance where the urgent work is.

Implements: FR-3 · Tasks: T4, T8

## Acceptance criteria
- **Given** open tickets across priorities, **when** the dashboard renders,
  **then** each ticket appears under exactly one lane (P0, P1, P2).
- **Given** a lane, **when** it renders, **then** its badge equals the number of
  tickets in it.
- **Given** a lane with no tickets, **when** it renders, **then** the badge shows
  0 and an empty state is shown.
