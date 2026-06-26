import { Check, Crown, Gem, Star } from "lucide-react";
import FadeIn from "../components/FadeIn";

const plans = [
  {
    name: "Silver",
    price: "₹199",
    period: "/month",
    metal: "card-metal-silver",
    icon: Star,
    benefits: [
      "5% off every booking",
      "Priority customer support",
      "Free rescheduling",
      "Birthday month treat",
    ],
    popular: false,
  },
  {
    name: "Gold",
    price: "₹499",
    period: "/month",
    metal: "card-metal-gold",
    icon: Crown,
    benefits: [
      "15% off every booking",
      "Complimentary add-ons",
      "Priority slots at peak hours",
      "Exclusive member events",
      "Family sharing (2 members)",
    ],
    popular: true,
  },
  {
    name: "Platinum",
    price: "₹999",
    period: "/month",
    metal: "card-metal-platinum",
    icon: Gem,
    benefits: [
      "25% off every booking",
      "Unlimited free cancellations",
      "VIP lounge access",
      "Personal beauty concierge",
      "Family sharing (4 members)",
    ],
    popular: false,
  },
];

export default function Membership() {
  return (
    <section id="membership" className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-400/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <FadeIn>
          <div className="mb-14 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
              Nexora Membership
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Beauty, elevated.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
              Unlock rewards, priority bookings and exclusive perks across every
              partner salon in India.
            </p>
          </div>
        </FadeIn>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 0.12}>
              <div
                className={`relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/60 shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:shadow-indigo-900/15 ${plan.metal} glass-sheen`}
              >
                {plan.popular && (
                  <div className="absolute right-4 top-4 rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white shadow-md">
                    Most Popular
                  </div>
                )}
                <div className="relative z-10 flex flex-1 flex-col p-7">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-slate-900 shadow-sm backdrop-blur-sm">
                    <plan.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {plan.name}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900">
                      {plan.price}
                    </span>
                    <span className="text-sm font-medium text-slate-600">
                      {plan.period}
                    </span>
                  </div>
                  <ul className="mt-6 flex-1 space-y-3">
                    {plan.benefits.map((benefit) => (
                      <li
                        key={benefit}
                        className="flex items-start gap-3 text-sm font-medium text-slate-700"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-slate-900" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <button className="mt-8 w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95">
                    Get {plan.name}
                  </button>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
