# Week 4 — Demo Recording Script (`demo.mp4`)

> Target length: **3:00–3:30**. Record at 1080p, enlarge your editor/terminal
> font (16pt+), close notifications, and do a silent dry-run once so the commands
> are already in your shell history. Talk in plain sentences — don't read code
> aloud line by line.

## Before you hit record (setup checklist)

- [ ] `pnpm install` done, `.env` present, `pnpm db:generate && pnpm db:migrate && pnpm db:seed` already run so the DB is live.
- [ ] The PR with the green CI run is open in a browser tab.
- [ ] `docs/spec/prd.md` and `speckit.yaml` open in the editor.
- [ ] A terminal ready with these queued (press ↑ to recall):
  - `pnpm test`
  - `pnpm dev`
  - `curl -s -X PATCH http://localhost:3000/api/tickets/<id> -H "Content-Type: application/json" -d '{"priority":"P0"}' | jq`
- [ ] Grab one real ticket id from the seed so the PATCH curl works first try.

---

## Shot 1 — PRD & spec (0:00 – 0:45)

**Show:** `docs/spec/prd.md`, scroll to persona → problem statement → FR list.

**Say:** "This is a PMO ticket-triage dashboard, built spec-first. The persona is
Nadia, a PMO coordinator with no single prioritised view. The problem statement
is measurable — P0 items acknowledged in about six hours against a 48-hour SLA,
and a weekly status view rebuilt by hand. The functional requirements are all
Given/When/Then, and ADR-002 records why priority is a validated string, not a
SQLite enum."

---

## Shot 2 — Spec-driven generation (0:45 – 1:45)

**Show:** `speckit.yaml`, point at the `context` vs `files` split on a couple of
tasks. Then show the generated tree (`src/lib`, `src/app/api`, `prisma`).

**Say:** "Every task in the Speckit plan declares the files attached to the
prompt separately from the files it's allowed to write. So T4, the pure priority
helper, only gets the validation types — no schema, no I/O. T5, the route layer,
gets the schema plus the helpers because it actually composes them. That
scoping is what kept the generated code decoupled and unit-testable."

*(If you regenerate live, run the single README regen command and let a few files
appear. If not, just walk the existing tree — either is fine.)*

---

## Shot 3 — Passing CI (1:45 – 2:30)

**Show:** the open PR, the green `verify` job, expand it to show the ordered
steps: install → prisma generate → lint → typecheck → test → build.

**Say:** "CI runs one job on Ubuntu with two cache layers — the pnpm store and
the Next build cache. All four gates are green: zero lint errors, zero type
errors, nine of nine tests passing, and a clean build."

*(Optional cut to terminal: `pnpm test` → show `9 passed`.)*

---

## Shot 4 — It actually runs (2:30 – 3:15)

**Show:** `pnpm dev`, open `/tickets` — the three priority lanes with count
badges. Then the terminal: run the PATCH curl to flip a ticket's priority, then
refresh `/tickets` to show it moved lanes.

**Say:** "Here's the running dashboard — open tickets grouped into P0, P1, P2
with live count badges. And here's the PATCH API: I retag this ticket to P0,
refresh, and it's moved into the P0 lane with the count updated. That closes the
loop from spec to a working, validated feature."

---

## Shot 5 — Close (3:15 – 3:30)

**Say:** "So: spec-first PRD, a Speckit plan with scoped context per task, green
CI on every gate, and a working dashboard backed by a Zod-validated API. Thanks."

---

## After recording

- [ ] Trim dead air, export as `demo.mp4` (H.264, ≤ ~100 MB so it uploads to the repo).
- [ ] Commit it into your Week 4 folder next to the CI report.
- [ ] Paste the video link into the **Demo Recording** section of `abdullah-month1-ci-report.md`.
