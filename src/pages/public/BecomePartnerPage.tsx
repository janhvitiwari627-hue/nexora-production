import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { Award, BadgeCheck, Crown, IndianRupee, Sparkles, Trophy, Users } from "lucide-react";

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
              <Sparkles className="h-3 w-3" /> Become a partner
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
            <div className="border-white/20 mt-6 grid grid-cols-3 gap-3 border-t pt-4 text-center">
              <div><div className="text-xs text-white/70">Monthly</div><div className="text-lg font-black">₹{(projected.monthly/1000).toFixed(0)}k</div></div>
              <div><div className="text-xs text-white/70">Platform fee</div><div className="text-lg font-black">₹{(projected.platformFee/1000).toFixed(1)}k</div></div>
              <div><div className="text-xs text-white/70">Your earnings</div><div className="text-2xl font-black text-amber-300">₹{(projected.earnings/1000).toFixed(0)}k</div></div>
            </div>
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
                Apply to become a partner
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
