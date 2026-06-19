import { Sparkles, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockActivePlan, type Tier } from "./mockMembership";

const TIER_BG: Record<Tier, string> = {
  Silver: "bg-[linear-gradient(135deg,#dde3ec_0%,#9ca6b7_60%,#6b7689_100%)] text-slate-900",
  Gold: "bg-[linear-gradient(135deg,#fde68a_0%,#f59e0b_55%,#b45309_100%)] text-amber-950",
  Platinum:
    "bg-[linear-gradient(135deg,oklch(0.32_0.08_280),oklch(0.20_0.05_260)_60%,oklch(0.14_0.03_250))] text-white",
};

export function ActivePlanCard() {
  const p = mockActivePlan;
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[28px] p-7 shadow-[var(--shadow-float)] sm:p-9",
        TIER_BG[p.tier],
      )}
    >
      <div className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-white/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
      {/* chip */}
      <div className="pointer-events-none absolute top-7 right-7 h-9 w-12 rounded-md bg-[linear-gradient(135deg,#e8d68a,#b48a2c)] opacity-90 shadow-inner" />

      <div className="relative flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] opacity-80">
        <Sparkles className="h-3.5 w-3.5" /> Nexora Membership
      </div>

      <h2 className="relative mt-3 inline-flex items-center gap-2 text-3xl font-black tracking-tight sm:text-4xl">
        <Crown className="h-7 w-7" /> {p.tier}
      </h2>

      <p className="relative mt-8 text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70">
        Card Holder
      </p>
      <p className="relative text-xl font-black tracking-wide sm:text-2xl">{p.memberName}</p>

      <div className="relative mt-6 grid grid-cols-3 gap-4">
        <Field label="Member ID" value={p.memberId} />
        <Field label="Member Since" value={p.memberSince} />
        <Field label="Valid Through" value={p.expiresOn} />
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70">{label}</p>
      <p className="mt-0.5 text-sm font-bold tracking-wide">{value}</p>
    </div>
  );
}
