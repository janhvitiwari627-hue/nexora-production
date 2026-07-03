import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { Activity, ArrowRight, Award, BadgeCheck, Building2, CalendarClock, CheckCircle2, Crown, FileCheck, GraduationCap, HeadphonesIcon, IndianRupee, LayoutDashboard, Rocket, ShieldCheck, Sparkles, Star, Store, Target, TrendingUp, Trophy, UserCheck, Users, Wallet, Zap } from "lucide-react";
import rewardWelcomeKit from "@/assets/reward-welcome-kit.jpg";
import rewardTabletBadge from "@/assets/reward-tablet-badge.jpg";
import rewardLaptop from "@/assets/reward-laptop.jpg";
import rewardCar from "@/assets/reward-car.jpg";

const STEPS = [
  { title: "Register your business", body: "Tell us about your salon — services, location, hours." },
  { title: "Verify & onboard", body: "We verify your details and set up your dashboard in 24h." },
  { title: "Go live", body: "Start receiving bookings, payments and reviews instantly." },
  { title: "Grow with insights", body: "Use analytics & marketing tools to scale your business." },
];

const LEVELS = [
  { name: "Bronze", min: 0, perk: "Standard listing", color: "from-amber-700 to-amber-900 text-amber-100" },
  { name: "Silver", min: 50, perk: "Boosted in search", color: "from-slate-300 to-slate-500 text-slate-900" },
  { name: "Gold", min: 200, perk: "Featured carousel + 2% lower commission", color: "from-amber-300 to-yellow-500 text-amber-950" },
  { name: "Platinum", min: 500, perk: "Hall of Fame + priority support", color: "from-indigo-700 to-violet-500 text-white" },
];

const MILESTONES = [
  { count: 50, reward: "₹2,000 marketing credit" },
  { count: 100, reward: "Pro photography session" },
  { count: 250, reward: "Branded merch kit" },
  { count: 500, reward: "Free year of Growth plan" },
  { count: 1000, reward: "Featured documentary feature" },
];

const HALL = [
  { name: "Looks Unisex Salon", city: "Jaipur", bookings: 8420 },
  { name: "Bliss Spa & Wellness", city: "Mumbai", bookings: 6210 },
  { name: "The Barber Co.", city: "Delhi", bookings: 5870 },
];

const formSchema = z.object({
  ownerName: z.string().trim().min(2, "Name too short").max(80),
  salonName: z.string().trim().min(2, "Required").max(120),
  phone: z.string().trim().regex(/^[+0-9 -]{7,15}$/, "Invalid phone"),
  city: z.string().trim().min(2).max(80),
  email: z.string().trim().email("Invalid email").max(255),
});

