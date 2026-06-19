import { Link } from "@tanstack/react-router";
import { Crown, Check, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockMembership } from "../mockDashboard";

const TIER_BG: Record<string, string> = {
  Silver: "bg-[linear-gradient(135deg,#cfd6df,#8a95a5)] text-slate-900",
  Gold: "bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 text-amber-950",
  Platinum:
    "bg-[linear-gradient(135deg,oklch(0.32_0.08_280),oklch(0.18_0.05_260))] text-white",
};

const NEXT_TIER: Record<string, "Gold" | "Platinum" | null> = {
  Silver: "Gold",
  Gold: "Platinum",
  Platinum: null,
};

function daysUntil(iso: string) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
}

export function MembershipStatusCard() {
  const m = mockMembership;
  const next = NEXT_TIER[m.tier];
  const days = daysUntil(m.expiresOn);
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl p-5 shadow-[var(--shadow-float)]",
        TIER_BG[m.tier],
      )}
    >
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
      <div className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80">
            Membership
          </p>
          <h3 className="mt-1 flex items-center gap-2 text-2xl font-black">
            <Crown className="h-5 w-5" /> {m.tier}
          </h3>
        </div>
        <span className="rounded-full bg-black/15 px-2.5 py-1 text-[11px] font-bold">
          {days} days left
        </span>
      </div>

      <ul className="relative mt-4 space-y-1.5 text-sm font-medium">
        {m.benefits.map((b) => (
          <li key={b} className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      {next && (
        <Link
          to="/membership"
          className="relative mt-5 inline-flex w-full items-center justify-center gap-1 rounded-full bg-white/95 px-4 py-2.5 text-sm font-bold text-heading transition hover:bg-white"
        >
          Upgrade to {next} <ArrowUpRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
