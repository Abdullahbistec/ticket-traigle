import type { Priority, Status } from "./validation";

export const PRIORITIES: readonly Priority[] = ["P0", "P1", "P2"];

export const PRIORITY_LABEL: Record<Priority, string> = {
  P0: "Critical",
  P1: "High",
  P2: "Normal",
};

/** A ticket as rendered by the UI / returned by the API (dates serialised). */
export interface TicketView {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  owner: string;
  status: Status;
  createdAt: string;
}

/** Group tickets into one bucket per priority, preserving P0 → P2 order. */
export function groupByPriority(
  tickets: TicketView[],
): Record<Priority, TicketView[]> {
  const groups: Record<Priority, TicketView[]> = { P0: [], P1: [], P2: [] };
  for (const ticket of tickets) {
    groups[ticket.priority].push(ticket);
  }
  return groups;
}

/** Count of tickets per priority — drives the dashboard badges. */
export function countsByPriority(
  tickets: TicketView[],
): Record<Priority, number> {
  const counts: Record<Priority, number> = { P0: 0, P1: 0, P2: 0 };
  for (const ticket of tickets) {
    counts[ticket.priority] += 1;
  }
  return counts;
}
