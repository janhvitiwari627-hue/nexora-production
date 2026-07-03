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
import { JoinPartnerDialog } from "./JoinPartnerDialog";

const TRUST_STRIP = [
  "Free Joining",
  "No Investment",
  "Weekly Payout",
  "Transparent Dashboard",
];

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
  { icon: CheckCircle2, title: "Joining Fee Nahi", body: "Program 100% free — koi hidden charge nahi." },
  { icon: Wallet, title: "Investment Nahi", body: "Apna paisa nahi lagana — sirf network aur time." },
  { icon: GraduationCap, title: "Free Training", body: "Sales, pitch aur product training bilkul free." },
  { icon: CalendarClock, title: "Weekly Payout", body: "Har hafte transparent payout seedha bank me." },
  { icon: Trophy, title: "District Recognition", body: "Apne district me official Nexora identity." },
  { icon: Repeat, title: "Long-Term Growth Share", body: "Recurring commission — ek baar ka nahi." },
  { icon: Store, title: "Active Shops Par Earnings", body: "Har active shop ke revenue par share." },
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
  { n: "02", title: "Mobile Verification", body: "OTP se apna number verify karein.", icon: Smartphone },
  { n: "03", title: "KYC Upload", body: "Aadhaar / PAN upload — secure aur encrypted.", icon: ShieldCheck },
  { n: "04", title: "District Selection", body: "Apna target district choose karein.", icon: MapPin },
  { n: "05", title: "Training Complete", body: "Free training modules complete karein.", icon: BookOpen },
  { n: "06", title: "Admin Approval", body: "Team review karti hai — 24–48 hrs me approval.", icon: BadgeCheck },
  { n: "07", title: "Dashboard Activated", body: "Partner dashboard live — leads, shops, payout.", icon: LayoutDashboard },
  { n: "08", title: "Start Onboarding Salons", body: "Salons onboard karein aur earning start.", icon: Store },
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
              <Sparkles className="h-3 w-3" /> Nexora Growth Partner Program
            </span>
            <h1
              className="mt-6 text-[44px] font-black leading-[1.02] tracking-tight text-[#0B1330] md:text-[68px]"
              style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-0.02em" }}
            >
              Salary Nahi.
              <br />
              <span className="bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#2563EB] bg-clip-text text-transparent">
                Growth Share.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600 md:text-xl">
              Beauty industry me apna network use karo, salons onboard karo, aur Nexora
              ke saath long-term growth banao.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <JoinPartnerDialog
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0B1330] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(11,19,48,0.5)] transition-transform hover:-translate-y-0.5"
                  >
                    Apply as Growth Partner <ArrowRight className="h-4 w-4" />
                  </button>
                }
              />
              <a
                href="https://wa.me/919999999999"
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
          <h2 className="mt-4 text-4xl font-black tracking-tight text-[#0B1330] md:text-5xl" style={{ letterSpacing: "-0.02em" }}>
            Aap already qualified hain.
          </h2>
          <p className="mt-5 text-lg text-slate-600">
            Aap beauty industry me kaam kar rahe hain. Nexora us kaam ko ek scalable business
            me convert karta hai.
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
              <h3 className="mt-6 text-xl font-bold tracking-tight text-[#0B1330]">
                {f.title}
              </h3>
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
            <h2 className="mt-4 text-4xl font-black tracking-tight text-[#0B1330] md:text-5xl" style={{ letterSpacing: "-0.02em" }}>
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
          <h2 className="mt-4 text-4xl font-black tracking-tight text-[#0B1330] md:text-5xl" style={{ letterSpacing: "-0.02em" }}>
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
            <h2 className="mt-4 text-4xl font-black tracking-tight text-[#0B1330] md:text-5xl" style={{ letterSpacing: "-0.02em" }}>
              No Collection = No Commission.
            </h2>
            <p className="mt-5 text-lg text-slate-600">
              Real Collection = Real Partner Earning. Sirf verified, published, active aur
              revenue-generating shops par commission.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              { icon: BadgeCheck, title: "Verified", body: "Shop KYC aur listing verified honi chahiye." },
              { icon: Store, title: "Published & Active", body: "Shop live aur customers ko book kar rahi ho." },
              { icon: CircleDollarSign, title: "Revenue-Generating", body: "Nexora platform par asli revenue aana chahiye." },
            ].map((c) => (
              <div
                key={c.title}
                className="rounded-3xl border border-slate-200/70 bg-[#FAFBFF] p-7"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#6366F1] text-white">
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-bold tracking-tight text-[#0B1330]">
                  {c.title}
                </h3>
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
            <h2 className="mt-4 text-4xl font-black tracking-tight text-[#0B1330] md:text-5xl" style={{ letterSpacing: "-0.02em" }}>
              10% one-time activation commission.
            </h2>
            <p className="mt-5 text-lg text-slate-600">
              Aapke dwara onboard ki gayi shop ke <strong className="text-[#0B1330]">first 15 days</strong>{" "}
              ke active Nexora platform revenue par 10% one-time activation commission.
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
              *Recurring growth-share commission is separate. Numbers illustrative — actual
              earnings depend on shop revenue.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 5. ECOSYSTEM */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#4F46E5]">
            The Ecosystem
          </span>
          <h2 className="mt-4 text-4xl font-black tracking-tight text-[#0B1330] md:text-5xl" style={{ letterSpacing: "-0.02em" }}>
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
              <span className={`text-sm font-bold ${i === ECOSYSTEM.length - 1 ? "text-white" : "text-[#0B1330]"}`}>
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
            <h2 className="mt-4 text-4xl font-black tracking-tight text-[#0B1330] md:text-5xl" style={{ letterSpacing: "-0.02em" }}>
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
                <h3 className="mt-5 text-base font-bold tracking-tight text-[#0B1330]">
                  {role}
                </h3>
              </motion.div>
            ))}
          </div>
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
              <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl" style={{ letterSpacing: "-0.02em" }}>
                Apna district. Apna business.
              </h2>
              <p className="mt-5 max-w-lg text-lg text-white/70">
                Free join karo, salons onboard karo, aur weekly payout ke saath long-term
                growth share earn karo.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <JoinPartnerDialog
                  trigger={
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#0B1330] transition-transform hover:-translate-y-0.5"
                    >
                      Apply as Growth Partner <ArrowRight className="h-4 w-4" />
                    </button>
                  }
                />
                <a
                  href="https://wa.me/919999999999"
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
