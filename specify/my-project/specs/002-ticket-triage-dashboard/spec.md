# Feature Specification: Ticket Triage Dashboard

**Feature Branch**: `002-ticket-triage-dashboard`

**Created**: 2026-06-23

**Status**: Draft

**Input**: User description: derived from `docs/prd.md`, `docs/adr-001-framework.md`,
`docs/adr-002-data-layer.md`

## User Scenarios & Testing *(mandatory)*

<!--
  Persona: Nadia Perera — PMO Coordinator, Bistec Global.
  Nadia triages project issues, change requests, and risks from delivery leads
  across Teams, email, and side conversations. She manages 3–5 active client
  projects, has a 48-hour SLA to acknowledge urgent items, and runs a Monday
  steering call where she must know what is critical from memory.
-->

### User Story 1 - Priority-Grouped Ticket Board (Priority: P1)

Nadia opens the triage dashboard and immediately sees every open ticket organised
into three priority lanes — P0 (critical/blocking), P1 (high), and P2 (normal).
Each lane shows how many tickets it contains. Closed tickets are not shown.

**Why this priority**: This is the core problem being solved. Without a single
prioritised view, urgent items remain buried and the Monday steering call requires
30–40 minutes of manual report assembly. Solving this alone delivers immediate,
measurable value.

**Independent Test**: Can be fully tested by loading the dashboard with a known
set of open and closed tickets, then verifying that only open tickets appear, they
are placed under the correct priority lane, and each lane badge shows the right
count — with no other feature required.

**Acceptance Scenarios**:

1. **Given** the system has open tickets across all three priorities, **When**
   Nadia opens the triage dashboard, **Then** she sees three lanes (P0, P1, P2),
   each containing the correct tickets and a numeric badge matching the ticket
   count in that lane.
2. **Given** the system has a priority lane with no open tickets, **When** Nadia
   views the dashboard, **Then** that lane is still visible, shows a zero badge,
   and displays an empty-state message (not a blank or broken area).
3. **Given** the system has both open and closed tickets, **When** Nadia views the
   dashboard, **Then** only open tickets appear; closed tickets are excluded from
   all lanes and counts.

---

### User Story 2 - Update Ticket Priority and Owner (Priority: P2)

A PMO team member can reassign a ticket to a different priority lane and/or change
its owner through a single update action. The change is reflected on the next
dashboard load. An attempt to set an invalid priority value is rejected with a
clear error and no partial change is saved.

**Why this priority**: The ability to tag priority and owner is the triage action
itself. Without it, the board is read-only and Nadia cannot act on what she sees.
It depends on the board (Story 1) existing first.

**Independent Test**: Can be tested by submitting a valid update for a known ticket
and verifying the ticket appears in the new priority lane on reload; then submitting
an invalid update and verifying the error is returned with no change saved.

**Acceptance Scenarios**:

1. **Given** an existing open ticket with priority P2, **When** a team member
   submits an update setting priority to P0 and owner to "Nadia Perera", **Then**
   the ticket appears in the P0 lane on the next dashboard load, with the updated
   owner shown.
2. **Given** an update request that specifies an invalid priority value (e.g., "P9"
   or blank), **When** the request is submitted, **Then** a clear validation error
   is returned, the ticket remains unchanged, and no partial update is persisted.
3. **Given** a valid update to only one field (priority or owner, not both),
   **When** the request is submitted, **Then** the specified field is updated and
   the other field retains its previous value.

---

### User Story 3 - Seed Tickets from a PMO-Controlled File (Priority: P3)

The PMO team can load an initial set of tickets from a JSON file they own and
maintain, with no requirement for direct database access or technical assistance.
Running the seed process replaces the current ticket data with the file contents.

**Why this priority**: Without a seed mechanism, the dashboard launches empty and
the team cannot populate it without engineering help. It is a prerequisite for
meaningful day-one use but secondary to the view and update flows.

**Independent Test**: Can be tested by providing a valid JSON file with known
ticket records, running the seed process, then verifying the dashboard shows
exactly those tickets in the correct lanes.

**Acceptance Scenarios**:

