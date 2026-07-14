import { db } from "@/lib/db";
import { PRIORITY_LABELS, PRIORITY_ORDER } from "@/types/ticket";
import type { Priority } from "@/types/ticket";
import type { Ticket } from "@prisma/client";

const BADGE: Record<Priority, string> = {
  P0: "bg-red-500/20 text-red-400 ring-red-500/40",
  P1: "bg-orange-500/20 text-orange-400 ring-orange-500/40",
  P2: "bg-teal-500/20 text-teal-400 ring-teal-500/40",
};

const SPINE: Record<Priority, string> = {
  P0: "bg-red-500",
  P1: "bg-orange-400",
  P2: "bg-teal-400",
};

function TicketRow({ ticket }: { ticket: Ticket }) {
  const p = ticket.priority as Priority;
  return (
    <div className="flex overflow-hidden rounded-xl border border-gray-800 bg-gray-900 transition-colors hover:border-gray-700">
      <div className={`w-1.5 flex-none ${SPINE[p]}`} />
      <div className="flex flex-1 flex-col gap-1.5 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${BADGE[p]}`}
          >
            {p} {PRIORITY_LABELS[p]}
          </span>
          <span className="font-mono text-xs text-gray-500">{ticket.id}</span>
          {ticket.owner && (
            <span className="ml-auto font-mono text-xs text-gray-500">
              → {ticket.owner}
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-gray-100">{ticket.title}</p>
        <p className="line-clamp-2 text-xs text-gray-400">{ticket.body}</p>
      </div>
    </div>
  );
}

function PriorityGroup({
  priority,
  tickets,
}: {
  priority: Priority;
  tickets: Ticket[];
}) {
  if (tickets.length === 0) return null;
  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          {priority} · {PRIORITY_LABELS[priority]}
        </h2>
        <span className="rounded-full bg-gray-800 px-2 py-0.5 font-mono text-xs text-gray-300">
          {tickets.length}
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        {tickets.map((t) => (
          <TicketRow key={t.id} ticket={t} />
        ))}
      </div>
    </section>
  );
}

export default async function TicketsPage() {
  const tickets = await db.ticket.findMany({ orderBy: { createdAt: "desc" } });

  const grouped = (["P0", "P1", "P2"] as Priority[]).map((p) => ({
    priority: p,
    tickets: tickets
      .filter((t) => t.priority === p)
      .sort(
        (a, b) =>
          PRIORITY_ORDER[a.priority as Priority] -
          PRIORITY_ORDER[b.priority as Priority],
      ),
  }));

  const counts = { P0: 0, P1: 0, P2: 0 } as Record<Priority, number>;
  for (const t of tickets) counts[t.priority as Priority]++;

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-10">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Support Ops · PMO queue
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-100">
            Ticket Triage
          </h1>
        </div>
        <div className="flex gap-6">
          {(["P0", "P1", "P2"] as Priority[]).map((p) => (
            <div key={p} className="flex flex-col items-end gap-0.5">
              <span
                className={`font-mono text-2xl font-bold ${
                  p === "P0"
                    ? "text-red-400"
                    : p === "P1"
                      ? "text-orange-400"
                      : "text-teal-400"
                }`}
              >
                {counts[p]}
              </span>
              <span className="text-xs uppercase tracking-widest text-gray-500">
                {p}
              </span>
            </div>
          ))}
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-mono text-2xl font-bold text-gray-100">
              {tickets.length}
            </span>
            <span className="text-xs uppercase tracking-widest text-gray-500">
              total
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-10">
        {grouped.map(({ priority, tickets: group }) => (
          <PriorityGroup key={priority} priority={priority} tickets={group} />
        ))}
        {tickets.length === 0 && (
          <p className="py-16 text-center text-sm text-gray-500">
            No tickets in queue. Run{" "}
            <code className="font-mono">pnpm db:seed</code> to load seed data.
          </p>
        )}
      </div>
    </div>
  );
}
