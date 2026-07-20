import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { MembershipCard, type Membership } from "@/components/shared/MembershipCard";
import { cn } from "@/lib/utils";

const TIERS: { membership: Membership; popular?: boolean }[] = [
  {
    membership: {
      member_name: "Silver",
      nexora_id: "NX-SILV",
      tier: "Silver",
      expires_on: "12 months",
      savings_inr: 2400,
      benefits: ["5% off every booking", "Birthday surprise", "Priority support"],
      is_active: true,
    },
  },
  {
    membership: {
      member_name: "Gold",
      nexora_id: "NX-GOLD",
      tier: "Gold",
      expires_on: "12 months",
      savings_inr: 8500,
      benefits: [
        "12% off every booking",
        "2 free spa add-ons / month",
        "Early access to offers",
        "Member-only events",
      ],
      is_active: true,
    },
    popular: true,
  },
  {
    membership: {
      member_name: "Platinum",
      nexora_id: "NX-PLAT",
      tier: "Platinum",
      expires_on: "12 months",
      savings_inr: 22000,
      benefits: [
        "20% off every booking",
        "Unlimited free add-ons",
        "Personal beauty concierge",
        "Complimentary chauffeur (Jaipur)",
      ],
      is_active: true,
    },
  },
];

const COMPARE = [
  { feature: "Discount per booking", silver: "5%", gold: "12%", platinum: "20%" },
  { feature: "Birthday gift", silver: true, gold: true, platinum: true },
  { feature: "Free spa add-ons", silver: false, gold: "2 / month", platinum: "Unlimited" },
  { feature: "Member-only events", silver: false, gold: true, platinum: true },
  { feature: "Personal concierge", silver: false, gold: false, platinum: true },
  { feature: "Chauffeur in Jaipur", silver: false, gold: false, platinum: true },
];

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="mx-auto h-4 w-4 text-success" />
    ) : (
      <X className="mx-auto h-4 w-4 text-muted-foreground/50" />
    );
  }
  return <span className="font-semibold text-heading">{value}</span>;
}

export function MembershipSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="mx-auto max-w-7xl px-4 pt-20 md:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-block rounded-full bg-gradient-gold px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-heading">
          Membership
        </span>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-heading md:text-4xl">
          Join Nexora Beauty Club
        </h2>
        <p className="mt-2 text-muted-foreground">
          Save more on every visit, unlock exclusive perks, and get treated like a regular
          everywhere you go.
        </p>
      </div>

      <div className="mt-10 grid items-end gap-5 md:grid-cols-3">
        {TIERS.map((t) => (
          <div
            key={t.membership.tier}
            className={cn("relative", t.popular && "md:-mt-6 md:scale-[1.04]")}
          >
            {t.popular && (
              <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-gradient-cta px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary-foreground shadow-lg">
                Most Popular
              </span>
            )}
            <MembershipCard membership={t.membership} />
          </div>
        ))}
      </div>

      <div className="mt-10 overflow-hidden rounded-[var(--radius-card-lg)] border border-border bg-card shadow-[var(--shadow-card)]">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-bold">Feature</th>
              <th className="px-4 py-3 text-center font-bold">Silver</th>
              <th className="px-4 py-3 text-center font-bold text-primary">Gold</th>
              <th className="px-4 py-3 text-center font-bold">Platinum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(expanded ? COMPARE : COMPARE.slice(0, 3)).map((row) => (
              <tr key={row.feature}>
                <td className="px-4 py-3 font-semibold text-heading">{row.feature}</td>
                <td className="px-4 py-3 text-center">
                  <Cell value={row.silver} />
                </td>
                <td className="px-4 py-3 text-center">
                  <Cell value={row.gold} />
                </td>
                <td className="px-4 py-3 text-center">
                  <Cell value={row.platinum} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-center gap-1.5 border-t border-border bg-muted/30 py-3 text-sm font-bold text-primary transition hover:bg-muted/60"
        >
          {expanded ? "Show Less" : "Compare All Benefits"}
          <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
        </button>
      </div>
    </section>
  );
}
