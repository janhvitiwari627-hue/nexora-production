import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tier = "Silver" | "Gold" | "Platinum";

export type Membership = {
  member_name: string;
  nexora_id: string;
  tier: Tier;
  expires_on: string;
  savings_inr: number;
  benefits: string[];
  is_active: boolean;
};

const TIER_BG: Record<Tier, string> = {
  Silver: "bg-gradient-platinum text-heading",
  Gold: "bg-gradient-gold text-heading",
  Platinum:
    "text-primary-foreground bg-[linear-gradient(135deg,oklch(0.28_0.06_260),oklch(0.18_0.05_260))]",
};

export function MembershipCard({
  membership,
  onAction,
}: {
  membership: Membership;
  onAction?: () => void;
}) {
  const cta = membership.tier === "Platinum" ? "Renew" : "Upgrade";
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-card-lg)] p-6 shadow-[var(--shadow-float)]",
        TIER_BG[membership.tier],
      )}
    >
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
      <div className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

      <header className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80">
            Nexora Membership
          </p>
          <h3 className="mt-1 text-2xl font-bold">{membership.member_name}</h3>
          <span className="mt-2 inline-flex items-center rounded-full bg-black/15 px-2.5 py-1 text-[11px] font-semibold tracking-wider">
            ID · {membership.nexora_id}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-3 py-1 text-xs font-bold backdrop-blur">
          <Sparkles className="h-3 w-3" /> {membership.tier}
        </span>
      </header>

      <dl className="relative mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-xs opacity-75">Expires</dt>
          <dd className="font-bold">{membership.expires_on}</dd>
        </div>
        <div>
          <dt className="text-xs opacity-75">Saved so far</dt>
          <dd className="font-bold">₹{membership.savings_inr.toLocaleString("en-IN")}</dd>
        </div>
      </dl>

      <ul className="relative mt-5 space-y-1.5 text-sm">
        {membership.benefits.slice(0, 4).map((b) => (
          <li key={b} className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onAction}
        className="relative mt-6 inline-flex w-full items-center justify-center rounded-[var(--radius-button)] bg-white/95 px-4 py-2.5 text-sm font-bold text-heading transition hover:bg-white"
      >
        {cta}
      </button>
    </div>
  );
}
