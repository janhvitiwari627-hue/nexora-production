import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  BarChart3,
  Building2,
  Check,
  Handshake,
  IndianRupee,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { PublicPageHeader } from "@/components/shared/PublicPageHeader";

const BENEFITS = [
  {
    icon: IndianRupee,
    title: "Recurring income",
    body: "Earn a lifetime revenue share on every salon and beauty business you onboard in your district.",
  },
  {
    icon: MapPin,
    title: "Own your district",
    body: "Exclusive territory rights. Build the beauty economy of your city with Nexora as your OS.",
  },
  {
    icon: TrendingUp,
    title: "Growth playbook",
    body: "Proven onboarding scripts, marketing assets and sales collateral — ready from day one.",
  },
  {
    icon: ShieldCheck,
    title: "Zero investment",
    body: "No franchise fee. No inventory. No office. Start with just a phone and a laptop.",
  },
  {
    icon: BarChart3,
    title: "Live dashboards",
    body: "Track shops onboarded, active revenue, tier progression and payouts in real time.",
  },
  {
    icon: Award,
    title: "Recognition & rewards",
    body: "Climb tiers — Welcome, Recognition, Growth Builder, Platinum, Leadership Circle.",
  },
];

const TIERS = [
  {
    name: "Recognition",
    shops: "10 shops",
    perks: ["Welcome kit", "Verified badge", "Priority support"],
  },
  {
    name: "Growth Builder",
    shops: "25 shops",
    popular: true,
    perks: ["Higher revenue share", "Featured on leaderboard", "Marketing co-fund"],
  },
  {
    name: "Leadership Circle",
    shops: "100+ shops",
    perks: ["Top-tier payouts", "Hall of Fame", "Annual retreat", "Direct exec access"],
  },
];

const STEPS = [
  { n: "01", t: "Apply", d: "Fill a short application. We shortlist one partner per district." },
  { n: "02", t: "Onboard", d: "Get your playbook, dashboard access and district assignment." },
  { n: "03", t: "Sign shops", d: "Bring salons, parlours and beauty pros onto Nexora SalonOS." },
  { n: "04", t: "Earn", d: "Recurring revenue share, tier rewards and payouts every cycle." },
];

