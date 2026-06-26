import { Gift, Percent, ArrowRight } from "lucide-react";
import FadeIn from "../FadeIn";

const offers = [
  {
    title: "Nexora Rewards",
    description:
      "Earn points on every booking and redeem them for free services, upgrades and partner brand perks.",
    cta: "Join Rewards",
    icon: Gift,
    gradient: "from-indigo-600 to-violet-700",
    badge: "New",
  },
  {
    title: "First Booking Offer",
    description:
      "New members get up to 30% off their first appointment across salons, spas and beauty studios.",
    cta: "Claim Offer",
    icon: Percent,
    gradient: "from-slate-800 to-slate-900",
    badge: "Limited",
  },
];

export default function Offers() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <FadeIn>
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Exclusive Offers
              </h2>
              <p className="mt-3 text-lg text-slate-500">
                Premium perks designed for members, not bargain hunters.
              </p>
            </div>
          </div>
        </FadeIn>

        <div className="grid gap-6 md:grid-cols-2">
          {offers.map((offer, i) => (
            <FadeIn key={offer.title} delay={i * 0.1}>
              <div
                className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${offer.gradient} p-8 text-white shadow-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl`}
              >
                <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl transition-all group-hover:scale-125" />
                <div className="relative z-10 flex h-full flex-col">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                      <offer.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur-sm">
                      {offer.badge}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold">{offer.title}</h3>
                  <p className="mt-2 max-w-md text-indigo-100">
                    {offer.description}
                  </p>
                  <a
                    href="#"
                    className="mt-6 inline-flex w-max items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-900 transition-transform hover:scale-105 active:scale-95"
                  >
                    {offer.cta}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
