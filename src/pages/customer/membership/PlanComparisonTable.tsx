import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockActivePlan, planRows, type Tier } from "./mockMembership";

const TIERS: Tier[] = ["Silver", "Gold", "Platinum"];

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <span className="inline-grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white">
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
    ) : (
      <Minus className="mx-auto h-4 w-4 text-muted-foreground/60" />
    );
  }
  return <span className="font-bold">{value}</span>;
}

export function PlanComparisonTable() {
  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="border-b p-5">
        <h3 className="text-sm font-bold">Compare plans</h3>
        <p className="text-xs text-muted-foreground">See what each tier unlocks.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 text-left">Feature</th>
              {TIERS.map((t) => (
                <th
                  key={t}
                  className={cn(
                    "px-5 py-3 text-center",
                    t === mockActivePlan.tier && "text-primary",
                  )}
                >
                  {t}
                  {t === mockActivePlan.tier && (
                    <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-black">
                      CURRENT
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {planRows.map((row) => (
              <tr key={row.feature} className="border-t">
                <td className="px-5 py-3 font-semibold">{row.feature}</td>
                {TIERS.map((t) => (
                  <td
                    key={t}
                    className={cn(
                      "px-5 py-3 text-center",
                      t === mockActivePlan.tier && "bg-primary/5",
                    )}
                  >
                    <Cell value={row[t]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
