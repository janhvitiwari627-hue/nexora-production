import { Clock, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockRefunds } from "./mockWallet";

const STATUS: Record<string, { label: string; classes: string; Icon: typeof Clock }> = {
  initiated: { label: "Initiated", classes: "bg-amber-100 text-amber-700", Icon: Clock },
  processing: { label: "Processing", classes: "bg-indigo-100 text-indigo-700", Icon: Loader2 },
  completed: { label: "Completed", classes: "bg-emerald-100 text-emerald-700", Icon: CheckCircle2 },
};

export function RefundStatusTracker() {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-bold">Refund Tracker</h3>
        <span className="text-[11px] font-semibold text-muted-foreground">
          {mockRefunds.length} active
        </span>
      </header>
      <ul className="mt-4 space-y-3">
        {mockRefunds.map((r) => {
          const s = STATUS[r.status];
          return (
            <li key={r.id} className="flex items-start gap-3 rounded-xl border bg-muted/30 p-3">
              <div
                className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full", s.classes)}
              >
                <s.Icon className={cn("h-4 w-4", r.status === "processing" && "animate-spin")} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-bold">{r.shopName}</p>
                  <span className="shrink-0 font-black text-emerald-600">₹{r.amount}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {r.bookingId} · {s.label}
                  {r.status !== "completed" &&
                    ` · expected by ${new Date(r.expectedISO).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })}`}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
