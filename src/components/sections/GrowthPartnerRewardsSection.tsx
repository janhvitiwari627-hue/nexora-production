import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Gift, BadgeCheck, Sparkles, Award, Trophy, ArrowRight, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/shared/Modal";

type Milestone = {
  shops: number;
  title: string;
  subtitle: string;
  Icon: typeof Gift;
  bg: string;
  iconColor: string;
  tagline: string;
  items: string[];
  eligibility: string;
  delivery: string;
};

const MILESTONES: Milestone[] = [
  {
    shops: 26,
    title: "Welcome Kit",
    subtitle: "Pen, Diary, Bag, Cap & ID Card",
    Icon: Gift,
    bg: "bg-[#EEF0FF]",
    iconColor: "text-[#4F46E5]",
    tagline: "Aapka Nexora Growth Partner journey shuru!",
    items: [
      "Branded Nexora Pen",
      "Premium Diary / Notebook",
      "Nexora Field Bag",
      "Nexora Cap",
      "Official Partner ID Card",
    ],
    eligibility: "26 active revenue-generating shops complete karein.",
    delivery: "Approval ke 7–10 working days me shipping.",
  },
  {
    shops: 51,
    title: "Official Nexora T-Shirt",
    subtitle: "Premium branded apparel",
    Icon: BadgeCheck,
    bg: "bg-[#E9F7EF]",
    iconColor: "text-[#059669]",
    tagline: "Field par Nexora identity ke saath chamkein.",
    items: [
      "Premium cotton branded T-Shirt",
      "Size customisation (S / M / L / XL / XXL)",
      "Nexora Partner badge",
    ],
    eligibility: "51 active shops maintain karein 30 din tak.",
    delivery: "Approval ke 7 working days me courier.",
  },
  {
    shops: 101,
    title: "Tablet Reward",
    subtitle: "Brand new tablet for presentations",
    Icon: Sparkles,
    bg: "bg-[#FFF6DA]",
    iconColor: "text-[#D97706]",
    tagline: "Demo, onboarding aur presentations — sab kuch smooth.",
    items: [
      "Brand new Android tablet",
      "Nexora Partner app pre-installed",
      "Protective cover & charger",
      "1-year manufacturer warranty",
    ],
    eligibility: "101 active shops & KYC verified.",
    delivery: "Verification ke 10–14 working days me.",
  },
  {
    shops: 501,
    title: "Branded Laptop",
    subtitle: "High-performance laptop",
    Icon: Award,
    bg: "bg-[#FCE7F0]",
    iconColor: "text-[#DB2777]",
    tagline: "Business scale karne ke liye pro-grade device.",
    items: [
      "High-performance branded laptop",
      "Nexora Partner Suite pre-installed",
      "Laptop bag & accessories",
      "Priority support access",
    ],
    eligibility: "501 active shops with 90-day retention.",
    delivery: "Approval ke 15 working days me hand-delivery.",
  },
  {
    shops: 1001,
    title: "District Partner + Car",
    subtitle: "DBP status & a luxury car",
    Icon: Trophy,
    bg: "bg-[#E0EBFF]",
    iconColor: "text-[#2563EB]",
    tagline: "Ultimate milestone — District Business Partner ka tag.",
    items: [
      "Official District Business Partner (DBP) status",
      "Branded luxury car (as per program terms)",
      "Dedicated relationship manager",
      "Region-wide revenue share plan",
      "Invite to annual Nexora leadership summit",
    ],
    eligibility: "1001 active shops & sustained performance for 6 months.",
    delivery: "Committee verification ke baad 30–45 working days.",
  },
];

export default function GrowthPartnerRewardsSection() {
  const [selected, setSelected] = useState<Milestone | null>(null);

  return (
    <section className="bg-white px-4 py-14 sm:px-8 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-[1240px]">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#4F46E5] sm:text-[11px] sm:tracking-[0.22em]">
          Milestone Rewards
        </p>

        <h2 className="mx-auto mt-3 max-w-3xl text-center text-[28px] font-black leading-[1.1] tracking-tight text-[#0B1330] sm:mt-4 sm:text-5xl sm:leading-[1.05] lg:text-[56px]">
          Grow more. Earn more. Get rewarded.
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-center text-[13px] leading-relaxed text-slate-500 sm:mt-5 sm:text-[15px]">
          Sirf active revenue-generating shops count hoti hain. Kisi bhi card par tap karke full
          reward breakdown dekhein.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-14 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
          {MILESTONES.map((m, idx) => (
            <button
              key={m.shops}
              type="button"
              onClick={() => setSelected(m)}
              aria-label={`${m.shops} active shops reward — ${m.title}. View breakdown`}
              className={`${m.bg} group flex flex-col rounded-2xl p-4 text-left transition-transform duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 sm:p-5 lg:p-6 ${
                idx === 4 ? "col-span-2 sm:col-span-3 lg:col-span-1" : ""
              }`}
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white shadow-sm sm:h-10 sm:w-10">
                <m.Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${m.iconColor}`} strokeWidth={2} />
              </div>

              <div className="mt-5 text-3xl font-black tracking-tight text-[#0B1330] sm:mt-8 sm:text-4xl">
                {m.shops}
              </div>
              <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:text-[10px] sm:tracking-[0.15em]">
                Active Shops
              </div>

              <div className="mt-4 border-t border-white/70 pt-3 sm:mt-6 sm:pt-4">
                <h3 className="text-[13px] font-bold leading-tight text-[#0B1330] sm:text-sm">
                  {m.title}
                </h3>
                <p className="mt-1 text-[11px] leading-snug text-slate-600 sm:text-[12px]">
                  {m.subtitle}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[#4F46E5] transition-opacity sm:mt-3 sm:text-[11px] sm:opacity-0 sm:group-hover:opacity-100">
                  View breakdown <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-10 flex justify-center sm:mt-14">
          <Link
            to="/growth-partner"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0B1330] px-6 text-[13px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#1E1B4B] sm:h-12 sm:px-7 sm:text-sm"
          >
            Join the Growth Partner Program
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.shops} Active Shops — ${selected.title}` : undefined}
        size="lg"
      >
        {selected && (
          <div className="space-y-6 p-6">
            <div className={`${selected.bg} flex items-center gap-4 rounded-2xl p-5`}>
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-sm">
                <selected.Icon className={`h-7 w-7 ${selected.iconColor}`} strokeWidth={2} />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Milestone
                </div>
                <div className="text-2xl font-black tracking-tight text-[#0B1330]">
                  {selected.shops} Active Shops
                </div>
                <p className="mt-1 text-sm text-slate-600">{selected.tagline}</p>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Reward Breakdown
              </h4>
              <ul className="mt-3 space-y-2">
                {selected.items.map((it) => (
                  <li key={it} className="flex items-start gap-2 text-sm text-[#0B1330]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Eligibility
                </div>
                <p className="mt-1.5 text-sm text-[#0B1330]">{selected.eligibility}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Delivery Timeline
                </div>
                <p className="mt-1.5 text-sm text-[#0B1330]">{selected.delivery}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <p className="text-xs text-slate-500">
                Sirf active revenue-generating shops count hoti hain.
              </p>
              <Link
                to="/growth-partner"
                onClick={() => setSelected(null)}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0B1330] px-6 text-sm font-semibold text-white hover:bg-[#1E1B4B]"
              >
                Join Growth Partner
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
