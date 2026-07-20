import { Gift, Users, BadgePercent } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockWallet, type WalletBucket } from "./mockWallet";

const TABS: {
  id: WalletBucket;
  label: string;
  balance: number;
  Icon: typeof Gift;
  tint: string;
}[] = [
  {
    id: "reward",
    label: "Reward Credits",
    balance: mockWallet.reward,
    Icon: Gift,
    tint: "from-fuchsia-500 to-indigo-500",
  },
  {
    id: "referral",
    label: "Referral Credits",
    balance: mockWallet.referral,
    Icon: Users,
    tint: "from-sky-500 to-cyan-500",
  },
  {
    id: "cashback",
    label: "Cashback Credits",
    balance: mockWallet.cashback,
    Icon: BadgePercent,
    tint: "from-emerald-500 to-teal-500",
  },
];

export function BalanceTabs({
  active,
  onChange,
}: {
  active: WalletBucket | "all";
  onChange: (b: WalletBucket | "all") => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-3">
        {TABS.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(isActive ? "all" : t.id)}
              className={cn(
                "group relative overflow-hidden rounded-2xl border bg-card p-4 text-left transition",
                isActive
                  ? "border-primary shadow-[var(--shadow-glow)]"
                  : "hover:border-primary/40 hover:shadow-md",
              )}
            >
              <div
                className={`mb-3 inline-grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${t.tint} text-white`}
              >
                <t.Icon className="h-4 w-4" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t.label}
              </p>
              <p className="mt-1 text-2xl font-black">₹{t.balance.toLocaleString("en-IN")}</p>
              {isActive && (
                <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                  Filtering
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
