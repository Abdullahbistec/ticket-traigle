# S-005 — API: PATCH /tickets/:id with Zod validation

**As a** client **I want** a validated update endpoint **so that** bad input is
rejected before it reaches the database.

Implements: FR-4, FR-2 · Tasks: T3, T5, T7

## Acceptance criteria
- **Given** a valid body, **when** I `PATCH /api/tickets/:id`, **then** the
  ticket is updated and the updated ticket is returned as JSON.
- **Given** an empty body `{}`, **when** I PATCH, **then** the response is 400
  with a message that at least one field is required.
- **Given** an unknown id, **when** I PATCH, **then** the response is 404.
- **Given** any invalid field, **when** I PATCH, **then** no partial write occurs.
