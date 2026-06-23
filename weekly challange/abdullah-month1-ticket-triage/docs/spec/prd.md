# Ticket Triage Tool — PRD

> Repo copy. The graded submission combines this PRD with the ADRs as
> `abdullah-month1-spec.md`. ADRs live in `adr-001-framework.md` and
> `adr-002-data-layer.md`; stories live in `stories/`.

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
- One dashboard that lists all open tickets grouped into P0/P1/P2 with a live
  count badge per group.
- Tickets are seeded from a single JSON file the PMO owns (no DB console needed
  to load data).
- Priority and owner of a ticket can be changed through a validated API in a
  single request.
- Initial dashboard render in **< 1.5s on localhost**; API p95 **< 150ms** on
  seed data.

**Non-Goals (explicit)**
- No authentication or per-user accounts this milestone (see Offline Milestones).
- No notifications, email, or real-time updates.
- No multi-project or portfolio roll-up; one flat ticket list.
- No comments/attachments/history (a `Comment` entity is a later story).
- No inline editing UI this milestone — tagging is exercised via the PATCH API;
  the edit affordance in the dashboard is a fast-follow story (S-002 UI).

## 4. Functional Requirements

**FR-1 — List open tickets from a JSON seed**
- **Given** the seed file `prisma/seed-data/tickets.json` has been loaded,
- **When** Nadia opens `/tickets`,
- **Then** every ticket with `status = "open"` is shown, and closed tickets are
  excluded.

**FR-2 — Tag a ticket with priority (P0/P1/P2) and owner**
- **Given** an existing ticket id,
- **When** a `PATCH /api/tickets/:id` request sets `priority` and/or `owner`,
- **Then** the stored ticket reflects the new values and the dashboard shows it
  in the matching priority group on next load.

**FR-3 — Group by priority with count badges**
- **Given** open tickets across more than one priority,
- **When** the dashboard renders,
- **Then** tickets appear under exactly one of three lanes (P0, P1, P2), each
  lane shows a numeric badge equal to its ticket count, and an empty lane shows a
  zero badge and an empty state.

**FR-4 — API exposes GET /tickets and PATCH /tickets/:id with Zod-validated input**
- **Given** the API is running,
- **When** `GET /api/tickets` is called,
- **Then** it returns valid JSON with tickets grouped by priority plus counts;
- **And when** `PATCH /api/tickets/:id` receives a body,
- **Then** the body is validated with Zod and an invalid body returns HTTP 400
  with field errors (never a partial write).

**FR-5 — PR passes GitHub Actions lint + build + smoke test**
- **Given** a pull request to `main`,
- **When** CI runs,
- **Then** ESLint, `tsc --noEmit`, Vitest (≥1 test), and `next build` all pass,
  and a red check blocks merge.

## 5. Non-Functional Requirements

| Area | Target |
|------|--------|
| Performance — page | Initial render of `/tickets` **< 1.5s** on localhost with seed data |
| Performance — API | `GET /api/tickets` p95 **< 150ms** on seed data |
| Type safety | **Zero `any`** types; `tsc --noEmit` and ESLint `no-explicit-any` both clean |
| Security | All PATCH input Zod-validated; invalid input rejected with 400 and no write; no secrets committed (SQLite path only) |
| Observability | Each API request logs method, path, status, and duration (single structured line) |
| Process | Conventional Commits; all commits signed; **CI end-to-end < 3 min** |

## Related ADRs
- `adr-001-framework.md` — Next.js 15 App Router
- `adr-002-data-layer.md` — Prisma + SQLite