export function BecomePartnerPage() {
  const [bookings, setBookings] = useState(120);
  const [avg, setAvg] = useState(900);

  const projected = useMemo(() => {
    const monthly = bookings * avg;
    const platformFee = monthly * 0.08;
    const earnings = monthly - platformFee;
    return { monthly, platformFee, earnings };
  }, [bookings, avg]);

  const [form, setForm] = useState({ ownerName: "", salonName: "", phone: "", city: "", email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = formSchema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => { if (i.path[0]) errs[i.path[0] as string] = i.message; });
      setErrors(errs); return;
    }
    setErrors({}); setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero + calculator */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0A2540] via-[#1a1060] to-[#635BFF] py-20 md:py-28">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] [background-size:32px_32px]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 md:px-6 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
              <Sparkles className="h-3 w-3" /> Join Growth Partner Program
            </span>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-6xl" style={{ fontFamily: "Inter, sans-serif" }}>
              Earn more. <br />Stress less.
            </h1>
            <p className="mt-4 max-w-md text-base text-white/85 md:text-lg">
              Join 12,000+ salons growing 38% faster with Nexora. Zero setup. 24-hour onboarding.
            </p>
          </div>

          <div className="border-white/20 bg-white/10 rounded-[24px] border p-6 backdrop-blur-lg text-white">
            <h3 className="flex items-center gap-2 text-lg font-bold"><IndianRupee className="h-5 w-5" /> Earnings calculator</h3>
            <div className="mt-5 space-y-5">
              <div>
                <div className="flex justify-between text-sm font-semibold"><span>Monthly bookings</span><span>{bookings}</span></div>
                <input type="range" min={10} max={1000} step={10} value={bookings} onChange={(e) => setBookings(+e.target.value)} className="mt-2 w-full accent-white" />
              </div>
              <div>
                <div className="flex justify-between text-sm font-semibold"><span>Average ticket size</span><span>₹{avg}</span></div>
                <input type="range" min={300} max={5000} step={100} value={avg} onChange={(e) => setAvg(+e.target.value)} className="mt-2 w-full accent-white" />
              </div>
            </div>
            <div className="border-white/20 mt-6 grid grid-cols-3 gap-2 border-t pt-4 text-center sm:gap-3">
              <div><div className="text-[10px] text-white/70 sm:text-xs">Monthly</div><div className="text-base font-black sm:text-lg">₹{(projected.monthly/1000).toFixed(0)}k</div></div>
              <div><div className="text-[10px] text-white/70 sm:text-xs">Platform fee</div><div className="text-base font-black sm:text-lg">₹{(projected.platformFee/1000).toFixed(1)}k</div></div>
              <div><div className="text-[10px] text-white/70 sm:text-xs">Your earnings</div><div className="text-xl font-black text-amber-300 sm:text-2xl">₹{(projected.earnings/1000).toFixed(0)}k</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust — Why partner with Nexora */}
      <section className="mx-auto max-w-6xl px-4 pt-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <ShieldCheck className="h-3 w-3" /> Why Partner With Nexora
          </span>
          <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
            India's Trusted Beauty Industry OS
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-base">
            Backed by real shops, real revenue and a transparent partner model — not a promise, a system.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {[
            { icon: Store, k: "12,000+", v: "Salons onboarded" },
            { icon: Users, k: "2M+", v: "Customers reached" },
            { icon: IndianRupee, k: "₹50Cr+", v: "GMV processed" },
            { icon: Trophy, k: "38%", v: "Avg. shop growth" },
          ].map((s) => (
            <div key={s.v} className="border-border bg-card rounded-[var(--radius-card)] border p-6 text-center shadow-[var(--shadow-card)]">
              <s.icon className="text-primary mx-auto h-6 w-6" />
              <div className="text-heading mt-3 text-3xl font-black">{s.k}</div>
              <div className="text-muted-foreground mt-1 text-xs font-bold uppercase tracking-wider">{s.v}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[
            { icon: BadgeCheck, t: "Registered Indian company", b: "GST & MSME registered. Verified business entity." },
            { icon: ShieldCheck, t: "Transparent 7-day payouts", b: "Every rupee traceable. No hidden deductions." },
            { icon: FileCheck, t: "Written partner agreement", b: "Signed contract with clear terms and revenue share." },
          ].map((t) => (
            <div key={t.t} className="border-border bg-card flex items-start gap-3 rounded-[var(--radius-card)] border p-5">
              <div className="bg-success/10 text-success grid h-10 w-10 shrink-0 place-items-center rounded-xl">
                <t.icon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-heading font-bold">{t.t}</h4>
                <p className="text-muted-foreground mt-1 text-sm">{t.b}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ecosystem */}
      <section className="mx-auto max-w-6xl px-4 pt-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" /> The Nexora Ecosystem
          </span>
          <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
            How the whole system works
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-base">
            Growth Partners are the bridge between local salons and India's fastest-growing beauty marketplace.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {[
            { icon: Users, title: "Customers", body: "Discover, book & pay at trusted salons on the Nexora app." },
            { icon: Store, title: "Salons & Shops", body: "Manage bookings, staff, payments and marketing in one place." },
            { icon: UserCheck, title: "Growth Partners", body: "Onboard local shops, train them and earn on every booking." },
            { icon: Building2, title: "Brands & Distributors", body: "Reach every partner shop through the Nexora portal." },
          ].map((n, i) => (
            <div key={n.title} className="border-border bg-card relative rounded-[var(--radius-card)] border p-6 shadow-[var(--shadow-card)]">
              <div className="bg-gradient-cta text-primary-foreground grid h-11 w-11 place-items-center rounded-xl">
                <n.icon className="h-5 w-5" />
              </div>
              <div className="text-muted-foreground mt-4 text-[11px] font-black uppercase tracking-wider">Layer {i + 1}</div>
              <h3 className="text-heading mt-1 text-lg font-bold">{n.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{n.body}</p>
            </div>
          ))}
        </div>
      </section>


      {/* How Growth Partners Earn */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-muted/30 to-background py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
              <Rocket className="h-3 w-3" /> How Growth Partners Earn
            </span>
            <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-5xl">
              Nexora Growth Partner Program
            </h2>
            <div className="text-muted-foreground mt-5 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold">
              {["Ye Naukri Nahi", "Ye Franchise Nahi", "Ye MLM Nahi"].map((t) => (
                <span key={t} className="rounded-full border border-border bg-card px-3 py-1.5">{t}</span>
              ))}
            </div>
            <p className="text-heading mx-auto mt-4 max-w-2xl text-base font-bold md:text-lg">
              Ye Beauty Industry Ko Digital Banane Ka Mission Hai.
            </p>
          </div>

          {/* 1. Activation Reward */}
          <div className="mt-16">
            <div className="flex items-center gap-3">
              <span className="bg-gradient-cta text-primary-foreground grid h-10 w-10 place-items-center rounded-xl text-sm font-black shadow-[var(--shadow-glow)]">1</span>
              <h3 className="text-heading text-2xl font-black md:text-3xl">One-Time Activation Reward</h3>
              <span className="ml-auto hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary md:inline-block">15 Day Model</span>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { icon: Users, step: "STEP 1", title: "Shop / Salon Onboard Karo", body: "Apne network ke salon ko Nexora pe live karwao." },
                { icon: CalendarClock, step: "STEP 2", title: "15 Din Active Revenue Complete", body: "Shop 15 din ke andar real revenue generate kare." },
                { icon: Zap, step: "STEP 3", title: "Activation Reward Unlock", body: "Aapka one-time activation reward instantly credit." },
              ].map((s) => (
                <article key={s.step} className="border-border bg-card rounded-[var(--radius-card)] border p-6 shadow-[var(--shadow-card)]">
                  <div className="bg-primary/10 text-primary grid h-11 w-11 place-items-center rounded-xl">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div className="text-primary mt-4 text-[11px] font-black uppercase tracking-widest">{s.step}</div>
                  <h4 className="text-heading mt-1 text-lg font-bold">{s.title}</h4>
                  <p className="text-muted-foreground mt-2 text-sm">{s.body}</p>
                </article>
              ))}
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="border-border bg-card rounded-[var(--radius-card)] border p-6">
                <div className="text-muted-foreground text-xs font-black uppercase tracking-wider">Single Shop Example</div>
                <ul className="mt-4 space-y-3 text-sm">
                  {[
                    ["Salon Revenue", "₹15,000"],
                    ["Nexora Revenue (10%)", "₹1,500"],
                    ["Partner Activation Reward (10%)", "₹150"],
                  ].map(([k, v]) => (
                    <li key={k} className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0 last:pb-0">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="text-heading font-black">{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[var(--radius-card)] bg-gradient-to-br from-[#0A2540] via-[#1a1060] to-[#635BFF] p-6 text-white shadow-[var(--shadow-card)]">
                <div className="text-xs font-black uppercase tracking-wider text-white/70">100 Active Shops</div>
                <ul className="mt-4 space-y-3 text-sm">
                  {[
                    ["Total Revenue Generated", "₹15,00,000"],
                    ["Nexora Revenue", "₹1,50,000"],
                    ["Partner Activation Rewards", "₹15,000"],
                  ].map(([k, v]) => (
                    <li key={k} className="flex items-center justify-between border-b border-white/15 pb-2 last:border-0 last:pb-0">
                      <span className="text-white/75">{k}</span>
                      <span className="font-black text-amber-300">{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <blockquote className="border-primary bg-primary/5 text-heading mt-6 rounded-[var(--radius-card)] border-l-4 p-5 text-sm font-semibold italic md:text-base">
              "Maine Company Ko ₹1.5 Lakh Revenue Generate Karne Me Help Ki Aur Mujhe ₹15,000 Activation Reward Mila."
            </blockquote>
          </div>

          {/* 2. 7-Day Growth Share */}
          <div className="mt-20">
            <div className="flex items-center gap-3">
              <span className="bg-gradient-cta text-primary-foreground grid h-10 w-10 place-items-center rounded-xl text-sm font-black shadow-[var(--shadow-glow)]">2</span>
              <h3 className="text-heading text-2xl font-black md:text-3xl">7-Day Growth Share</h3>
              <span className="ml-auto hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary md:inline-block">Recurring Earning</span>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { label: "First 6 Months", pct: "10%", tone: "from-emerald-400 to-emerald-600" },
                { label: "Month 7 – 12", pct: "5%", tone: "from-sky-400 to-indigo-600" },
                { label: "After 12 Months", pct: "2%", tone: "from-amber-400 to-orange-600" },
              ].map((t) => (
                <div key={t.label} className={`relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br ${t.tone} p-6 text-white shadow-[var(--shadow-card)]`}>
                  <TrendingUp className="h-6 w-6 opacity-90" />
                  <div className="mt-3 text-xs font-black uppercase tracking-wider text-white/85">{t.label}</div>
                  <div className="mt-1 text-4xl font-black sm:text-5xl">{t.pct}</div>
                  <div className="mt-1 text-sm font-semibold text-white/90">Partner Share</div>
                </div>
              ))}
            </div>

            <div className="border-border bg-card mt-6 rounded-[var(--radius-card)] border p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CalendarClock className="text-primary h-5 w-5" />
                  <span className="text-heading font-bold">Every 7 Days Payout Cycle</span>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">Transparent · Performance Based</span>
              </div>
              <ul className="mt-5 grid gap-3 md:grid-cols-2">
                {[
                  "Active Shops Jitni Zyada",
                  "Growth Share Utna Zyada",
                  "Performance Based System",
                  "Transparent Weekly Earnings",
                ].map((n) => (
                  <li key={n} className="flex items-start gap-2 text-sm">
                    <BadgeCheck className="text-success mt-0.5 h-4 w-4 shrink-0" />
                    <span className="text-heading font-semibold">{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. Dashboard preview */}
          <div className="mt-20">
            <div className="flex items-center gap-3">
              <span className="bg-gradient-cta text-primary-foreground grid h-10 w-10 place-items-center rounded-xl text-sm font-black shadow-[var(--shadow-glow)]">3</span>
              <h3 className="text-heading text-2xl font-black md:text-3xl">Growth Partner Dashboard</h3>
              <span className="ml-auto hidden items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary md:inline-flex">
                <LayoutDashboard className="h-3 w-3" /> Live KPIs
              </span>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {[
                { icon: Users, label: "Shops Added" },
                { icon: Activity, label: "Active Shops" },
                { icon: TrendingUp, label: "Active Revenue" },
                { icon: IndianRupee, label: "Total Revenue Generated" },
                { icon: Sparkles, label: "Nexora Revenue" },
                { icon: Wallet, label: "Your Earnings" },
                { icon: CalendarClock, label: "Pending Earnings" },
                { icon: Zap, label: "Weekly Payout" },
                { icon: Trophy, label: "Lifetime Earnings" },
                { icon: Target, label: "Next Milestone" },
              ].map((k) => (
                <div key={k.label} className="border-border bg-card rounded-[var(--radius-card)] border p-4 shadow-[var(--shadow-card)]">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 text-primary grid h-8 w-8 place-items-center rounded-lg">
                      <k.icon className="h-4 w-4" />
                    </div>
                    <span className="text-muted-foreground text-[11px] font-black uppercase tracking-wider">{k.label}</span>
                  </div>
                  <div className="text-heading mt-3 text-xl font-black">—</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Milestone Rewards · 5. Partner Benefits · 6. Program Highlights */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        {/* 4. Milestone Rewards */}
        <div>
          <div className="flex items-center gap-3">
            <span className="bg-gradient-cta text-primary-foreground grid h-10 w-10 place-items-center rounded-xl text-sm font-black shadow-[var(--shadow-glow)]">4</span>
            <h3 className="text-heading text-2xl font-black md:text-3xl">Milestone Rewards</h3>
            <span className="ml-auto hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary md:inline-block">Unlock as you grow</span>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                count: "25",
                label: "Active Shops",
                tone: "from-emerald-400 to-emerald-600",
                image: rewardWelcomeKit,
                items: ["Welcome Kit"],
              },
              {
                count: "100",
                label: "Active Shops",
                tone: "from-sky-400 to-indigo-600",
                image: rewardTabletBadge,
                items: ["Tablet", "Growth Builder Badge"],
              },
              {
                count: "500",
                label: "Active Shops",
                tone: "from-amber-400 to-orange-600",
                image: rewardLaptop,
                items: ["Branded Laptop", "Platinum Growth Partner"],
              },
              {
                count: "1000+",
                label: "Active Shops",
                tone: "from-fuchsia-500 via-rose-500 to-amber-500",
                image: rewardCar,
                items: [
                  "District Business Partner",
                  "Leadership Circle",
                  "Hall Of Fame",
                  "Car Reward Program Eligibility",
                ],
              },
            ].map((m) => (
              <article key={m.count} className="border-border bg-card overflow-hidden rounded-[var(--radius-card)] border shadow-[var(--shadow-card)]">
                <div className={`bg-gradient-to-br ${m.tone} p-5 text-white`}>
                  <div className="text-xs font-black uppercase tracking-wider text-white/80">{m.label}</div>
                  <div className="mt-1 text-4xl font-black">{m.count}</div>
                </div>
                <div className="aspect-square overflow-hidden bg-muted">
                  <img src={m.image} alt={`${m.count} active shops reward`} loading="lazy" width={1024} height={1024} className="h-full w-full object-cover" />
                </div>
                <ul className="space-y-2 p-5">
                  {m.items.map((it) => (
                    <li key={it} className="text-heading flex items-start gap-2 text-sm font-semibold">
                      <BadgeCheck className="text-success mt-0.5 h-4 w-4 shrink-0" />
                      {it}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>


        {/* 5 & 6 side-by-side */}
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {/* 5. Partner Benefits */}
          <div className="border-border bg-card rounded-[var(--radius-card)] border p-7 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3">
              <span className="bg-gradient-cta text-primary-foreground grid h-10 w-10 place-items-center rounded-xl text-sm font-black shadow-[var(--shadow-glow)]">5</span>
              <h3 className="text-heading text-xl font-black md:text-2xl">Partner Benefits</h3>
            </div>
            <ul className="mt-6 space-y-3">
              {[
                "One-Time Activation Reward",
                "Every 7 Days Growth Share",
                "Hall Of Fame Recognition",
                "Leadership Status",
                "Business Network Building",
                "Long-Term Opportunity",
              ].map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm">
                  <BadgeCheck className="text-success mt-0.5 h-5 w-5 shrink-0" />
                  <span className="text-heading font-semibold">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 6. Program Highlights */}
          <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-[#0A2540] via-[#1a1060] to-[#635BFF] p-7 text-white shadow-[var(--shadow-card)]">
            <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] [background-size:24px_24px]" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-sm font-black backdrop-blur">6</span>
                <h3 className="text-xl font-black md:text-2xl">Program Highlights</h3>
              </div>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  "No Joining Fee",
                  "No Investment",
                  "No Franchise Fee",
                  "No Hidden Charges",
                  "100% Transparent System",
                  "Real Shops",
                  "Real Growth",
                  "Real Rewards",
                ].map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm">
                    <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                    <span className="font-semibold">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Success Formula */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <div className="border-border bg-card rounded-[var(--radius-card)] border p-8 shadow-[var(--shadow-card)] md:p-12">
          <div className="flex items-center gap-3">
            <span className="bg-gradient-cta text-primary-foreground grid h-10 w-10 place-items-center rounded-xl text-sm font-black shadow-[var(--shadow-glow)]">7</span>
            <h3 className="text-heading text-2xl font-black md:text-3xl">Success Formula</h3>
          </div>
          <div className="mt-8 grid items-stretch gap-4 md:grid-cols-4">
            {[
              { k: "Jitni", v: "Active Shops", icon: Users },
              { k: "Utna", v: "Growth Share", icon: TrendingUp },
              { k: "Utni", v: "Recognition", icon: Award },
              { k: "Utni", v: "Leadership Opportunity", icon: Crown },
            ].map((s) => (
              <div key={s.v} className="relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6 text-center">
                <s.icon className="text-primary mx-auto h-8 w-8" />
                <div className="text-muted-foreground mt-3 text-xs font-bold uppercase tracking-wider">{s.k}</div>
                <div className="text-heading mt-1 text-lg font-black">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 md:px-6">
        <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-[#0A2540] via-[#1a1060] to-[#635BFF] p-10 text-center text-white shadow-[var(--shadow-card)] md:p-16">
          <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] [background-size:24px_24px]" />
          <div className="relative">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-sm font-black backdrop-blur">8</span>
            <h2 className="mt-5 text-3xl font-black leading-tight md:text-5xl">
              Aaj Hi Nexora Growth Partner Baniye
            </h2>
            <p className="mt-3 text-base text-white/80 md:text-lg">
              Apne District Ka Growth Leader Baniye
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              {["More Shops", "More Growth", "More Rewards", "More Recognition"].map((t) => (
                <div key={t} className="rounded-xl bg-white/10 px-4 py-3 font-bold backdrop-blur">{t}</div>
              ))}
            </div>
            <a
              href="/register?type=growth-partner"
              className="bg-gradient-cta text-primary-foreground mt-10 inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-black shadow-[var(--shadow-glow)] transition hover:scale-[1.02]"
            >
              Join as Growth Partner <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>



      {/* Steps */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <h2 className="text-heading text-center text-3xl font-black md:text-4xl">How to join in 4 steps</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="border-border bg-card relative rounded-[var(--radius-card)] border p-6">
              <span className="bg-gradient-cta text-primary-foreground absolute -top-4 left-6 grid h-9 w-9 place-items-center rounded-full text-sm font-black">{i + 1}</span>
              <h3 className="text-heading mt-3 text-base font-bold">{s.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-muted/30 border-y border-border py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Users, title: "Reach 2M+ customers", body: "Be discovered on India's fastest-growing beauty marketplace." },
              { icon: Trophy, title: "Boost visibility", body: "Level up to unlock featured slots, lower fees and Hall of Fame." },
              { icon: BadgeCheck, title: "Verified trust badge", body: "Stand out with the trusted Nexora Verified badge on your listing." },
            ].map((b) => (
              <article key={b.title} className="border-border bg-card rounded-[var(--radius-card)] border p-6">
                <div className="bg-gradient-cta text-primary-foreground grid h-11 w-11 place-items-center rounded-xl"><b.icon className="h-5 w-5" /></div>
                <h3 className="text-heading mt-4 text-lg font-bold">{b.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm">{b.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Levels */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <h2 className="text-heading text-center text-3xl font-black md:text-4xl">Level up. Unlock more.</h2>
        <p className="text-muted-foreground mt-2 text-center">Earn levels by completing bookings & maintaining 4.5+ ratings.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {LEVELS.map((l) => (
            <div key={l.name} className={`relative overflow-hidden rounded-[20px] bg-gradient-to-br p-6 shadow-[var(--shadow-card)] ${l.color}`}>
              <Crown className="h-7 w-7 opacity-90" />
              <h3 className="mt-3 text-2xl font-black">{l.name}</h3>
              <div className="mt-1 text-xs font-bold opacity-80">{l.min}+ bookings</div>
              <p className="mt-3 text-sm opacity-90">{l.perk}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Milestones */}
      <section className="bg-muted/30 border-y border-border py-16">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <h2 className="text-heading text-center text-3xl font-black md:text-4xl">Milestone rewards</h2>
          <div className="mt-10 relative">
            <div className="bg-border absolute left-4 top-0 bottom-0 w-0.5 md:left-1/2" />
            <ul className="space-y-6">
              {MILESTONES.map((m, i) => (
                <li key={m.count} className={`relative flex items-center gap-4 md:w-1/2 ${i % 2 ? "md:ml-auto md:pl-10" : "md:pr-10 md:text-right"}`}>
                  <div className={`bg-gradient-cta text-primary-foreground absolute h-8 w-8 grid place-items-center rounded-full font-black text-xs ring-4 ring-background ${i % 2 ? "md:-left-4" : "md:-right-4 md:left-auto left-0"}`}><Award className="h-4 w-4" /></div>
                  <div className="border-border bg-card ml-12 flex-1 rounded-[var(--radius-card)] border p-5 md:ml-0">
                    <div className="text-primary text-xs font-black uppercase tracking-wider">{m.count} bookings</div>
                    <div className="text-heading mt-1 text-lg font-bold">{m.reward}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Hall of Fame */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <h2 className="text-heading text-center text-3xl font-black md:text-4xl">Hall of Fame</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {HALL.map((h, i) => (
            <article key={h.name} className="from-amber-100 via-card to-rose-50 border-amber-200 rounded-[24px] border bg-gradient-to-br p-7 shadow-[var(--shadow-card)]">
              <Crown className={`h-7 w-7 ${i === 0 ? "text-amber-500" : i === 1 ? "text-slate-400" : "text-amber-700"}`} />
              <h3 className="text-heading mt-3 text-xl font-black">{h.name}</h3>
              <div className="text-muted-foreground text-sm">{h.city}</div>
              <div className="text-heading mt-4 text-3xl font-black">{h.bookings.toLocaleString("en-IN")}</div>
              <div className="text-muted-foreground text-xs">lifetime bookings</div>
            </article>
          ))}
        </div>
      </section>

      {/* Registration form */}
      <section className="mx-auto max-w-2xl px-4 pb-20 md:px-6">
        <div className="border-border bg-card rounded-[24px] border p-7 shadow-[var(--shadow-card)]">
          <h2 className="text-heading text-2xl font-black">Get started</h2>
          <p className="text-muted-foreground mt-1 text-sm">Our partner success team will reach out within 24 hours.</p>
          {submitted ? (
            <div className="bg-success/10 text-success mt-6 rounded-[var(--radius-card)] p-5 text-center text-sm font-bold">
              ✓ Thanks! We'll be in touch with you shortly.
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-2">
              {([
                ["ownerName", "Your name"],
                ["salonName", "Salon name"],
                ["phone", "Phone"],
                ["city", "City"],
                ["email", "Email", "md:col-span-2"],
              ] as [keyof typeof form, string, string?][]).map(([k, label, cls]) => (
                <label key={k} className={cls}>
                  <span className="text-heading text-xs font-bold uppercase tracking-wider">{label}</span>
                  <input
                    value={form[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    maxLength={k === "email" ? 255 : 120}
                    className="border-border bg-background mt-1 w-full rounded-[var(--radius-button)] border px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                  {errors[k] && <span className="text-danger mt-1 block text-xs font-semibold">{errors[k]}</span>}
                </label>
              ))}
              <button type="submit" className="bg-gradient-cta text-primary-foreground md:col-span-2 mt-2 rounded-[var(--radius-button)] px-4 py-3 text-sm font-bold shadow-[var(--shadow-glow)]">
                Join Growth Partner Program
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
