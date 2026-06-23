# S-004 — API: GET /tickets

**As a** dashboard (and future integrations) **I want** a JSON endpoint of
grouped tickets **so that** clients don't reimplement grouping.

Implements: FR-4 · Tasks: T5, T6

## Acceptance criteria
- **Given** the API is running, **when** I call `GET /api/tickets`, **then** I
  receive valid JSON shaped as `{ groups, counts, total }`.
- **Given** seeded data, **when** I call the endpoint, **then** only `open`
  tickets are included and p95 latency is < 150ms.
