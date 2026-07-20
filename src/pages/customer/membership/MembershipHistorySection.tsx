import { History } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockHistory, type Tier } from "./mockMembership";

const TIER_DOT: Record<Tier, string> = {
  Silver: "bg-slate-400",
  Gold: "bg-amber-500",
  Platinum: "bg-gradient-to-br from-indigo-500 to-fuchsia-500",
};

export function MembershipHistorySection() {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <h3 className="flex items-center gap-2 text-sm font-bold">
        <History className="h-4 w-4 text-muted-foreground" /> Membership history
      </h3>
      <ul className="mt-4 divide-y">
        {mockHistory.map((h) => (
          <li key={h.id} className="flex items-center gap-3 py-3">
            <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", TIER_DOT[h.tier])} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">
                {h.tier} <span className="font-normal text-muted-foreground">· {h.period}</span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                Paid ₹{h.amountPaid.toLocaleString("en-IN")} · Saved ₹
                {h.savings.toLocaleString("en-IN")}
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
              +₹{h.savings.toLocaleString("en-IN")}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
