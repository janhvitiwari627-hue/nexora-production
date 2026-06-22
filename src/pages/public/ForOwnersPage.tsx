import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, CalendarCheck, Check, MessageSquare, ShieldCheck, Sparkles, Star, Users, Zap } from "lucide-react";
import { useState } from "react";

const FEATURES = [
  { icon: CalendarCheck, title: "Smart bookings", body: "AI-optimised calendar that minimises gaps and maximises stylist utilisation." },
  { icon: Users, title: "Staff & rosters", body: "Manage schedules, leave, payroll & commissions in one place." },
  { icon: BarChart3, title: "Real-time analytics", body: "Track revenue, repeat rate and service mix with live dashboards." },
  { icon: MessageSquare, title: "WhatsApp marketing", body: "Automated reminders, win-back campaigns and review requests." },
  { icon: Sparkles, title: "Loyalty & memberships", body: "Plug-and-play tiers, points and gift cards — no setup required." },
  { icon: ShieldCheck, title: "Secure payments", body: "UPI, card and QR with auto-reconciliation and GST-ready invoices." },
];

const PLANS = [
  { name: "Starter", price: 999, body: "For new salons getting started.", perks: ["Up to 3 staff", "Bookings & reminders", "Basic analytics", "Customer support"] },
  { name: "Growth", price: 2499, popular: true, body: "Most loved by growing salons.", perks: ["Unlimited staff", "WhatsApp marketing", "Memberships & loyalty", "Advanced analytics", "Priority support"] },
  { name: "Enterprise", price: 4999, body: "For chains & franchises.", perks: ["Multi-location", "Centralised analytics", "API access", "Dedicated manager", "Custom integrations"] },
];

const SHOTS = [
  "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
  "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&q=80",
];

export function ForOwnersPage() {
  const [shot, setShot] = useState(0);
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0A2540] py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,91,255,0.35),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 text-center md:px-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
            <Zap className="h-3 w-3" /> SalonOS for owners
          </span>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-white md:text-6xl" style={{ fontFamily: "Inter, sans-serif" }}>
            The operating system <br className="hidden md:block" />for modern salons.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-white/80 md:text-lg">
            Bookings, payments, marketing, loyalty and analytics — beautifully unified. Built with the polish of Stripe and the reach of Airbnb.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/partner" className="bg-gradient-cta text-primary-foreground inline-flex items-center gap-2 rounded-[var(--radius-button)] px-6 py-3 text-sm font-bold shadow-[var(--shadow-glow)]">
              Become a partner <ArrowRight className="h-4 w-4" />
            </Link>
            <button className="rounded-[var(--radius-button)] border border-white/30 px-6 py-3 text-sm font-bold text-white hover:bg-white/10">Book a demo</button>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center md:px-6">
        <h2 className="text-heading text-3xl font-black md:text-5xl">Running a salon is hard. Software shouldn't be.</h2>
        <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-base md:text-lg">
          Juggling WhatsApp DMs, paper diaries, and Excel for staff payouts? Nexora replaces all of it with one elegant platform built around the way you actually work.
        </p>
      </section>

      {/* Features */}
      <section className="bg-muted/30 border-y border-border py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-heading text-center text-3xl font-black md:text-4xl">Everything you need. Nothing you don't.</h2>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.article key={f.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="border-border bg-card rounded-[var(--radius-card)] border p-6">
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

      {/* Screenshots */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <h2 className="text-heading text-center text-3xl font-black md:text-4xl">Designed to delight</h2>
        <div className="border-border bg-card mt-10 overflow-hidden rounded-[24px] border shadow-[var(--shadow-float)]">
          <img src={SHOTS[shot]} alt="Dashboard preview" className="aspect-[16/9] w-full object-cover" />
        </div>
        <div className="mt-5 flex justify-center gap-2">
          {SHOTS.map((_, i) => (
            <button key={i} onClick={() => setShot(i)} className={`h-2 rounded-full transition-all ${i === shot ? "bg-primary w-10" : "bg-muted w-2"}`} />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#0A2540] py-16 text-white">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 md:grid-cols-4 md:px-6">
          {[["12k+", "Partner salons"], ["2.4M+", "Bookings/month"], ["38%", "Avg revenue lift"], ["4.9★", "Owner rating"]].map(([v, l]) => (
            <div key={l} className="text-center">
              <div className="text-4xl font-black md:text-5xl">{v}</div>
              <div className="text-xs uppercase tracking-wider text-white/70 mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <h2 className="text-heading text-center text-3xl font-black md:text-4xl">Simple, honest pricing</h2>
        <p className="text-muted-foreground mt-3 text-center">No setup fees. No long contracts. Cancel anytime.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {PLANS.map((p) => (
            <article key={p.name} className={`border-border bg-card relative rounded-[24px] border p-7 ${p.popular ? "ring-2 ring-primary shadow-[var(--shadow-glow)]" : ""}`}>
              {p.popular && <span className="bg-gradient-cta text-primary-foreground absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider">Most popular</span>}
              <h3 className="text-heading text-xl font-bold">{p.name}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{p.body}</p>
              <div className="text-heading mt-5 text-3xl font-black sm:text-4xl">₹{p.price}<span className="text-muted-foreground text-base font-medium">/mo</span></div>
              <ul className="text-heading mt-5 space-y-2 text-sm">
                {p.perks.map((perk) => <li key={perk} className="flex items-start gap-2"><Check className="text-success mt-0.5 h-4 w-4 shrink-0" />{perk}</li>)}
              </ul>
              <button className={`mt-6 w-full rounded-[var(--radius-button)] px-4 py-3 text-sm font-bold ${p.popular ? "bg-gradient-cta text-primary-foreground shadow-[var(--shadow-glow)]" : "border-primary text-primary border"}`}>Choose {p.name}</button>
            </article>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/30 border-y border-border py-16">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { name: "Aanya Sharma", salon: "Looks Unisex, Jaipur", text: "Bookings went up 42% in 3 months. The WhatsApp marketing alone paid for itself in a week." },
              { name: "Vikram Singh", salon: "Studio Noir, Mumbai", text: "I finally have one screen that tells me exactly how my business is doing. Game-changer." },
            ].map((t) => (
              <article key={t.name} className="border-border bg-card rounded-[var(--radius-card)] border p-6">
                <div className="text-warning flex">{Array.from({length: 5}).map((_,i)=><Star key={i} className="h-4 w-4 fill-current" />)}</div>
                <p className="text-muted-foreground mt-3 text-base leading-relaxed">"{t.text}"</p>
                <div className="border-border mt-4 border-t pt-3">
                  <div className="text-heading text-sm font-bold">{t.name}</div>
                  <div className="text-muted-foreground text-xs">{t.salon}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-[#0A2540] via-[#1a1060] to-[#635BFF] py-20 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-3xl font-black md:text-5xl">Ready to grow with Nexora?</h2>
          <p className="mt-3 text-white/80">Join 12,000+ salons using Nexora to delight their customers and grow faster.</p>
          <Link to="/partner" className="bg-card text-heading mt-7 inline-flex items-center gap-2 rounded-[var(--radius-button)] px-7 py-3.5 text-sm font-bold shadow-2xl">
            Get started free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