1. **Given** a correctly formatted JSON seed file with a mix of open and closed
   tickets, **When** the seed process is run, **Then** the dashboard reflects the
   file's open tickets grouped correctly by priority.
2. **Given** a seed file with a ticket missing a required field, **When** the seed
   process runs, **Then** an error is reported identifying the problem record, and
   the existing ticket data is not overwritten.
3. **Given** the seed process has already been run once, **When** it is run again
   with an updated file, **Then** the data is refreshed to match the new file
   contents.

---

### Edge Cases

- What is shown when the dashboard has no open tickets at all? All three lanes
  should render with zero badges and empty states — no broken layout.
- What happens when an update targets a ticket ID that does not exist? A clear
  "not found" error is returned; no data is created or modified.
- What happens when the seed file contains duplicate ticket IDs? The process
  should report the conflict and not load the file.
- What if the seed file is empty (zero tickets)? The process succeeds and the
  dashboard displays all lanes in empty state.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all tickets with `status = open`; tickets with
  any other status MUST NOT appear on the dashboard.
- **FR-002**: System MUST organise open tickets into exactly three priority lanes:
  P0, P1, and P2. Each ticket MUST appear in exactly one lane matching its
  priority.
- **FR-003**: Each priority lane MUST display a numeric badge equal to the count
  of open tickets in that lane. A lane with no open tickets MUST display a zero
  badge and an empty-state indicator — it MUST NOT be hidden or omitted.
- **FR-004**: Each ticket displayed MUST show at minimum: title, priority, and
  owner.
- **FR-005**: System MUST allow a ticket's priority and/or owner to be updated in
  a single action, addressed by ticket ID.
- **FR-006**: System MUST validate update input before applying any change.
  Priority MUST be one of: P0, P1, P2. A request with any invalid field MUST be
  rejected with a descriptive error and MUST NOT result in a partial write.
- **FR-007**: System MUST be seedable from a single JSON file maintained by the
  PMO team, executable without direct database access.
- **FR-008**: The seed process MUST validate the file format before writing. An
  invalid file MUST produce an error report identifying the offending record; the
  existing data MUST NOT be modified.
- **FR-009**: Each API request MUST produce a structured log entry recording the
  operation, outcome, and duration, to support operational visibility.

### Key Entities

- **Ticket**: Represents a single triage item. Attributes: unique ID, title,
  status (`open` | `closed`), priority (`P0` | `P1` | `P2`), owner (name string),
  created date.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Nadia can open the triage dashboard and see all open tickets grouped
  by priority in under 2 seconds from page request.
- **SC-002**: A priority or owner update is submitted and the change is visible on
  the next dashboard load, with the ticket appearing in the correct new lane.
- **SC-003**: An invalid update attempt (unrecognised priority, missing required
  field) is rejected with a clear error before any change is saved — zero cases of
  partial or silent writes.
- **SC-004**: The PMO team can seed ticket data from their JSON file without
  engineering assistance; the process completes in under 30 seconds for a typical
  dataset.
- **SC-005**: Ticket counts shown in lane badges match the actual number of tickets
  visible in that lane — zero discrepancy in any state.
- **SC-006**: 95% of dashboard loads and update requests complete without errors
  under normal working conditions.
- **SC-007**: The weekly Monday status view can be produced from the dashboard
  without manual reassembly — all active tickets and their priorities visible in a
  single screen.

## Assumptions

- Authentication and per-user accounts are out of scope for this milestone; the
  dashboard is accessible to anyone who can reach the URL.
- Notifications, email alerts, and real-time updates are out of scope; the
  dashboard reflects the current state on each load.
- Only a single flat list of tickets is supported; multi-project or portfolio
  roll-up views are out of scope.
- Ticket comments, attachments, and change history are out of scope for this
  milestone.
- Inline editing directly on the dashboard UI is out of scope; updates are
  performed through the update action (which may be a separate UI or direct API
  call — to be determined in planning).
- The seed file format is JSON; the exact schema is defined during planning.
- The dataset is small (tens of tickets); large-scale performance at thousands of
  concurrent users is not a target for this milestone.
- The tool is intended for internal PMO use at Bistec Global; public-facing
  accessibility beyond basic usability is not a requirement for this milestone.
