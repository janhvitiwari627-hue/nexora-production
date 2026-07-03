import { Link } from "@tanstack/react-router";
import {
  Award,
  Gift,
  Shirt,
  Tablet,
  Laptop,
  Car,
  ArrowRight,
  Sparkles,
} from "lucide-react";

type Milestone = {
  shops: number;
  title: string;
  subtitle: string;
  Icon: typeof Gift;
  accent: string;
  ring: string;
  ultimate?: boolean;
};

const MILESTONES: Milestone[] = [
  {
    shops: 26,
    title: "Welcome Kit",
    subtitle: "Premium Pen, Leather Diary, Backpack, Cap & ID Card",
    Icon: Gift,
    accent: "from-sky-500 to-blue-600",
    ring: "ring-sky-200",
  },
  {
    shops: 51,
    title: "Official Nexora T-Shirt",
    subtitle: "Premium branded apparel for verified partners",
    Icon: Shirt,
    accent: "from-indigo-500 to-violet-600",
    ring: "ring-indigo-200",
  },
  {
    shops: 101,
    title: "Tablet Reward",
    subtitle: "A brand new tablet to power your presentations",
    Icon: Tablet,
    accent: "from-violet-500 to-fuchsia-600",
    ring: "ring-violet-200",
  },
  {
    shops: 501,
    title: "Branded Laptop",
    subtitle: "High-performance laptop to fuel your business growth",
    Icon: Laptop,
    accent: "from-emerald-500 to-teal-600",
    ring: "ring-emerald-200",
  },
  {
    shops: 1001,
    title: "District Partner & Car",
    subtitle:
      "Achieve District Business Partner status and ride away in your very own luxury car",
    Icon: Car,
    accent: "from-amber-500 via-orange-500 to-rose-600",
    ring: "ring-amber-200",
    ultimate: true,
  },
];

export default function GrowthPartnerRewardsSection() {
  return (
    <section className="relative overflow-hidden px-5 py-20 sm:px-8 lg:py-28">
      {/* Ambient gradient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/4 h-[420px] w-[420px] rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute bottom-0 right-10 h-[380px] w-[380px] rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute top-1/2 left-0 h-[300px] w-[300px] rounded-full bg-rose-200/25 blur-3xl" />
      </div>

      <div className="mx-auto max-w-[1280px]">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 shadow-sm">
            <Award className="h-3.5 w-3.5" />
            Growth Partner Rewards
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-[46px] lg:leading-[1.08]">
            Hit Targets.{" "}
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 bg-clip-text text-transparent">
              Unlock Premium Rewards.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-slate-600 sm:text-base">
            Only active, revenue-generating shops count. Achieve your onboarding
            milestones and get rewarded with premium lifestyle and business
            upgrades — on top of your regular commissions.
          </p>
        </div>

        {/* Milestone rail */}
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {MILESTONES.map((m, i) => (
            <div
              key={m.shops}
              className={`group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
                m.ultimate
                  ? "ring-2 ring-amber-300 lg:scale-[1.03]"
                  : "hover:border-slate-300"
              }`}
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              {/* Ultimate ribbon */}
              {m.ultimate && (
                <span className="absolute -right-10 top-5 rotate-45 bg-gradient-to-r from-amber-500 to-rose-600 px-10 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                  Ultimate
                </span>
              )}

              {/* Shop count pill */}
              <div
                className={`inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-r ${m.accent} px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-white shadow-md`}
              >
                <Sparkles className="h-3 w-3" />
                {m.shops} Shops
              </div>

              {/* Icon plate */}
              <div
                className={`mt-6 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${m.accent} text-white shadow-lg ring-4 ${m.ring} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
              >
                <m.Icon className="h-8 w-8" strokeWidth={1.75} />
              </div>

              {/* Title & subtitle */}
              <h3 className="mt-5 text-lg font-bold leading-tight text-slate-900">
                {m.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                {m.subtitle}
              </p>

              {/* Progress footer */}
              <div className="mt-5 border-t border-dashed border-slate-200 pt-4">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>Milestone {i + 1}</span>
                  <span className="text-slate-900">{m.shops} active shops</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${m.accent}`}
                    style={{ width: `${20 + i * 20}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/growth-partner"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-slate-900 px-7 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Join the Growth Partner Program
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-xs font-medium text-slate-500">
            Own your district · Earn recurring income · Unlock every milestone
          </p>
        </div>
      </div>
    </section>
  );
}
