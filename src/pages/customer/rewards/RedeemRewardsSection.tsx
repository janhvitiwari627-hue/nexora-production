import { Percent, Crown, Gift } from "lucide-react";
import { mockPoints } from "./mockRewards";

const OPTIONS = [
  {
    id: "discount",
    title: "Service Discount",
    description: "Redeem points as flat off on your next booking.",
    points: 500,
    value: "₹250 off",
    Icon: Percent,
    grad: "from-emerald-500 to-teal-500",
  },
  {
    id: "membership",
    title: "Membership Upgrade",
    description: "Use points toward upgrading to Platinum tier.",
    points: 1500,
    value: "1 month Platinum",
    Icon: Crown,
    grad: "from-amber-400 to-orange-500",
  },
  {
    id: "exclusive",
    title: "Exclusive Offers",
    description: "Unlock partner brand coupons curated for you.",
    points: 800,
    value: "Premium coupon pack",
    Icon: Gift,
    grad: "from-fuchsia-500 to-indigo-500",
  },
];

export function RedeemRewardsSection() {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold">Redeem your points</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {OPTIONS.map((o) => {
          const enough = mockPoints.available >= o.points;
          return (
            <div
              key={o.id}
              className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition hover:shadow-md"
            >
              <div
                className={`mb-4 inline-grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${o.grad} text-white shadow`}
              >
                <o.Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold">{o.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{o.description}</p>
              <div className="mt-4 rounded-xl bg-muted/60 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Worth
                </p>
                <p className="text-sm font-bold">{o.value}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Costs {o.points.toLocaleString()} pts
                </p>
              </div>
              <button
                type="button"
                disabled={!enough}
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition hover:opacity-90 disabled:bg-muted disabled:text-muted-foreground"
              >
                {enough
                  ? "Redeem"
                  : `Need ${(o.points - mockPoints.available).toLocaleString()} more`}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
