import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BarChart3,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  FileCheck2,
  Gift,
  GraduationCap,
  Handshake,
  IndianRupee,
  KeyRound,
  LayoutDashboard,
  LineChart,
  MapPin,
  MessageCircle,
  PlayCircle,
  Repeat,
  Scissors,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  Trophy,
  Truck,
  UserRound,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { PublicPageHeader } from "@/components/shared/PublicPageHeader";
import { NEXORA_WHATSAPP_URL } from "@/config/contact";
import { GrowthPartnerApplicationForm } from "@/components/partner/GrowthPartnerApplicationForm";
import rewardWelcomeKit from "@/assets/reward-welcome-kit.jpg";
import rewardTablet from "@/assets/reward-tablet-badge.jpg";
import rewardLaptop from "@/assets/reward-laptop.jpg";
import rewardCar from "@/assets/reward-car.jpg";
import partnerHeroSalon from "@/assets/partner-hero-salon.jpg";
import partnerBeautyParlour from "@/assets/partner-beauty-parlour.jpg";
import partnerBarber from "@/assets/partner-barber.jpg";

const TRUST_STRIP = ["Free Joining", "No Investment", "Weekly Payout", "Transparent Dashboard"];

const NOT_THIS = [
  { label: "Not a Job", icon: ShieldCheck },
  { label: "Not a Franchise", icon: ShieldCheck },
  { label: "Not MLM", icon: ShieldCheck },
];
const IS_THIS = [
  { label: "Beauty Industry Mission", icon: Sparkles },
  { label: "No Investment", icon: CheckCircle2 },
  { label: "Transparent System", icon: CheckCircle2 },
];

const WHY_CARDS = [
  {
    icon: CheckCircle2,
    title: "Joining Fee Nahi",
    body: "Program 100% free — koi hidden charge nahi.",
  },
  {
    icon: Wallet,
    title: "Investment Nahi",
    body: "Apna paisa nahi lagana — sirf network aur time.",
  },
  {
    icon: GraduationCap,
    title: "Free Training",
    body: "Sales, pitch aur product training bilkul free.",
  },
  {
    icon: CalendarClock,
    title: "Weekly Payout",
    body: "Har hafte transparent payout seedha bank me.",
  },
  {
    icon: Trophy,
    title: "District Recognition",
    body: "Apne district me official Nexora identity.",
  },
  {
    icon: Repeat,
    title: "Long-Term Growth Share",
    body: "Recurring commission — ek baar ka nahi.",
  },
  {
    icon: Store,
    title: "Active Shops Par Earnings",
    body: "Har active shop ke revenue par share.",
  },
  { icon: Award, title: "Milestone Rewards", body: "Tier bonuses, badges aur retreats." },
];

const ECOSYSTEM = [
  { icon: Users, label: "Customers" },
  { icon: Scissors, label: "Salons" },
  { icon: UserRound, label: "Staff" },
  { icon: GraduationCap, label: "Academies" },
  { icon: Sparkles, label: "Brands" },
  { icon: Truck, label: "Distributors" },
  { icon: Handshake, label: "Partners" },
  { icon: Store, label: "Nexora Platform" },
];

const WHO_CAN_JOIN = [
  "Hair Product Salesman",
  "Cosmetic Sales Executive",
  "Distributor",
  "Brand Representative",
  "Spa Supplier",
  "Tattoo Supplier",
  "Beauty Consultant",
  "Nail Product Distributor",
];

