import type { Ticket } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  countsByPriority,
  groupByPriority,
  type TicketView,
} from "@/lib/priority";
import {
  ticketPatchSchema,
  type Priority,
  type Status,
} from "@/lib/validation";

// Priority/status are validated on write (seed + PATCH), so a read-time cast is
// safe. Kept in one place so the rest of the app works with the narrow types.
function toView(t: Ticket): TicketView {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    priority: t.priority as Priority,
    owner: t.owner,
    status: t.status as Status,
    createdAt: t.createdAt.toISOString(),
  };
}

export interface TicketBoard {
  groups: Record<Priority, TicketView[]>;
  counts: Record<Priority, number>;
  total: number;
}

/** GET /api/tickets — open tickets grouped by priority, with counts. */
export async function listTickets(): Promise<TicketBoard> {
  const rows = await prisma.ticket.findMany({
    where: { status: "open" },
    orderBy: { createdAt: "asc" },
  });
  const view = rows.map(toView);
  return {
    groups: groupByPriority(view),
    counts: countsByPriority(view),
    total: view.length,
  };
}

export type UpdateResult =
  | { ok: true; ticket: TicketView }
  | { ok: false; status: 400 | 404; error: unknown };

/** PATCH /api/tickets/:id — Zod-validate the body, then update the ticket. */
export async function updateTicket(
  id: string,
  input: unknown,
): Promise<UpdateResult> {
  const parsed = ticketPatchSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, status: 400, error: parsed.error.flatten() };
  }

  const existing = await prisma.ticket.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false, status: 404, error: `Ticket ${id} not found.` };
  }

  const updated = await prisma.ticket.update({
    where: { id },
    data: parsed.data,
  });
  return { ok: true, ticket: toView(updated) };
}
