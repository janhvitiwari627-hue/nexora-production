import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockHistory, type RewardStatus } from "./mockRewards";

const STATUS: Record<RewardStatus, string> = {
  confirmed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  expired: "bg-rose-100 text-rose-700",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function RewardHistoryTable() {
  const [asc, setAsc] = useState(false);
  const rows = [...mockHistory].sort((a, b) => {
    const d = new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime();
    return asc ? d : -d;
  });

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b p-4">
        <h3 className="truncate text-sm font-bold">Reward History</h3>
        <button
          type="button"
          onClick={() => setAsc((v) => !v)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold transition hover:border-primary/40"
        >
          <ArrowUpDown className="h-3.5 w-3.5" /> Date {asc ? "↑" : "↓"}
        </button>
      </header>

      {/* Mobile: stacked card list */}
      <ul className="divide-y sm:hidden">
        {rows.map((r) => (
          <li key={r.id} className="p-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{r.shopName}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDate(r.dateISO)}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize",
                  STATUS[r.status],
                )}
              >
                {r.status}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">₹{r.amount}</span>
              <span className="font-bold text-emerald-600">+{r.pointsEarned} pts</span>
            </div>
          </li>
        ))}
      </ul>

      {/* Tablet / desktop: full table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 text-left">Date</th>
              <th className="px-4 py-2.5 text-left">Shop</th>
              <th className="px-4 py-2.5 text-right">Amount</th>
              <th className="px-4 py-2.5 text-right">Points</th>
              <th className="px-4 py-2.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3 text-muted-foreground">{formatDate(r.dateISO)}</td>
                <td className="px-4 py-3 font-semibold">{r.shopName}</td>
                <td className="px-4 py-3 text-right">₹{r.amount}</td>
                <td className="px-4 py-3 text-right font-bold text-emerald-600">
                  +{r.pointsEarned}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={cn(
                      "inline-block rounded-full px-2.5 py-1 text-[11px] font-bold capitalize",
                      STATUS[r.status],
                    )}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
