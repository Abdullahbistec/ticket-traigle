# S-002 — Tag a ticket with priority and owner

**As a** PMO coordinator **I want** to set a ticket's priority and owner **so
that** the board reflects who is accountable and how urgent it is.

Implements: FR-2 · Tasks: T3, T5, T7

## Acceptance criteria
- **Given** a ticket id, **when** I `PATCH /api/tickets/:id` with
  `{ "priority": "P0" }`, **then** the ticket's priority becomes P0.
- **Given** a ticket id, **when** I PATCH `{ "owner": "Ruwan Silva" }`, **then**
  the owner is updated.
- **Given** an invalid value (e.g. `priority: "P9"`), **when** I PATCH, **then**
  the response is 400 and nothing is written.

> UI affordance for inline editing is a fast-follow; this story is satisfied at
> the API layer for the scaffold.
