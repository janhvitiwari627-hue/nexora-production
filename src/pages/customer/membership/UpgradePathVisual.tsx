import { ChevronRight, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockActivePlan, type Tier } from "./mockMembership";

const TIERS: { id: Tier; tagline: string; grad: string; text: string }[] = [
  {
    id: "Silver",
    tagline: "Essentials",
    grad: "from-slate-300 to-slate-500",
    text: "text-slate-900",
  },
  {
    id: "Gold",
    tagline: "Most popular",
    grad: "from-amber-300 to-orange-500",
    text: "text-amber-950",
  },
  {
    id: "Platinum",
    tagline: "Ultimate",
    grad: "from-indigo-500 via-fuchsia-500 to-rose-500",
    text: "text-white",
  },
];

export function UpgradePathVisual() {
  const currentIdx = TIERS.findIndex((t) => t.id === mockActivePlan.tier);
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-bold">Your upgrade path</h3>
      <div className="mt-4 flex items-stretch gap-2 sm:gap-3">
        {TIERS.map((t, i) => {
          const isCurrent = i === currentIdx;
          const isPast = i < currentIdx;
          return (
            <div key={t.id} className="flex flex-1 items-center gap-2 sm:gap-3">
              <div
                className={cn(
                  "relative flex-1 rounded-2xl bg-gradient-to-br p-4 text-center transition",
                  t.grad,
                  t.text,
                  isCurrent &&
                    "ring-4 ring-primary ring-offset-2 ring-offset-background scale-[1.02] shadow-lg",
                  !isCurrent && !isPast && "opacity-80",
                  isPast && "opacity-60",
                )}
              >
                <Crown className="mx-auto h-5 w-5" />
                <p className="mt-1.5 text-sm font-black">{t.id}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
                  {t.tagline}
                </p>
                {isCurrent && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-primary-foreground shadow">
                    YOU'RE HERE
                  </span>
                )}
              </div>
              {i < TIERS.length - 1 && (
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              )}
            </div>
          );
        })}
      </div>
      {currentIdx < TIERS.length - 1 && (
        <button
          type="button"
          className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
        >
          Upgrade to {TIERS[currentIdx + 1].id}
        </button>
      )}
    </section>
  );
}
