# Context Engineering Journal — Month 1

> Industry Readiness Program · Week 3 deliverable · Author: Abdullah
> How to read this: every task below maps to a `speckit.yaml` task (T1–T9). The
> `context` list is what I attached to the Claude Code prompt; the `files` list
> is what the task was allowed to write. The two are kept deliberately separate.

---

## Prompt Strategy

I scoped every prompt to a single task with an explicit set of files to edit and
concrete acceptance criteria, and I deliberately varied how much context I
attached per task. The rule was consistent: attach the **contract** that defines
the task (the PRD, the relevant ADR, or the upstream module's types) plus only
the code the task directly consumes — nothing else. Sibling code was attached
only when the task actually imported it. Every task was sized for under 30
minutes and traced back to one user story in `docs/spec/stories/`.

The high-value context was always the contract, not the surrounding code. When I
got this wrong in either direction — too little contract or too much sibling code
— the model produced worse output, and both directions are documented below.

---

## Per-Task Breakdown

**Task T1 — Generate `prisma/schema.prisma` for the Ticket entity** — attached
`docs/spec/prd.md` and `docs/spec/adr-002-data-layer.md`. Those two because the
entity fields (title, description, priority, owner, status, timestamps) come
straight from FR-1/FR-2 in the PRD, and the "no enum types on SQLite" constraint
lives in ADR-002. No application code was attached because none existed yet —
attaching a half-built `src/` tree would only have misled the model.

**Task T2 — Generate the seed (`seed.ts` + `tickets.json`)** — attached
`prisma/schema.prisma` and `src/lib/validation.ts`. The seed has to match the
schema shape and validate against the Zod seed schema before inserting, so those
are the two files it genuinely depends on. The PRD was *not* re-attached here
because the contract had already been resolved into the schema — the schema is
the more precise context at this point.

**Task T3 — Generate `src/lib/validation.ts` (Zod schemas)** — attached
`docs/spec/prd.md` only. The validation rules (priority `P0|P1|P2`, status
`open|closed`, the PATCH body with all-optional-but-one-required) are defined in
FR-2 and FR-4 and nowhere else. No other file constrains them, so attaching more
would have added noise without adding a single rule.

**Task T4 — Generate `src/lib/priority.ts` (pure helpers)** — attached
`src/lib/validation.ts` only, for the `Priority` type. This is the sharpest
minimal-context case in the project: the helpers are pure transforms, so they
need the type and nothing else. My first attempt over-attached here and it
backfired — see the "less context won" pair below.

**Task T5 — Generate `src/lib/db.ts` and `src/server/routes/tickets.ts`** —
attached `prisma/schema.prisma`, `src/lib/priority.ts`, and
`src/lib/validation.ts`. The route layer composes exactly these three: the schema
for the Prisma client, the priority helpers for grouping, and the validation
schemas for `updateTicket`. I deliberately did **not** attach any UI file —
handing the route the dashboard would have invited the model to couple data
access to rendering.

**Task T6 — Generate `src/app/api/tickets/route.ts` (GET handler)** — attached
`src/server/routes/tickets.ts` only. The handler is a thin wrapper that returns
`listTickets()` as JSON; it needs the function's signature and nothing more. The
schema and validation were left out because the handler never touches them
directly.

**Task T7 — Generate `src/app/api/tickets/[id]/route.ts` (PATCH handler)** —
attached `src/server/routes/tickets.ts` only, for the `updateTicket` signature.
The prompt itself carried the one framework fact the spec couldn't: Next.js 15
makes dynamic `params` a `Promise` that must be awaited. That single fact is what
separated a passing build from a failing one — see the re-prompt pair.

**Task T8 — Generate `src/app/tickets/page.tsx` (dashboard)** — attached
`src/server/routes/tickets.ts` and `src/lib/priority.ts`. The page calls
`listTickets()` and renders one lane per priority with count badges, so it needs
the data function and the priority ordering/labels. It did not need the raw
schema or the Zod file — those are upstream of the data it receives already
shaped.

**Task T9 — Generate the Vitest suite and CI workflow** — attached
`src/lib/priority.ts`, `src/lib/validation.ts`, and `package.json`. The tests
have to trace to the exact exports they assert against, and the CI workflow needs
the scripts in `package.json` to wire up install → prisma generate → lint →
typecheck → test → build. Nothing else was relevant.

---

## Failure Modes I Hit

1. **Next.js 15 async route params (T7).** The agent typed `params` synchronously
   — correct for Next 14, a hard build error in Next 15. The spec never carried
   this framework fact, so the prompt had to.
2. **Enum on SQLite (T1).** When ADR-002 was missing from the context, "model
   priority as an enum" produced a Prisma `enum`, which the SQLite connector
   rejects. This was a *missing-context* failure, not a wording failure.
3. **Page/handler path collision (T6/T8).** Without an explicit ADR on route
   layout, the API landed at `src/app/tickets/route.ts`, colliding with the
   dashboard page at the same segment.
4. **Over-attached context made a pure helper impure (T4).** Handing the whole
   `src/` tree plus the schema to a pure-transform task made the model pull in
   Prisma and add I/O — see below.

---

## Re-Prompt Pairs

### Pair 1 — Next.js 15 async params (T7)

**Before:** "Generate the PATCH route at `src/app/api/tickets/[id]/route.ts` that
updates a ticket."
**Failure:** the second argument was typed `{ params: { id: string } }`, and the
Next 15 type-check rejected it because `params` should be a `Promise`.
**After:** "Same route, but this is **Next.js 15** — dynamic `params` is a
`Promise` and must be awaited. Type the second arg as
`{ params: Promise<{ id: string }> }`."
**Takeaway:** the fix was a one-line framework fact, so I added it to the T7
prompt and to ADR-001's consequences so it never recurs.

### Pair 2 — Enum on SQLite (T1)

**Before (context: PRD only):** "Model priority as an enum (P0, P1, P2)."
**Failure:** `enum Priority { P0 P1 P2 }` — rejected because the SQLite connector
does not support enums.
**After (context: PRD **+ ADR-002**):** "SQLite has no enums. Store `priority`
and `status` as `String` and rely on Zod (`src/lib/validation.ts`) to constrain
them. See `adr-002-data-layer.md` for the rationale."
**Takeaway:** the real fix was *adding the right context*, not rewording. The ADR
encodes the constraint, so attaching it prevents the mistake at the source.

### Pair 3 — Less context produced a better result (T4)

**Before (too much context):** attached the whole `src/` tree **and**
`schema.prisma` to the `groupByPriority` task. The agent imported Prisma and made
the helper do a `findMany()` — coupling a pure transform to the database, so it
couldn't be unit-tested without a live SQLite file and it duplicated the query
already in `listTickets`.
**After (less context):** attached only `src/lib/validation.ts` (the `Priority`
type) and prompted: "Pure function. Input `TicketView[]`, output
`Record<Priority, TicketView[]>`. No imports except the type. No I/O."
**Result:** a synchronous, dependency-free helper, now covered by
`tests/priority.test.ts` with no database.

---

## Measurable Improvement

- **Re-prompts:** scoping T4 from "all of `src/` + schema" down to a single
  ~40-line types file took it from *one wrong, untestable output* to *zero
  re-prompts*, and made the helper unit-testable.
- **Tests:** that pure-logic split is why the suite runs **9 passing Vitest tests
  with no database** (~0.7s) — the DB-coupled version could not run in CI without
  spinning up SQLite.
- **Context size:** the working T4 prompt attached roughly an order of magnitude
  fewer input tokens than the over-broad version (one file vs the whole `src/`
  tree) — the one case here where *removing* context strictly improved the
  output.
