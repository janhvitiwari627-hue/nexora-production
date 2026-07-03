import { Link } from "@tanstack/react-router";
import { Gift, BadgeCheck, Sparkles, Award, Trophy, ArrowRight } from "lucide-react";

type Milestone = {
  shops: number;
  title: string;
  subtitle: string;
  Icon: typeof Gift;
  bg: string;
  iconColor: string;
};

const MILESTONES: Milestone[] = [
  {
    shops: 26,
    title: "Welcome Kit",
    subtitle: "Pen, Diary, Bag, Cap & ID Card",
    Icon: Gift,
    bg: "bg-[#EEF0FF]",
    iconColor: "text-[#4F46E5]",
  },
  {
    shops: 51,
    title: "Official Nexora T-Shirt",
    subtitle: "Premium branded apparel",
    Icon: BadgeCheck,
    bg: "bg-[#E9F7EF]",
    iconColor: "text-[#059669]",
  },
  {
    shops: 101,
    title: "Tablet Reward",
    subtitle: "Brand new tablet for presentations",
    Icon: Sparkles,
    bg: "bg-[#FFF6DA]",
    iconColor: "text-[#D97706]",
  },
  {
    shops: 501,
    title: "Branded Laptop",
    subtitle: "High-performance laptop",
    Icon: Award,
    bg: "bg-[#FCE7F0]",
    iconColor: "text-[#DB2777]",
  },
  {
    shops: 1001,
    title: "District Partner + Car",
    subtitle: "DBP status & a luxury car",
    Icon: Trophy,
    bg: "bg-[#E0EBFF]",
    iconColor: "text-[#2563EB]",
  },
];

export default function GrowthPartnerRewardsSection() {
  return (
    <section className="bg-white px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-[1240px]">
        {/* Eyebrow */}
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.22em] text-[#4F46E5]">
          Milestone Rewards
        </p>

        {/* Headline */}
        <h2 className="mx-auto mt-4 max-w-3xl text-center text-4xl font-black leading-[1.05] tracking-tight text-[#0B1330] sm:text-5xl lg:text-[56px]">
          Grow more. Earn more. Get rewarded.
        </h2>

        <p className="mx-auto mt-5 max-w-xl text-center text-[15px] text-slate-500">
          Sirf active revenue-generating shops count hoti hain.
        </p>

        {/* Cards */}
        <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-5">
          {MILESTONES.map((m) => (
            <div
              key={m.shops}
              className={`${m.bg} flex flex-col rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1`}
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white shadow-sm">
                <m.Icon className={`h-5 w-5 ${m.iconColor}`} strokeWidth={2} />
              </div>

              <div className="mt-8 text-4xl font-black tracking-tight text-[#0B1330]">
                {m.shops}
              </div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                Active Shops
              </div>

              <div className="mt-6 border-t border-white/70 pt-4">
                <h3 className="text-sm font-bold text-[#0B1330]">{m.title}</h3>
                <p className="mt-1 text-[12px] leading-snug text-slate-600">
                  {m.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 flex justify-center">
          <Link
            to="/growth-partner"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-[#0B1330] px-7 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#1E1B4B]"
          >
            Join the Growth Partner Program
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
