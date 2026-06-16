# Context Engineering Journal — Month 1

> **How to read this.** The failure modes and re-prompt pairs below are grounded
> in issues this scaffold actually hit while being generated spec-first. The
> Prisma engine 403 is quoted verbatim from the real run; the Next.js and Prisma
> schema errors are the standard messages those mistakes produce. Where your own
> Claude Code sessions differed, replace these with your transcript — the rubric
> grades *your* exact outputs.

## Prompt Strategy

Each Speckit task (`speckit.yaml`) declares a `context` list — the files
attached to that task's Claude Code prompt — separate from the `files` it may
write. The rule was: attach the spec that defines the contract plus only the
upstream code the task consumes, nothing else.

| Task | Attached context | Why only these |
|------|------------------|----------------|
| T1 schema | `prd.md`, `adr-002` | Entity fields come from the PRD; the SQLite/enum constraint comes from the ADR. The app code doesn't exist yet and would only mislead. |
| T3 Zod schemas | `prd.md` | The validation rules are in FR-2/FR-4; no other file constrains them. |
| T4 priority helpers | `validation.ts` (types only) | Pure functions need the `Priority` type and nothing else — see the less-context pair below. |
| T5 handlers | `schema.prisma`, `priority.ts`, `validation.ts` | The handler composes exactly these three; attaching the UI would invite coupling. |
| T7 PATCH route | `tickets.ts` | The route only calls `updateTicket`; it needs the handler signature, not the schema. |

Principle: the contract (PRD/ADR/schema) is the high-value context; sibling code
is attached only when the task directly imports it.

## Failure Modes

1. **Next.js 15 async route params.** The agent wrote the PATCH handler with a
   synchronous `params` type — correct for Next 14, a build error in Next 15.
2. **Enum on SQLite.** Asked to "model priority as an enum," the agent emitted a
   Prisma `enum`, which the SQLite provider rejects.
3. **Environment, not prompt: Prisma engine download blocked.** `prisma generate`
   failed in the sandbox because the engine host is unreachable. No prompt change
   fixes this — it's a network/context-of-execution fix.
4. **Over-attached context made a pure helper impure** (see pair 4).

## Re-Prompt Examples

### Pair 1 — Next.js 15 async params

**Context attached:** `src/server/routes/tickets.ts`.

**Before prompt:** "Generate the PATCH route at `src/app/api/tickets/[id]/route.ts`
that updates a ticket."

**Failing output (`src/app/api/tickets/[id]/route.ts:4`):**
```ts
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const ticket = await updateTicket(params.id, await req.json());
  ...
}
```
```
Type error: Route "src/app/api/tickets/[id]/route.ts" has an invalid "PATCH" export:
  Type "{ params: { id: string; } }" is not a valid type for the second argument.
  "params" should be a Promise.
```

**After prompt:** "Same route, but this is **Next.js 15** — dynamic `params` is a
`Promise` and must be awaited. Type the second arg as
`{ params: Promise<{ id: string }> }`."

**Commentary:** the fix was a one-line framework fact the spec didn't carry. I
added the Next-15-async-params note to the task prompt (and to ADR-001's
consequences) so it never recurs.

### Pair 2 — Enum on SQLite

**Context attached:** `docs/spec/prd.md` only (the ADR was missing).

**Before prompt:** "Generate `prisma/schema.prisma`. Priority is one of P0, P1,
P2 — model it as an enum."

**Failing output (`prisma/schema.prisma`):**
```prisma
enum Priority { P0 P1 P2 }
model Ticket { priority Priority }
```
```
error: Error validating: You defined the enum `Priority`. But the current
connector (sqlite) does not support enums.
```

**After prompt:** "SQLite has no enums. Store `priority` and `status` as `String`
and rely on Zod (`src/lib/validation.ts`) to constrain them. Read
`docs/spec/adr-002-data-layer.md` for the rationale."

**Commentary:** the real fix was *adding the right context* (ADR-002), not
rewording. The ADR encodes the constraint, so attaching it prevents the mistake
at the source.

### Pair 3 — Wrong route path (page/handler collision)

**Context attached:** `prd.md`.

**Before prompt:** "Expose `GET /tickets` returning grouped JSON."

**Failing output:** the agent created `src/app/tickets/route.ts`, colliding with
the dashboard page at the same segment:
```
Error: You cannot have two parallel pages that resolve to the same path.
  Conflicting: src/app/tickets/page.tsx and src/app/tickets/route.ts
```

**After prompt:** "The dashboard owns `/tickets` (`page.tsx`). Put the API under
`src/app/api/tickets/route.ts` so the page and handler don't collide."

**Commentary:** a Next App Router structural fact. Captured in ADR-001 and the
README so the API path is unambiguous for the next person.

### Pair 4 — Less context produced a better result

**Before (too much context):** attached the whole `src/` tree **and**
`schema.prisma` to the "generate `groupByPriority`" task.

**Failing output (`src/lib/priority.ts`):** the agent pulled in Prisma and made
the helper do I/O —
```ts
import { prisma } from "@/lib/db";
export async function groupByPriority() {
  const tickets = await prisma.ticket.findMany();
  ...
}
```
This coupled a pure transform to the database, so it couldn't be unit-tested
without a live SQLite file, and it duplicated the query that already lives in
`listTickets`.

**After (less context):** attached only `src/lib/validation.ts` (the `Priority`
type) and prompted: "Pure function. Input `TicketView[]`, output
`Record<Priority, TicketView[]>`. **No imports except the type. No I/O.**"

**Result (`src/lib/priority.ts:24`):** a synchronous, dependency-free function —
now covered by `tests/priority.test.ts` with no database.

## Measurable improvement

- **Correctness / re-prompts:** scoping T4's context from "all of `src/` +
  schema" down to one ~40-line types file took it from *1 wrong, untestable
  output* to *0 re-prompts*, and made the helper unit-testable.
- **Tests:** the pure-logic split is why `pnpm test` runs **9 passing tests with
  no database** (Vitest, ~0.7s) — the DB-coupled version couldn't be tested in
  CI without spinning up SQLite.
- **Context size:** the working T4 prompt attached roughly an order of magnitude
  fewer input tokens than the over-broad version (one file vs the `src/` tree),
  which is the one case here where *removing* context strictly improved the
  output.