const HOW_STEPS = [
  { n: "01", title: "Apply", body: "Free form bhariye — 2 minute me submit.", icon: FileCheck2 },
  {
    n: "02",
    title: "Mobile Verification",
    body: "OTP se apna number verify karein.",
    icon: Smartphone,
  },
  {
    n: "03",
    title: "KYC Upload",
    body: "Aadhaar / PAN upload — secure aur encrypted.",
    icon: ShieldCheck,
  },
  {
    n: "04",
    title: "District Selection",
    body: "Apna target district choose karein.",
    icon: MapPin,
  },
  {
    n: "05",
    title: "Training Complete",
    body: "Free training modules complete karein.",
    icon: BookOpen,
  },
  {
    n: "06",
    title: "Admin Approval",
    body: "Team review karti hai — 24–48 hrs me approval.",
    icon: BadgeCheck,
  },
  {
    n: "07",
    title: "Dashboard Activated",
    body: "Partner dashboard live — leads, shops, payout.",
    icon: LayoutDashboard,
  },
  {
    n: "08",
    title: "Start Onboarding Salons",
    body: "Salons onboard karein aur earning start.",
    icon: Store,
  },
];

const PARTNER_DO = [
  "Salon owners ko Nexora explain karna",
  "Shop onboarding karwana",
  "Website setup me help karna",
  "QR / payment system samjhana",
  "Shop ko active revenue-generating business banana",
];

const PARTNER_DONT = [
  "Cash collect nahi karega",
  "Salary employee nahi hoga",
  "Fake promise nahi karega",
];

const DASH_STATS = [
  { icon: Store, label: "Onboarded Shops", value: "24" },
  { icon: IndianRupee, label: "This Month", value: "₹38,200" },
  { icon: LineChart, label: "Active Rate", value: "92%" },
  { icon: Award, label: "Tier", value: "Silver" },
];

