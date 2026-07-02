import { createFileRoute, Link } from "@tanstack/react-router";
import { LifeBuoy, Plus, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/customer/support")({
  head: () => ({ meta: [{ title: "Support — Nexora" }] }),
  component: SupportPage,
});

// Placeholder — replace with real ticket list once wired to backend.
const TICKETS: Array<{ id: string; subject: string; status: "open" | "closed"; updated: string }> = [];

function SupportPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Support</h1>
        <Button asChild size="sm">
          <Link to="/customer/support/add-ticket">
            <Plus className="mr-1 h-4 w-4" /> New ticket
          </Link>
        </Button>
      </div>

      {TICKETS.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border bg-card px-6 py-10 text-center">
          <LifeBuoy className="h-8 w-8 text-muted-foreground" />
          <div>
            <div className="font-medium">No tickets yet</div>
            <p className="mt-1 text-sm text-muted-foreground">
              We usually respond within a few hours.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/customer/support/add-ticket">Raise a ticket</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {TICKETS.map((t) => (
            <li key={t.id} className="rounded-lg border bg-card p-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t.subject}</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {t.status} · {t.updated}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
