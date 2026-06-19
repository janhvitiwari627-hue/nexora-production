import { Check } from "lucide-react";
import { mockActivePlan } from "./mockMembership";

export function BenefitsChecklist() {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-bold">Your benefits</h3>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {mockActivePlan.benefits.map((b) => (
          <li
            key={b}
            className="flex items-start gap-2.5 rounded-xl bg-muted/40 px-3 py-2.5 text-sm"
          >
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span className="font-medium">{b}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
