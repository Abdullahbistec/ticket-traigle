# Ticket Triage Tool — PRD

## 1. Persona

**Primary user:** PMO coordinator at Bistec Global  
**Context:** The PMO coordinator processes 20–50 support tickets per day across email, web chat, and internal Slack threads. Tickets arrive unstructured with no consistent priority tagging.  
**Pain point:** The coordinator spends 40–60 minutes daily copying tickets into a shared spreadsheet, manually assigning priorities, and forwarding to the right team. There is no single queue view and no audit trail.

---

## 2. Problem Statement

Today, incoming tickets are scattered across three channels with no unified queue. Coordinators cannot see at a glance how many critical (P0) issues are open, which tickets are unowned, or what the team backlog looks like. This causes P0 escalations to be missed until a senior engineer notices, and low-priority feature requests to consume triage time that should go to outages. The tool must exist because the team is growing from 8 to 20 and the manual spreadsheet cannot scale.

**Measurable impact of current gap:**  
- Mean time to acknowledge P0 tickets: >45 minutes  
- Coordinator time lost to triage admin: ~50 min/day

---

## 3. Goals & Non-Goals

### Goals

- **G-1:** Reduce coordinator triage time from 50 min/day to under 10 min/day
- **G-2:** All open P0 tickets visible in under 5 seconds from opening the dashboard
- **G-3:** Priority and owner can be updated in one interaction (no page reload)
- **G-4:** API responds to GET /tickets in under 150ms p95 with 1,000-row seed

### Non-Goals

- Real-time push notifications (not in scope for Month 1)
- Multi-tenant / multi-org support
- Authentication / authorization (added in Month 2 offline milestone)
- AI auto-triage (future sprint)

---

## 4. Functional Requirements

### FR-1 — List open tickets

**Given** the dashboard loads at /tickets  
**When** the page renders  
**Then** all tickets are shown grouped by priority (P0 / P1 / P2) with a count badge per group, ordered newest-first within each group

### FR-2 — Priority badge per ticket

**Given** a ticket row is displayed  
**When** the coordinator scans the queue  
**Then** each row shows the ticket ID, title, priority badge, owner (if set), and creation time

### FR-3 — Ticket data model

**Given** a ticket is created  
**When** stored in the database  
**Then** it has: `id` (cuid), `title` (string), `body` (string), `priority` (P0/P1/P2, default P2), `owner` (nullable string), `status` (OPEN/IN_PROGRESS/RESOLVED, default OPEN), `channel` (string, default "web"), `createdAt`, `updatedAt`

### FR-4 — GET /tickets

**Given** the API receives GET /api/tickets  
**When** the database is seeded  
**Then** it returns JSON `{ tickets: [...], grouped: { P0: [...], P1: [...], P2: [...] }, counts: { P0: n, P1: n, P2: n, total: n } }` with HTTP 200

### FR-5 — PATCH /tickets/:id

**Given** the API receives PATCH /api/tickets/:id with a JSON body  
**When** the body contains one or more of `{ priority, owner, status }`  
**Then** it validates with Zod, returns 400 + `{ error, issues }` on invalid input, 404 if the ticket does not exist, or 200 + the updated ticket on success

---

## 5. Non-Functional Requirements

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| Initial page render | < 1,500ms | Lighthouse localhost |
| GET /api/tickets p95 | < 150ms | seed data (1,000 rows) |
| Zero `any` in TypeScript | 0 | `tsc --noEmit` strict |
| CI end-to-end duration | < 3 minutes | GitHub Actions |
| Commit messages | Conventional Commits | git log |

---

## 6. Architecture Decision Records

### ADR-001: Framework — Next.js 15 App Router

**Context:** Need a full-stack TypeScript framework that can serve both the dashboard UI and the JSON API from a single repo.

**Decision:** Use Next.js 15 App Router. Server components handle the dashboard with zero client-side JavaScript for the initial render. API Routes handle GET /tickets and PATCH /tickets/:id.

**Alternatives rejected:**
- **Express + React SPA** — requires two repos, separate deployment, and more boilerplate for a single internal tool
- **Remix** — smaller ecosystem for Bistec team, fewer examples to reference in training

**Consequences:** Tied to Vercel conventions. `typedRoutes` experimental flag needed for strict route typing.

---

### ADR-002: Data layer — Prisma + SQLite

**Context:** Need a typed ORM and a database that requires zero infrastructure setup for a local development + CI environment.

**Decision:** Prisma 5 as ORM, SQLite as database. Schema-first: `prisma/schema.prisma` is the single source of truth. Migrations committed to the repo.

**Alternatives rejected:**
- **Drizzle + SQLite** — less mature migration tooling at the time of writing; less documentation available for onboarding
- **Prisma + PostgreSQL** — requires a running Postgres server; adds infrastructure overhead for a Month 1 scaffold

**Consequences:** SQLite is not suitable for multi-process writes in production. Moving to Postgres in Month 2 requires updating `datasource` block only (no schema changes).
