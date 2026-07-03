import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Activity, ArrowRight, BadgeCheck, Building2, CalendarClock, CheckCircle2, Crown, FileCheck, GraduationCap, Headphones as HeadphonesIcon, IndianRupee, LayoutDashboard, PlayCircle, Rocket, ShieldCheck, Sparkles, Store, Target, TrendingUp, Trophy, UserCheck, Users, Wallet, Zap, Award } from "lucide-react";
import rewardWelcomeKit from "@/assets/reward-welcome-kit.jpg";
import rewardTabletBadge from "@/assets/reward-tablet-badge.jpg";
import rewardLaptop from "@/assets/reward-laptop.jpg";
import rewardCar from "@/assets/reward-car.jpg";


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
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0A2540] via-[#1a1060] to-[#635BFF] py-20 md:py-28">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] [background-size:32px_32px]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 md:px-6 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
              <Sparkles className="h-3 w-3" /> District Business Partner Program
            </span>
            <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
              Apne District Ki Beauty Industry Ko{" "}
              <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                Digital Banaiye
              </span>{" "}
              Aur Us Growth Ka Hissa Baniye.
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/85 md:text-lg">
              Nexora SalonOS Jaipur ki Beauty Industry ka Digital Ecosystem hai. Agar aapke paas
              salon owners ka network hai, to aap is digital transformation ka official Growth
              Partner ban sakte hain.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#join" className="bg-gradient-cta text-primary-foreground inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-black shadow-[var(--shadow-glow)] transition hover:scale-[1.03]">
                Join Free <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#opportunity" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-black text-white backdrop-blur transition hover:bg-white/20">
                <PlayCircle className="h-4 w-4" /> Watch Opportunity
              </a>
              <a href="#talk" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-transparent px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/10">
                <HeadphonesIcon className="h-4 w-4" /> Talk to Team
              </a>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-white/70">
              <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-amber-300" /> No joining fee</span>
              <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-amber-300" /> 24h KYC</span>
              <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-amber-300" /> Weekly payouts</span>
            </div>
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

      {/* Section 2 — Why You? */}
      <section className="mx-auto max-w-6xl px-4 pt-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <UserCheck className="h-3 w-3" /> Why You?
          </span>
          <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
            Aapke paas already sab kuch hai
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-base">
            Naya network banane ki zarurat nahi. Existing network ko digital growth me convert karna hai.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Users, t: "Existing Salon Network", b: "Aap already salon owners ke saath baat karte hain." },
            { icon: ShieldCheck, t: "Existing Trust", b: "Shop owners aap par bharosa karte hain — trust already built hai." },
            { icon: BadgeCheck, t: "Existing Relationships", b: "Regular visits, WhatsApp contact, personal rapport." },
            { icon: Target, t: "Existing Market Knowledge", b: "Aap apne district ki beauty industry ko andar se jaante hain." },
          ].map((w) => (
            <div key={w.t} className="border-border bg-card rounded-[var(--radius-card)] border p-6 shadow-[var(--shadow-card)]">
              <div className="bg-primary/10 text-primary grid h-11 w-11 place-items-center rounded-xl">
                <w.icon className="h-5 w-5" />
              </div>
              <h3 className="text-heading mt-4 font-bold">{w.t}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{w.b}</p>
            </div>
          ))}
        </div>
        <blockquote className="border-primary bg-primary/5 text-heading mt-8 rounded-[var(--radius-card)] border-l-4 p-5 text-center text-base font-bold italic md:text-lg">
          "Naya Network Banane Ki Zarurat Nahi. Existing Network Ko Digital Growth Me Convert Karna Hai."
        </blockquote>
      </section>


      {/* Section 3 — Nexora Ecosystem (animated flow) */}
      <section className="mx-auto max-w-6xl px-4 pt-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" /> The Nexora Ecosystem
          </span>
          <h2 className="text-heading mx-auto mt-4 max-w-3xl text-3xl font-black leading-tight tracking-tight md:text-4xl">
            "Nexora Sirf Salon Software Nahi Hai. Nexora Beauty Industry Ka Complete Digital Ecosystem Hai."
          </h2>
        </div>

        <div className="mt-12 overflow-hidden rounded-[var(--radius-card-lg)] border border-border/60 bg-gradient-to-br from-[#0A2540] via-[#1a1060] to-[#635BFF] p-6 shadow-[var(--shadow-card)] md:p-10">
          <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-8">
            {[
              { icon: Users, title: "Customers" },
              { icon: Store, title: "Salon Owners" },
              { icon: UserCheck, title: "Beauty Staff" },
              { icon: GraduationCap, title: "Beauty Academies" },
              { icon: BadgeCheck, title: "Brands" },
              { icon: Building2, title: "Distributors" },
              { icon: Trophy, title: "District Partners" },
              { icon: Rocket, title: "Nexora Platform" },
            ].map((n, i) => (
              <div
                key={n.title}
                className="group relative rounded-[var(--radius-card)] border border-white/15 bg-white/10 p-4 text-center text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20 animate-fade-in"
                style={{ animationDelay: `${i * 90}ms`, animationFillMode: "both" }}
              >
                <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-white/15 transition group-hover:bg-amber-300 group-hover:text-slate-900">
                  <n.icon className="h-5 w-5" />
                </div>
                <div className="mt-3 text-[11px] font-black uppercase tracking-wider text-white/70">
                  Node {i + 1}
                </div>
                <div className="mt-1 text-sm font-black">{n.title}</div>
                {i < 7 && (
                  <ArrowRight
                    className="text-amber-300 absolute -right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 lg:block animate-pulse"
                    aria-hidden
                  />
                )}
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm font-semibold text-white/85 md:text-base">
            Ek connected ecosystem — jahan har layer ek doosre se juda hua hai.
          </p>
        </div>
      </section>

      {/* Section 4 — Who Can Join */}
      <section className="mx-auto max-w-6xl px-4 pt-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <UserCheck className="h-3 w-3" /> Who Can Join
          </span>
          <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
            Eligible partner categories
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-base">
            If you already work with salon owners in any of these roles — you're eligible.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Store, t: "Hair Salon Product Salesman" },
            { icon: Sparkles, t: "Cosmetic Sales Executive" },
            { icon: Building2, t: "Beauty Product Distributor" },
            { icon: LayoutDashboard, t: "Salon Furniture Dealer" },
            { icon: HeadphonesIcon, t: "Spa Product Representative" },
            { icon: Target, t: "Tattoo Supply Distributor" },
            { icon: Award, t: "Nail Art Supplier" },
            { icon: GraduationCap, t: "Beauty Consultant" },
          ].map((p, i) => (
            <div
              key={p.t}
              className="border-border bg-card group rounded-[var(--radius-card)] border p-5 text-center shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:border-primary/40 animate-fade-in"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
            >
              <div className="bg-primary/10 text-primary mx-auto grid h-12 w-12 place-items-center rounded-xl transition group-hover:bg-gradient-cta group-hover:text-primary-foreground">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="text-heading mt-4 text-sm font-black leading-snug">{p.t}</h3>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[var(--radius-card)] border border-primary/30 bg-primary/5 p-5 text-center text-sm font-semibold text-heading">
          Don't see your exact title? If you talk to salon owners every week — you qualify.
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



      {/* Responsibilities */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Target className="h-3 w-3" /> Partner Responsibilities
          </span>
          <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
            What a Growth Partner actually does
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-base">
            Clear expectations. No gimmicks. This is the day-to-day of a successful district Growth Partner.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Store, t: "Onboard local shops", b: "Identify salons, spas and barbershops in your district and help them go live on Nexora." },
            { icon: GraduationCap, t: "Train shop owners", b: "Walk them through the app, POS, bookings and rewards system in the first week." },
            { icon: Activity, t: "Ensure 15-day activation", b: "Support the shop until they cross their first 15 days of active revenue on Nexora." },
            { icon: HeadphonesIcon, t: "First-line support", b: "Be the local point of contact for questions. Escalate to Nexora support when needed." },
            { icon: TrendingUp, t: "Drive recurring growth", b: "Help shops run offers, collect reviews and stay active — this compounds your 7-day share." },
            { icon: ShieldCheck, t: "Follow the code of conduct", b: "Represent Nexora with honesty. No false promises, no cash collection from shops." },
          ].map((r) => (
            <div key={r.t} className="border-border bg-card rounded-[var(--radius-card)] border p-6 shadow-[var(--shadow-card)]">
              <div className="bg-primary/10 text-primary grid h-11 w-11 place-items-center rounded-xl">
                <r.icon className="h-5 w-5" />
              </div>
              <h3 className="text-heading mt-4 font-bold">{r.t}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{r.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Training & Support */}
      <section className="bg-muted/30 border-y border-border py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                <GraduationCap className="h-3 w-3" /> Training & Support
              </span>
              <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
                You never work alone
              </h2>
              <p className="text-muted-foreground mt-3 text-base">
                Every Growth Partner goes through a structured onboarding and gets lifetime access to
                training, pitch decks, and a dedicated regional manager.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "3-day onboarding bootcamp (online)",
                  "Sales pitch deck & shop demo scripts",
                  "WhatsApp partner community",
                  "Weekly performance review calls",
                  "Dedicated regional success manager",
                  "Lifetime access to Nexora Academy",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="text-success mt-0.5 h-5 w-5 shrink-0" />
                    <span className="text-heading font-semibold">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-4">
              {[
                { day: "Day 0", t: "Application & KYC", b: "Submit ID, PAN and bank details. Verification in 24 hours." },
                { day: "Day 1–3", t: "Onboarding bootcamp", b: "Product, pitch, dashboard and code-of-conduct training." },
                { day: "Day 4+", t: "Field activation", b: "Start onboarding shops with your regional manager's guidance." },
                { day: "Day 15+", t: "First payout", b: "Once your first shop clears 15-day active revenue, rewards go live." },
              ].map((s) => (
                <div key={s.day} className="border-border bg-card rounded-[var(--radius-card)] border p-5 shadow-[var(--shadow-card)]">
                  <div className="text-primary text-xs font-black uppercase tracking-wider">{s.day}</div>
                  <div className="text-heading mt-1 font-bold">{s.t}</div>
                  <p className="text-muted-foreground mt-1 text-sm">{s.b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Journey timeline */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Rocket className="h-3 w-3" /> Your Journey
          </span>
          <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
            From visitor to active partner
          </h2>
        </div>
        <div className="mt-12 grid gap-3 md:grid-cols-4 lg:grid-cols-7">
          {[
            { n: "1", t: "Visit", d: "Explore program" },
            { n: "2", t: "Interested", d: "Try the calculator" },
            { n: "3", t: "Trust", d: "Read our story" },
            { n: "4", t: "Join", d: "Sign up in 2 min" },
            { n: "5", t: "KYC", d: "Verified in 24h" },
            { n: "6", t: "Training", d: "3-day bootcamp" },
            { n: "7", t: "Active", d: "Earn on shops" },
          ].map((s, i) => (
            <div key={s.n} className="border-border bg-card relative rounded-[var(--radius-card)] border p-4 text-center shadow-[var(--shadow-card)]">
              <div className="bg-gradient-cta text-primary-foreground mx-auto grid h-9 w-9 place-items-center rounded-full text-sm font-black shadow-[var(--shadow-glow)]">
                {s.n}
              </div>
              <div className="text-heading mt-3 text-sm font-black">{s.t}</div>
              <div className="text-muted-foreground mt-1 text-xs">{s.d}</div>
              {i < 6 && (
                <ArrowRight className="text-muted-foreground absolute -right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 lg:block" />
              )}
            </div>
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
