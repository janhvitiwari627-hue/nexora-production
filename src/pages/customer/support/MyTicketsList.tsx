import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MY_TICKETS, type SupportTicket, type TicketStatus } from "./mockSupport";

const STATUS_META: Record<TicketStatus, { label: string; cls: string }> = {
  open: { label: "Open", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  in_progress: {
    label: "In Progress",
    cls: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  },
  resolved: { label: "Resolved", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  closed: { label: "Closed", cls: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TicketRow({ ticket }: { ticket: SupportTicket }) {
  const [open, setOpen] = useState(false);
  const meta = STATUS_META[ticket.status];

  return (
    <div className="border-border bg-card rounded-xl border">
      <button
        onClick={() => setOpen((v) => !v)}
        className="hover:bg-accent/40 flex w-full items-start justify-between gap-4 rounded-xl p-4 text-left transition"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground font-mono text-xs">{ticket.id}</span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${meta.cls}`}>
              {meta.label}
            </span>
          </div>
          <p className="text-heading mt-1 truncate text-sm font-bold">{ticket.subject}</p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {ticket.category} · Opened {fmt(ticket.createdAt)}
          </p>
        </div>
        <div className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
          {open ? "Hide" : "View thread"}
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {open && (
        <div className="border-border space-y-3 border-t p-4">
          {ticket.thread.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.from === "you" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  m.from === "you"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {m.text}
              </div>
              <span className="text-muted-foreground mt-1 text-[11px]">
                {m.from === "you" ? "You" : "Support"} · {fmtDateTime(m.at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MyTicketsList() {
  if (MY_TICKETS.length === 0) {
    return (
      <section className="bg-card border-border rounded-[var(--radius-card-lg)] border p-8 text-center">
        <p className="text-muted-foreground text-sm">You haven't raised any tickets yet.</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {MY_TICKETS.map((t) => (
        <TicketRow key={t.id} ticket={t} />
      ))}
    </section>
  );
}