export function GrowthPartnerPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicPageHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0A2540] py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,91,255,0.35),transparent_60%)]" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 text-center md:px-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
            <Zap className="h-3 w-3" /> Growth Partner Program
          </span>
          <h1
            className="mt-5 text-4xl font-black tracking-tight text-white md:text-6xl"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Build India's beauty economy — <br className="hidden md:block" />
            one district at a time.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-white/80 md:text-lg">
            Become a District Business Partner for Nexora SalonOS. Onboard salons, unlock recurring
            income, and grow with India's Beauty Industry Operating System.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/contact"
              className="bg-gradient-cta text-primary-foreground inline-flex items-center gap-2 rounded-[var(--radius-button)] px-6 py-3 text-sm font-bold shadow-[var(--shadow-glow)]"
            >
              Apply now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="rounded-[var(--radius-button)] border border-white/30 px-6 py-3 text-sm font-bold text-white hover:bg-white/10"
            >
              Talk to program lead
            </Link>
          </div>

          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-3 gap-6">
            {[
              ["₹80k+", "Avg monthly earnings"],
              ["1", "Partner per district"],
              ["0", "Investment required"],
            ].map(([v, l]) => (
              <div key={l} className="text-center">
                <div className="text-2xl font-black text-white md:text-4xl">{v}</div>
                <div className="mt-1 text-[11px] uppercase tracking-wider text-white/70">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center md:px-6">
        <h2 className="text-heading text-3xl font-black md:text-5xl">
          A modern business, not an MLM.
        </h2>
        <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-base md:text-lg">
          Nexora Growth Partners are entrepreneurs who bring the beauty industry online. You get a
          territory, a product loved by owners, and transparent payouts — everything a real business
          needs.
        </p>
      </section>

      {/* Benefits */}
      <section className="bg-muted/30 border-y border-border py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-heading text-center text-3xl font-black md:text-4xl">
            Why partners choose Nexora
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((f, i) => (
              <motion.article
                key={f.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="border-border bg-card rounded-[var(--radius-card)] border p-6"
              >
                <div className="bg-gradient-cta text-primary-foreground grid h-11 w-11 place-items-center rounded-xl">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-heading mt-4 text-lg font-bold">{f.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{f.body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <h2 className="text-heading text-center text-3xl font-black md:text-4xl">
          How it works
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-center">
          Four simple steps from application to your first payout cycle.
        </p>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="border-border bg-card rounded-[var(--radius-card)] border p-6"
            >
              <div className="text-primary text-xs font-black tracking-widest">{s.n}</div>
              <h3 className="text-heading mt-2 text-lg font-bold">{s.t}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tiers */}
      <section className="bg-muted/30 border-y border-border py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-heading text-center text-3xl font-black md:text-4xl">
            Grow through tiers
          </h2>
          <p className="text-muted-foreground mt-3 text-center">
            Unlock higher revenue share and status as you onboard more shops.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {TIERS.map((p) => (
              <article
                key={p.name}
                className={`border-border bg-card relative rounded-[24px] border p-7 ${p.popular ? "ring-2 ring-primary shadow-[var(--shadow-glow)]" : ""}`}
              >
                {p.popular && (
                  <span className="bg-gradient-cta text-primary-foreground absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                    Most popular
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <Trophy className="text-primary h-5 w-5" />
                  <h3 className="text-heading text-xl font-bold">{p.name}</h3>
                </div>
                <p className="text-muted-foreground mt-2 text-sm">{p.shops} onboarded</p>
                <ul className="text-heading mt-5 space-y-2 text-sm">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2">
                      <Check className="text-success mt-0.5 h-4 w-4 shrink-0" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-5xl px-4 py-20 md:px-6">
        <h2 className="text-heading text-center text-3xl font-black md:text-4xl">
          Partners building with Nexora
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {[
            {
              name: "Rahul Mehta",
              role: "District Partner, Jaipur",
              text: "Signed 34 salons in 5 months. The dashboard and payouts make it feel like a real business, not a side hustle.",
            },
            {
              name: "Priya Nair",
              role: "District Partner, Kochi",
              text: "Nexora gave me a product owners actually want. Recurring income has replaced my old 9–5.",
            },
          ].map((t) => (
            <article
              key={t.name}
              className="border-border bg-card rounded-[var(--radius-card)] border p-6"
            >
              <div className="text-warning flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mt-3 text-base leading-relaxed">"{t.text}"</p>
              <div className="border-border mt-4 border-t pt-3">
                <div className="text-heading text-sm font-bold">{t.name}</div>
                <div className="text-muted-foreground text-xs">{t.role}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Who should apply */}
      <section className="bg-muted/30 border-y border-border py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2 md:px-6">
          <div>
            <h2 className="text-heading text-3xl font-black md:text-4xl">
              Who should apply
            </h2>
            <p className="text-muted-foreground mt-4 text-base leading-relaxed">
              We look for driven entrepreneurs who understand their local beauty market and want to
              build a lasting business with Nexora.
            </p>
            <ul className="text-heading mt-6 space-y-3 text-sm">
              {[
                "Local network in the salon / beauty industry",
                "Comfortable with basic tech and WhatsApp business",
                "Sales, BD or entrepreneurial mindset",
                "Ready to commit 20+ hours a week",
              ].map((x) => (
                <li key={x} className="flex items-start gap-2">
                  <Check className="text-success mt-0.5 h-4 w-4 shrink-0" />
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="border-border bg-card rounded-[var(--radius-card)] border p-8">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-cta text-primary-foreground grid h-11 w-11 place-items-center rounded-xl">
                <Handshake className="h-5 w-5" />
              </div>
              <div>
                <div className="text-heading text-lg font-bold">One partner per district</div>
                <div className="text-muted-foreground text-xs">
                  Territories are limited and assigned first-come, first-served.
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {[
                { icon: Building2, label: "Shops onboarded", value: "12,000+" },
                { icon: Users, label: "Active partners", value: "480+" },
                { icon: Sparkles, label: "Cities live", value: "60+" },
                { icon: TrendingUp, label: "YoY growth", value: "3.4×" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="border-border bg-background rounded-xl border p-4"
                >
                  <s.icon className="text-primary h-4 w-4" />
                  <div className="text-heading mt-2 text-xl font-black">{s.value}</div>
                  <div className="text-muted-foreground text-[11px] uppercase tracking-wider">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-4 py-20 md:px-6">
        <h2 className="text-heading text-center text-3xl font-black md:text-4xl">
          Frequently asked
        </h2>
        <div className="mt-10 space-y-3">
          {[
            {
              q: "Is there any joining fee?",
              a: "No. The Growth Partner program has zero investment. You earn from onboarded shops only.",
            },
            {
              q: "How are payouts calculated?",
              a: "You earn a transparent revenue share on active shops in your district, paid every cycle.",
            },
            {
              q: "Can I run this alongside my job?",
              a: "Yes, especially in the early tiers. Most partners go full-time by the Growth Builder tier.",
            },
            {
              q: "What support do I get?",
              a: "Onboarding training, sales collateral, a dedicated dashboard and a program lead over WhatsApp.",
            },
          ].map((f) => (
            <details
              key={f.q}
              className="group border-border bg-card rounded-[var(--radius-card)] border p-5"
            >
              <summary className="text-heading flex cursor-pointer list-none items-center justify-between text-sm font-bold">
                {f.q}
                <span className="text-primary transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-[#0A2540] via-[#1a1060] to-[#635BFF] py-20 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-3xl font-black md:text-5xl">Claim your district.</h2>
          <p className="mt-3 text-white/80">
            Applications are reviewed weekly. One partner per district — apply before yours is
            taken.
          </p>
          <Link
            to="/contact"
            className="bg-card text-heading mt-7 inline-flex items-center gap-2 rounded-[var(--radius-button)] px-7 py-3.5 text-sm font-bold shadow-2xl"
          >
            Apply now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
