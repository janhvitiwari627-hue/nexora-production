import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BarChart3,
  CheckCircle2,
  GraduationCap,
  Handshake,
  IndianRupee,
  LineChart,
  MessageCircle,
  Network,
  PlayCircle,
  Scissors,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  Truck,
  UserRound,
  Users,
  Wallet,
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
  { icon: Network, title: "Existing Network", body: "Aapke pass already salons, parlours aur beauty pros ka network hai — usi ko digital banayein." },
  { icon: Handshake, title: "Existing Trust", body: "Log aap par pehle se bharosa karte hain. Nexora us trust ko growth me convert karta hai." },
  { icon: Store, title: "Existing Market", body: "Aapka district, aapka market. Koi cold calling nahi — sirf apne logon ko onboard karein." },
  { icon: TrendingUp, title: "Business Opportunity", body: "Recurring revenue share har active shop par. Ek asli business, side hustle nahi." },
  { icon: Award, title: "Recognition", body: "Tiers, badges, leaderboard aur annual retreat — aapke kaam ko pehchan milti hai." },
  { icon: Sparkles, title: "Long-Term Growth", body: "Beauty industry India me har saal badh rahi hai. Aap us growth ke partner banein." },
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
  { n: "01", title: "Apply", body: "Free form bhariye — 2 minute me submit ho jata hai." },
  { n: "02", title: "Onboard Salons", body: "Apne district ke salons ko Nexora par register karayein." },
  { n: "03", title: "Earn Growth Share", body: "Har active shop par recurring share — weekly payout." },
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

      {/* 4. HOW IT WORKS */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#4F46E5]">
              How it works
            </span>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-[#0B1330] md:text-5xl" style={{ letterSpacing: "-0.02em" }}>
              3 simple steps to start earning.
            </h2>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {HOW_STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative rounded-3xl border border-slate-200/70 bg-[#FAFBFF] p-8"
              >
                <div className="text-5xl font-black tracking-tighter text-[#4F46E5]/20">
                  {s.n}
                </div>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#0B1330]">
                  {s.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{s.body}</p>
              </motion.div>
            ))}
          </div>
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
