# Ticket Triage Tool — PRD

> Industry Readiness Program · Month 1 · Author: Abdullah
> Submission file. The same content lives in the repo under `docs/spec/`.

## 1. Persona

**Nadia Perera — PMO Coordinator, Bistec Global.**

Nadia runs intake and triage for the PMO. Across a working week she fields
project issues, change requests, and risks from delivery leads over Teams,
email, and side conversations. Her context: three to five active client
projects at any time, a 48-hour SLA to acknowledge anything urgent, and a
Monday steering call where she has to state, from memory, what is on fire.

**Pain point:** there is no single prioritised view. Urgent items (a blocked
contract, a double-booked PM) sit in the same undifferentiated inbox as
low-stakes formatting requests, so the genuinely critical ones surface late and
the weekly report is rebuilt by hand every time.

## 2. Problem Statement

The PMO currently triages tickets across at least three tools with no shared
priority list. Concretely, today:

- Intake is spread over Teams, email, and Jira comments — **no single source**.
- A P0 (delivery-blocking) item is **acknowledged in ~6 working hours on
  average**, against a 48-hour SLA that hides how slow the urgent path really is.
- The Monday status view is **reassembled manually each week (~30–40 min)** from
  scattered notes, and counts disagree between people.

The cost is missed-urgent risk and repeated manual reporting. This milestone
delivers the smallest thing that fixes the core gap: one prioritised, grouped
view backed by a validated API, seeded from a single file the PMO controls.

## 3. Goals & Non-Goals

**Goals (measurable)**
- One dashboard listing all open tickets grouped into P0/P1/P2 with a live count
  badge per group.
- Tickets seeded from a single JSON file the PMO owns (no DB console to load data).
- A ticket's priority and owner changeable through a validated API in one request.
- Initial dashboard render **< 1.5s on localhost**; API p95 **< 150ms** on seed data.

**Non-Goals (explicit)**
- No authentication or per-user accounts this milestone.
- No notifications, email, or real-time updates.
- No multi-project or portfolio roll-up; one flat ticket list.
- No comments/attachments/history (a `Comment` entity is a later story).
- No inline editing UI this milestone — tagging is exercised via the PATCH API;
  the dashboard edit affordance is a fast-follow story.

## 4. Functional Requirements

**FR-1 — List open tickets from a JSON seed**
- **Given** the seed file `prisma/seed-data/tickets.json` has been loaded,
- **When** Nadia opens `/tickets`,
- **Then** every ticket with `status = "open"` is shown and closed tickets are excluded.

**FR-2 — Tag a ticket with priority (P0/P1/P2) and owner**
- **Given** an existing ticket id,
- **When** a `PATCH /api/tickets/:id` request sets `priority` and/or `owner`,
- **Then** the stored ticket reflects the new values and the dashboard shows it in
  the matching priority group on next load.

**FR-3 — Group by priority with count badges**
- **Given** open tickets across more than one priority,
- **When** the dashboard renders,
- **Then** tickets appear under exactly one of three lanes (P0, P1, P2), each lane
  shows a numeric badge equal to its count, and an empty lane shows a zero badge
  and an empty state.

**FR-4 — API exposes GET /tickets and PATCH /tickets/:id with Zod-validated input**
- **Given** the API is running,
- **When** `GET /api/tickets` is called,
- **Then** it returns valid JSON with tickets grouped by priority plus counts;
- **And when** `PATCH /api/tickets/:id` receives a body,
- **Then** the body is Zod-validated and invalid input returns HTTP 400 with field
  errors and no write.

**FR-5 — PR passes GitHub Actions lint + build + smoke test**
- **Given** a pull request to `main`,
- **When** CI runs,
- **Then** ESLint, `tsc --noEmit`, Vitest (≥1 test), and `next build` all pass, and
  a red check blocks merge.

## 5. Non-Functional Requirements

| Area | Target |
|------|--------|
| Performance — page | Initial render of `/tickets` **< 1.5s** on localhost with seed data |
| Performance — API | `GET /api/tickets` p95 **< 150ms** on seed data |
| Type safety | **Zero `any`** types; `tsc --noEmit` and ESLint `no-explicit-any` both clean |
| Security | All PATCH input Zod-validated; invalid input rejected with 400 and no write; no secrets committed |
| Observability | Each API request logs method, path, status, and duration (one structured line) |
| Process | Conventional Commits; all commits signed; **CI end-to-end < 3 min** |

## 6. Architecture Decision Records

### ADR-001 — Framework: Next.js 15 (App Router)

**Status:** Accepted

**Context.** The PMO tool needs a server-rendered dashboard (fast first paint,
reads straight from the database) plus a small JSON API in the same deployable
unit, owned by one person, on a tight timebox. The training stack fixes Next.js
15 App Router.

**Decision.** Use Next.js 15 with the App Router. The dashboard is a React Server
Component that queries the database directly; the API lives in route handlers
under `src/app/api/`, with reusable logic in `src/server/routes/`.

**Consequences.** Server Components render the board with no client fetching
(helps the < 1.5s target); API and UI share types and the Prisma client. The
dashboard page and the ticket API can't share `/tickets`, so the API is
namespaced under `/api/tickets`. Next 15 edges must be respected — dynamic route
`params` is async and must be awaited.

**Rejected alternatives.**
- *Separate React SPA + standalone Express API* — two builds to deploy and a
  hand-maintained contract, for no benefit at this size.
- *Remix* — capable, but outside the fixed training stack and adds nothing the
  App Router doesn't already provide here.

### ADR-002 — Data layer: Prisma + SQLite

**Status:** Accepted

**Context.** We need persistence for a single `Ticket` entity, a clean migration
story, and a typed client so the zero-`any` NFR holds end to end. The dataset is
small and runs locally and in CI without external infrastructure. The training
stack fixes Prisma + SQLite.

**Decision.** Prisma ORM with a SQLite datasource (`file:./dev.db`). Prisma
generates a typed client from `schema.prisma`; migrations are versioned; the DB
is a single file needing no server. Because **SQLite has no native enum type**,
`priority` and `status` are stored as `String` and constrained by Zod at every
write path; the narrow union types are reconstructed once at the read boundary.

**Consequences.** One typed client shared by UI and API; model changes surface as
type errors. SQLite needs no container, helping the < 3-minute CI target.
Enum-like fields are only as safe as the Zod layer, so validation is
non-optional on writes. Moving to Postgres later is a datasource + migration
change, not an app rewrite.

**Rejected alternatives.**
- *`better-sqlite3` + hand-written SQL* — fast, but we'd hand-roll types and
  migrations and lose the typed client the zero-`any` NFR relies on.
- *Postgres in Docker* — operationally heavier in dev/CI than the dataset
  warrants this milestone; revisit when multi-user concurrency is real.