export function GrowthPartnerPage() {
  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      <PublicPageHeader />

      {/* 1. HERO — Stripe-grade */}
      <section className="relative overflow-hidden bg-white">
        {/* soft gradient wash */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#EEF0FF_0%,#FFFFFF_60%)]" />
        <div
          className="absolute inset-x-0 top-0 h-[520px] opacity-60"
          style={{
            background:
              "radial-gradient(60% 60% at 80% 0%, rgba(99,91,255,0.22), transparent 60%), radial-gradient(50% 50% at 10% 10%, rgba(37,99,235,0.18), transparent 60%)",
          }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-16 px-6 pb-24 pt-20 md:grid-cols-[1.05fr_0.95fr] md:items-center md:pt-28 md:pb-32">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#4F46E5]/20 bg-[#EEF2FF] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4F46E5]">
              <Sparkles className="h-3 w-3" /> Now Onboarding · India
            </span>
            <h1
              className="mt-6 text-[38px] font-black leading-[1.02] tracking-tight text-[#0B1330] md:text-[60px]"
              style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-0.025em" }}
            >
              <span className="bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#2563EB] bg-clip-text text-transparent">
                NEXORA GROWTH
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#2563EB] bg-clip-text text-transparent">
                PARTNER PROGRAM
              </span>
            </h1>
            <p className="mt-5 text-2xl font-semibold tracking-tight text-[#0B1330] md:text-3xl">
              Salary Nahi. <span className="text-[#4F46E5]">Growth Share.</span>
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
              Beauty industry me apna network use karo, salons onboard karo, aur Nexora ke saath
              long-term growth banao.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#partner-application"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0B1330] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(11,19,48,0.5)] transition-transform hover:-translate-y-0.5"
              >
                Apply as Growth Partner <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={NEXORA_WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-[#0B1330] transition-colors hover:border-slate-300"
              >
                <MessageCircle className="h-4 w-4 text-[#22C55E]" /> WhatsApp Now
              </a>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-[#4F46E5] hover:bg-[#EEF2FF]"
              >
                <PlayCircle className="h-4 w-4" /> Watch Opportunity
              </button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
              {TRUST_STRIP.map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#22C55E]" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — floating SaaS dashboard preview (Stripe-style) */}
          <div className="relative">
            <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[36px] bg-gradient-to-br from-[#4F46E5]/20 via-[#6366F1]/10 to-transparent blur-2xl" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)] md:p-7"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Partner Dashboard
                  </div>
                  <div className="mt-0.5 text-base font-bold text-[#0B1330]">Ramesh · Jaipur</div>
                </div>
                <span className="rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#4F46E5]">
                  Silver Tier
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {DASH_STATS.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-slate-100 bg-[#FAFBFF] p-4"
                  >
                    <s.icon className="h-4 w-4 text-[#4F46E5]" />
                    <div className="mt-2 text-[11px] font-medium text-slate-500">{s.label}</div>
                    <div className="mt-1 text-xl font-black text-[#0B1330]">{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Onboarding this week</span>
                  <span className="text-[#22C55E]">+18%</span>
                </div>
                <div className="mt-3 flex h-16 items-end gap-1.5">
                  {[35, 55, 40, 70, 60, 85, 95].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 0.3 + i * 0.06, duration: 0.6, ease: "easeOut" }}
                      className="flex-1 rounded-md bg-gradient-to-t from-[#4F46E5] to-[#6366F1]"
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#0B1330] p-4 text-white">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                    Next Payout
                  </div>
                  <div className="mt-0.5 text-lg font-black">₹12,480</div>
                </div>
                <Wallet className="h-6 w-6 text-white/80" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. TRUST STRIP — Not / Is */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-6 py-8 md:grid-cols-2 md:gap-10">
          <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              This is not
            </span>
            {NOT_THIS.map((b) => (
              <span
                key={b.label}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600"
              >
                <b.icon className="h-3.5 w-3.5" />
                {b.label}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 md:justify-end">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4F46E5]">
              This is
            </span>
            {IS_THIS.map((b) => (
              <span
                key={b.label}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2FF] px-3 py-1.5 text-xs font-semibold text-[#4F46E5]"
              >
                <b.icon className="h-3.5 w-3.5" />
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. WHY BECOME PARTNER */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#4F46E5]">
            Why Partner
          </span>
          <h2
            className="mt-4 text-4xl font-black tracking-tight text-[#0B1330] md:text-5xl"
            style={{ letterSpacing: "-0.02em" }}
          >
            Aap already qualified hain.
          </h2>
          <p className="mt-5 text-lg text-slate-600">
            Aap beauty industry me kaam kar rahe hain. Nexora us kaam ko ek scalable business me
            convert karta hai.
          </p>
        </div>
        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {WHY_CARDS.map((f, i) => (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="group rounded-3xl border border-slate-200/70 bg-white p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-1 hover:border-[#4F46E5]/30 hover:shadow-[0_20px_50px_-20px_rgba(79,70,229,0.35)]"
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#6366F1] text-white shadow-[0_10px_25px_-10px_rgba(79,70,229,0.6)]">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 text-xl font-bold tracking-tight text-[#0B1330]">{f.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{f.body}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* 4. HOW IT WORKS — 8 step onboarding */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#4F46E5]">
              How it works
            </span>
            <h2
              className="mt-4 text-4xl font-black tracking-tight text-[#0B1330] md:text-5xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              8 steps to activate your partner dashboard.
            </h2>
          </div>
          <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {HOW_STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.04 }}
                className="relative rounded-2xl border border-slate-200/70 bg-[#FAFBFF] p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#4F46E5] ring-1 ring-slate-200/70">
                    <s.icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-black tracking-widest text-[#4F46E5]/40">
                    {s.n}
                  </span>
                </div>
                <h3 className="mt-5 text-base font-bold tracking-tight text-[#0B1330]">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4b. PARTNER WORK */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#4F46E5]">
            Partner Work
          </span>
          <h2
            className="mt-4 text-4xl font-black tracking-tight text-[#0B1330] md:text-5xl"
            style={{ letterSpacing: "-0.02em" }}
          >
            Partner ka kaam kya hai.
          </h2>
          <p className="mt-5 text-lg text-slate-600">
            Clear scope — kya karna hai, kya nahi karna hai.
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200/70 bg-white p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#ECFDF5] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#059669]">
              <CheckCircle2 className="h-3.5 w-3.5" /> Karna hai
            </div>
            <ul className="mt-6 space-y-4">
              {PARTNER_DO.map((t) => (
                <li key={t} className="flex items-start gap-3 text-[15px] text-[#0B1330]">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
                  <span className="font-medium">{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-200/70 bg-white p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-red-600">
              <ShieldAlert className="h-3.5 w-3.5" /> Nahi karna hai
            </div>
            <ul className="mt-6 space-y-4">
              {PARTNER_DONT.map((t) => (
                <li key={t} className="flex items-start gap-3 text-[15px] text-[#0B1330]">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                  <span className="font-medium">Partner {t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 4c. EARNING MODEL */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#4F46E5]">
              Earning Model
            </span>
            <h2
              className="mt-4 text-4xl font-black tracking-tight text-[#0B1330] md:text-5xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              No Collection = No Commission.
            </h2>
            <p className="mt-5 text-lg text-slate-600">
              Real Collection = Real Partner Earning. Sirf verified, published, active aur
              revenue-generating shops par commission.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-3xl border border-indigo-100 bg-[#EEF2FF] text-left shadow-[0_28px_70px_-38px_rgba(79,70,229,.6)]">
            <div className="grid sm:grid-cols-[0.9fr_1.1fr]">
              <img
                src={partnerHeroSalon}
                alt="Nexora Growth Partner helping a salon business grow"
                className="h-48 w-full object-cover sm:h-full"
                loading="lazy"
              />
              <div className="p-5 sm:p-6">
                <div className="text-[10px] font-bold uppercase tracking-[.14em] text-[#4F46E5]">
                  Growth that keeps working
                </div>
                <p className="mt-2 text-base font-black leading-snug text-[#0B1330]">
                  Ek verified, published aur active shop aapke liye long-term platform revenue share
                  create kar sakti hai.
                </p>
                <div className="mt-3 inline-flex rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#312E81]">
                  Platform revenue only · customer ke total bill par nahi
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: BadgeCheck,
                title: "Verified",
                body: "Shop KYC aur listing verified honi chahiye.",
              },
              {
                icon: Store,
                title: "Published & Active",
                body: "Shop live aur customers ko book kar rahi ho.",
              },
              {
                icon: CircleDollarSign,
                title: "Revenue-Generating",
                body: "Nexora platform par asli revenue aana chahiye.",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="rounded-3xl border border-slate-200/70 bg-[#FAFBFF] p-7"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#6366F1] text-white">
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-bold tracking-tight text-[#0B1330]">{c.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{c.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-4 py-2 font-bold text-red-600">
              <XCircle className="h-4 w-4" /> No Collection = No Commission
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-4 py-2 font-bold text-[#059669]">
              <CheckCircle2 className="h-4 w-4" /> Real Collection = Real Earning
            </span>
          </div>
        </div>
      </section>

      {/* 4d. ONE-TIME ACTIVATION COMMISSION */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <div className="grid gap-10 md:grid-cols-[1fr_1fr] md:items-center">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#4F46E5]">
              Activation Commission
            </span>
            <h2
              className="mt-4 text-4xl font-black tracking-tight text-[#0B1330] md:text-5xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              10% one-time activation commission.
            </h2>
            <p className="mt-5 text-lg text-slate-600">
              Aapke dwara onboard ki gayi shop ke{" "}
              <strong className="text-[#0B1330]">first 15 days</strong> ke active Nexora platform
              revenue par 10% one-time activation commission.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2FF] px-4 py-2 text-xs font-bold text-[#4F46E5]">
                <KeyRound className="h-3.5 w-3.5" /> First 15 Days
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2FF] px-4 py-2 text-xs font-bold text-[#4F46E5]">
                <IndianRupee className="h-3.5 w-3.5" /> 10% Commission
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2FF] px-4 py-2 text-xs font-bold text-[#4F46E5]">
                <Repeat className="h-3.5 w-3.5" /> Per Shop
              </span>
            </div>
          </div>

          {/* Example calculator card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl border border-slate-200/80 bg-white p-7 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.2)]"
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Live Example
            </div>
            <div className="mt-4 space-y-3">
              {[
                { k: "Shop Nexora revenue", v: "₹100 / day" },
                { k: "15 days revenue", v: "₹1,500" },
                { k: "Activation commission (10%)", v: "₹150" },
              ].map((r) => (
                <div
                  key={r.k}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-[#FAFBFF] px-4 py-3"
                >
                  <span className="text-sm text-slate-600">{r.k}</span>
                  <span className="text-sm font-bold text-[#0B1330]">{r.v}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-[#0B1330] p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                    100 shops onboarded
                  </div>
                  <div className="mt-1 text-3xl font-black">₹15,000</div>
                  <div className="mt-0.5 text-xs text-white/60">
                    ₹150 × 100 shops · one-time activation
                  </div>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
                  <IndianRupee className="h-5 w-5" />
                </div>
              </div>
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
              *Recurring growth-share commission is separate. Numbers illustrative — actual earnings
              depend on shop revenue.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 4e. RECURRING GROWTH SHARE — commission ladder */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#4F46E5]">
              Recurring Growth Share
            </span>
            <h2
              className="mt-4 text-4xl font-black tracking-tight text-[#0B1330] md:text-5xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              Long-term commission ladder.
            </h2>
            <p className="mt-5 text-lg text-slate-600">
              Har onboarded shop par recurring share — jaisi shop chalti rahegi, waise earning aati
              rahegi.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              {
                tier: "First 6 Months",
                rate: "10%",
                tone: "from-[#4F46E5] to-[#6366F1]",
                ring: "ring-[#4F46E5]/20",
                image: partnerBarber,
                caption: "Onboard & activate",
              },
              {
                tier: "Month 7 – 12",
                rate: "5%",
                tone: "from-[#6366F1] to-[#818CF8]",
                ring: "ring-[#6366F1]/20",
                image: partnerBeautyParlour,
                caption: "Keep the shop growing",
              },
              {
                tier: "After 12 Months",
                rate: "2%",
                tone: "from-[#818CF8] to-[#A5B4FC]",
                ring: "ring-[#818CF8]/20",
                image: partnerHeroSalon,
                caption: "Long-term growth share",
              },
            ].map((t, i) => (
              <motion.div
                key={t.tier}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.06 }}
                className={`relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-8 ring-1 ${t.ring}`}
              >
                <div className="relative -mx-3 -mt-3 mb-6 h-36 overflow-hidden rounded-2xl">
                  <img
                    src={t.image}
                    alt={t.caption}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${t.tone} opacity-40`} />
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black text-[#0B1330]">
                    {t.caption}
                  </span>
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {t.tier}
                </div>
                <div
                  className={`mt-3 bg-gradient-to-br ${t.tone} bg-clip-text text-6xl font-black tracking-tight text-transparent`}
                  style={{ letterSpacing: "-0.03em" }}
                >
                  {t.rate}
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-500">
                  of Nexora platform revenue
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-4xl rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 shadow-[0_16px_40px_-30px_rgba(217,119,6,.7)]">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div className="text-sm leading-relaxed text-amber-900">
                <p>
                  <strong>Important:</strong> Ye commission Nexora ke platform revenue me se milega.
                </p>
                <p className="mt-1">
                  Ye shop ke total bill amount me se <strong>nahi</strong> milega.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4f. WEEKLY PAYOUT — dashboard preview */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#4F46E5]">
              Weekly Payout
            </span>
            <h2
              className="mt-4 text-4xl font-black tracking-tight text-[#0B1330] md:text-5xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              Transparent dashboard. Weekly auto payout.
            </h2>
            <p className="mt-5 text-lg text-slate-600">
              Partner commission daily dashboard me show hoga. Eligible commission har 7 days me
              auto payout hota hai — aur available balance ka withdrawal kabhi bhi request kar sakte
              ho.
            </p>
            <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                "Daily collection",
                "Daily commission",
                "Pending balance",
                "Available balance",
                "Weekly payout",
                "Payout status",
                "Statement download",
              ].map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-2 text-sm font-semibold text-[#0B1330]"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — payout dashboard mock */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)] md:p-7"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Payout Cycle
                </div>
                <div className="mt-0.5 text-base font-bold text-[#0B1330]">Mon 24 → Sun 30</div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#059669]">
                <CalendarClock className="h-3 w-3" /> Auto · Weekly
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { label: "Daily Collection", value: "₹4,200", tint: "text-[#0B1330]" },
                { label: "Daily Commission", value: "₹420", tint: "text-[#4F46E5]" },
                { label: "Pending Balance", value: "₹1,180", tint: "text-amber-600" },
                { label: "Available Balance", value: "₹12,480", tint: "text-[#059669]" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-slate-100 bg-[#FAFBFF] p-4">
                  <div className="text-[11px] font-medium text-slate-500">{s.label}</div>
                  <div className={`mt-1 text-xl font-black ${s.tint}`}>{s.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-500">This week payout</div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[10px] font-bold text-[#059669]">
                  Processed
                </span>
              </div>
              <div className="mt-2 flex items-end justify-between">
                <div className="text-2xl font-black text-[#0B1330]">₹8,650</div>
                <div className="text-[11px] text-slate-500">Credited · Fri 3:12 PM</div>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-[#22C55E] to-[#059669]"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                className="flex-1 rounded-xl bg-[#0B1330] px-4 py-3 text-sm font-bold text-white"
              >
                Withdraw Balance
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#0B1330]"
              >
                <BarChart3 className="h-4 w-4" /> Statement
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. ECOSYSTEM */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#4F46E5]">
            The Ecosystem
          </span>
          <h2
            className="mt-4 text-4xl font-black tracking-tight text-[#0B1330] md:text-5xl"
            style={{ letterSpacing: "-0.02em" }}
          >
            One platform, every layer.
          </h2>
          <p className="mt-5 text-lg text-slate-600">
            Customers se lekar platform tak — aap us network ka growth engine bante hain.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
          {ECOSYSTEM.map((n, i) => (
            <motion.div
              key={n.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-3 rounded-2xl border p-5 transition-transform hover:-translate-y-1 ${
                i === ECOSYSTEM.length - 1
                  ? "border-transparent bg-[#0B1330] text-white shadow-[0_20px_50px_-20px_rgba(11,19,48,0.6)]"
                  : "border-slate-200/70 bg-white"
              }`}
            >
              <div
                className={`grid h-10 w-10 place-items-center rounded-xl ${
                  i === ECOSYSTEM.length - 1
                    ? "bg-white/10 text-white"
                    : "bg-[#EEF2FF] text-[#4F46E5]"
                }`}
              >
                <n.icon className="h-5 w-5" />
              </div>
              <span
                className={`text-sm font-bold ${i === ECOSYSTEM.length - 1 ? "text-white" : "text-[#0B1330]"}`}
              >
                {n.label}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. WHO CAN JOIN */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#4F46E5]">
              Who can join
            </span>
            <h2
              className="mt-4 text-4xl font-black tracking-tight text-[#0B1330] md:text-5xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              Built for beauty industry pros.
            </h2>
          </div>
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHO_CAN_JOIN.map((role, i) => (
              <motion.div
                key={role}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="group rounded-2xl border border-slate-200/70 bg-[#FAFBFF] p-6 transition-all hover:-translate-y-1 hover:border-[#4F46E5]/30 hover:bg-white hover:shadow-[0_20px_40px_-20px_rgba(79,70,229,0.3)]"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-[#4F46E5] shadow-sm ring-1 ring-slate-200/70">
                  <UserRound className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-base font-bold tracking-tight text-[#0B1330]">{role}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6b. ELIGIBILITY, FAQ & TERMS — requirements not repeated elsewhere */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-9">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#4F46E5]">
              <FileCheck2 className="h-4 w-4" /> Eligibility & requirements
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-[#0B1330]">
              Ready before you apply.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Application review ke liye ye basic details aur commitments zaroori hain.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Minimum 18 years",
                "Valid mobile number",
                "Identity verification",
                "Bank account after approval",
                "District selection",
                "Agreement acceptance",
                "Training completion",
                "Admin approval",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-xl bg-[#FAFBFF] p-3 text-sm font-semibold text-[#0B1330]"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-[#0B1330] p-7 text-white shadow-[0_24px_60px_-28px_rgba(11,19,48,.7)] md:p-9">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-200">
              <ShieldAlert className="h-4 w-4" /> Program terms
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight">Fair earning. Clear rules.</h2>
            <ul className="mt-6 space-y-3 text-sm leading-relaxed text-slate-200">
              {[
                "No salary guarantee or fake earning promise.",
                "Commission only on verified, active shops and successful Nexora platform revenue.",
                "Refunded, fraudulent or cancelled transactions are not payable.",
                "Company may hold payouts during a fraud or policy review.",
                "Partners must follow Nexora brand policy; reward and dispute decisions follow company policy.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 mx-auto max-w-4xl">
          <div className="text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#4F46E5]">
              FAQs
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0B1330] md:text-4xl">
              Questions, answered clearly.
            </h2>
          </div>
          <div className="mt-8 space-y-3">
            {[
              [
                "Is this a job, salary plan or franchise?",
                "No. This is a performance-based Growth Partner program, not a job, salary plan, franchise or MLM.",
              ],
              [
                "How do I earn?",
                "You earn commission only from successful Nexora platform revenue of shops you personally onboard that become verified, published and active.",
              ],
              [
                "When is payout processed?",
                "Commission is calculated daily. Eligible balance is processed in the weekly payout cycle; available balance may be requested as per policy.",
              ],
              [
                "What is an active shop?",
                "A verified, published, QR/payment-active and fraud-free shop with at least one successful collection in the last 30 days.",
              ],
              [
                "What happens if a transaction is refunded?",
                "Refunded, cancelled, suspicious or fraudulent transactions are excluded and may be held for review.",
              ],
              [
                "Can I onboard shops in another district?",
                "Work is normally mapped to your approved district. Any territory change needs Nexora team approval.",
              ],
            ].map(([question, answer]) => (
              <details
                key={question}
                className="group rounded-2xl border border-slate-200 bg-white p-5 open:border-[#4F46E5]/30"
              >
                <summary className="cursor-pointer list-none pr-8 text-sm font-bold text-[#0B1330]">
                  {question}
                  <span className="float-right text-lg text-[#4F46E5] group-open:hidden">+</span>
                  <span className="float-right hidden text-lg text-[#4F46E5] group-open:inline">
                    −
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 9. MILESTONE REWARDS */}
      <section className="bg-[#F6F7FB] px-4 py-12 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_50%_110%,rgba(245,158,11,.22),transparent_38%),linear-gradient(135deg,#050719,#090d24)] px-5 py-14 text-white shadow-2xl sm:px-8 sm:py-20 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-400/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-300">
              <Trophy className="h-3.5 w-3.5" /> Growth Partner Rewards
            </span>
            <h2
              className="mt-5 text-4xl font-black tracking-tight text-white md:text-5xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              Hit targets. <span className="text-amber-300">Unlock premium rewards.</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">
              Sirf active, verified aur revenue-generating shops count hoti hain. Har milestone
              aapke kaam ko support karne ke liye designed hai — personal identity se lekar business
              productivity aur district leadership tak.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                count: "25",
                reward: "Welcome Kit",
                image: rewardWelcomeKit,
                benefit:
                  "Premium pen, diary, backpack, cap aur ID card — meetings aur onboarding ke liye aapki professional Nexora identity.",
              },
              {
                count: "50",
                reward: "Official Nexora T-Shirt",
                image: rewardWelcomeKit,
                benefit:
                  "Verified partner apparel — local shop visits, events aur field work mein ek trusted brand presence banata hai.",
              },
              {
                count: "100",
                reward: "Tablet Reward",
                image: rewardTablet,
                benefit:
                  "Shop demo, onboarding form, service catalogue aur dashboard presentations ko fast aur professional banata hai.",
              },
              {
                count: "500",
                reward: "Branded Laptop",
                image: rewardLaptop,
                benefit:
                  "Large shop pipeline, training, reports aur business growth ko manage karne ke liye high-performance work device.",
              },
              {
                count: "1000",
                reward: "District Partner + Car",
                image: rewardCar,
                benefit:
                  "District Business Partner recognition ke saath mobility upgrade — larger territory aur leadership opportunity ke liye.",
              },
            ].map((m, i) => (
              <motion.div
                key={m.count}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="relative overflow-hidden rounded-2xl border border-slate-700/80 bg-[#0d1730] p-3 transition-transform hover:-translate-y-1 hover:border-amber-400/60"
              >
                <span className="absolute right-2 top-2 z-10 rounded-md bg-amber-400 px-2.5 py-1 text-[10px] font-black text-slate-950 shadow-lg">
                  {m.count} SHOPS
                </span>
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-950">
                  <img
                    src={m.image}
                    alt={m.reward}
                    className="h-full w-full object-cover opacity-90"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071124]/75 via-transparent to-transparent" />
                </div>
                <div className="px-2 pb-2 pt-4">
                  <div className="text-base font-black text-white">{m.reward}</div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300">{m.benefit}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.06] p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-200">
                Reward eligibility
              </span>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">
              Rewards automatic entitlement nahi hain. Milestone tab unlock hota hai jab shop
              genuine, active aur policy-compliant ho. Isse partner ke rewards aur platform dono
              fair rehte hain.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                "Business verified",
                "Website published",
                "Nexora QR/payment active",
                "Successful collection in last 30 days",
                "Not suspended",
                "Fraud-free",
              ].map((c) => (
                <div
                  key={c}
                  className="flex items-start gap-3 rounded-xl bg-white/[0.06] p-4 ring-1 ring-white/10"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  <span className="text-sm font-medium text-slate-100">{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 10. APPLY FORM */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#4F46E5]">
              Apply Form
            </span>
            <h2
              className="mt-4 text-4xl font-black tracking-tight text-[#0B1330] md:text-5xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              Ready to become a Growth Partner?
            </h2>
            <p className="mt-5 text-lg text-slate-600">
              Apni details submit karo. Nexora team KYC verify karke aapka Growth Partner dashboard
              activate karegi.
            </p>
            <div className="mt-8 space-y-3">
              {[
                "Free joining — no investment",
                "Verification in 24–48 hours",
                "Instant dashboard access after approval",
                "Weekly payout on eligible commission",
              ].map((p) => (
                <div key={p} className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
                  <span className="text-sm font-medium text-slate-700">{p}</span>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <GrowthPartnerApplicationForm />
          </motion.div>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <div className="relative overflow-hidden rounded-[32px] bg-[#0B1330] px-8 py-16 md:px-16 md:py-24">
          <div
            className="absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(50% 60% at 80% 20%, rgba(99,91,255,0.35), transparent 60%), radial-gradient(40% 50% at 10% 90%, rgba(37,99,235,0.3), transparent 60%)",
            }}
          />
          <div className="relative grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <h2
                className="text-4xl font-black tracking-tight text-white md:text-5xl"
                style={{ letterSpacing: "-0.02em" }}
              >
                Apna district. Apna business.
              </h2>
              <p className="mt-5 max-w-lg text-lg text-white/70">
                Free join karo, salons onboard karo, aur weekly payout ke saath long-term growth
                share earn karo.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#partner-application"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#0B1330] transition-transform hover:-translate-y-0.5"
                >
                  Apply as Growth Partner <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href={NEXORA_WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/10"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp Now
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: BarChart3, label: "Live Dashboard" },
                { icon: Wallet, label: "Weekly Payout" },
                { icon: ShieldCheck, label: "Transparent" },
                { icon: Award, label: "Tier Rewards" },
              ].map((c) => (
                <div
                  key={c.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
                >
                  <c.icon className="h-5 w-5 text-white" />
                  <div className="mt-3 text-sm font-bold text-white">{c.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
