import { listTickets } from "@/server/routes/tickets";
import { PRIORITIES, PRIORITY_LABEL } from "@/lib/priority";
import type { Priority, Status } from "@/lib/validation";
import type { TicketView } from "@/lib/priority";

// Always read fresh from the database on request.
export const dynamic = "force-dynamic";

const LANE_STYLES: Record<Priority, { dot: string; badge: string; ring: string }> = {
  P0: { dot: "bg-red-500", badge: "bg-red-50 text-red-700 ring-red-200", ring: "ring-red-100" },
  P1: { dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 ring-amber-200", ring: "ring-amber-100" },
  P2: { dot: "bg-sky-500", badge: "bg-sky-50 text-sky-700 ring-sky-200", ring: "ring-sky-100" },
};

const STATUS_STYLES: Record<Status, string> = {
  open: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  closed: "bg-slate-100 text-slate-500 ring-slate-200",
};

function TicketCard({ ticket }: { ticket: TicketView }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm">
      <h3 className="text-sm font-semibold leading-snug text-slate-900">
        {ticket.title}
      </h3>
      {ticket.description && (
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {ticket.description}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">{ticket.owner}</span>
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ring-inset ${STATUS_STYLES[ticket.status]}`}
        >
          {ticket.status}
        </span>
      </div>
    </article>
  );
}

export default async function TicketsPage() {
  const { groups, counts, total } = await listTickets();

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Bistec PMO
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Ticket Triage
          </h1>
        </div>
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-900">{total}</span> open
          {total === 1 ? " ticket" : " tickets"}
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        {PRIORITIES.map((priority) => {
          const lane = LANE_STYLES[priority];
          const tickets = groups[priority];
          return (
            <section key={priority} className="flex flex-col">
              <div className="mb-3 flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${lane.dot}`} aria-hidden />
                <h2 className="text-sm font-semibold text-slate-900">
                  {priority}
                  <span className="ml-1.5 font-normal text-slate-400">
                    {PRIORITY_LABEL[priority]}
                  </span>
                </h2>
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${lane.badge}`}
                >
                  {counts[priority]}
                </span>
              </div>
              <div className="flex flex-col gap-2.5">
                {tickets.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-400">
                    No open tickets
                  </p>
                ) : (
                  tickets.map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
