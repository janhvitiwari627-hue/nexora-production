import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Star, X } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { PublicPageHeader } from "@/components/shared/PublicPageHeader";

const PLANS = [
  { name: "Silver", price: 999, period: "year", color: "from-slate-200 to-slate-400 text-slate-900", featured: false, perks: ["10% off all services", "Member-only offers", "Priority customer support"] },
  { name: "Gold", price: 2499, period: "year", color: "from-amber-200 via-yellow-300 to-amber-500 text-amber-950", featured: true, perks: ["15% off all services", "Priority booking", "Birthday gift", "2 free facials/year", "Concierge support"] },
  { name: "Platinum", price: 4999, period: "year", color: "from-indigo-900 via-indigo-700 to-violet-500 text-white", featured: false, perks: ["25% off all services", "VIP slots", "Monthly free facial", "Bridal trial included", "Personal stylist"] },
];

const FEATURES = [
  ["Discount on services", "10%", "15%", "25%"],
  ["Priority booking", false, true, true],
  ["Birthday gift", false, true, true],
  ["Free monthly facial", false, false, true],
  ["Concierge support", false, true, true],
  ["Member-only events", true, true, true],
  ["Bridal trial", false, false, true],
];

const TESTIMONIALS = [
  { name: "Riya Bhatia", tier: "Gold", text: "I've saved over ₹12,000 this year on services I'd have booked anyway. No-brainer." },
  { name: "Karan Malhotra", tier: "Platinum", text: "Priority slots on Saturdays are gold. Plus the monthly facial pays for the membership in 4 months." },
  { name: "Sneha Reddy", tier: "Silver", text: "Started with Silver to try it. Already planning to upgrade — the offers keep getting better." },
];

const FAQS = [
  { q: "When does my membership start?", a: "Immediately upon purchase. You'll get a digital Nexora ID instantly." },
  { q: "Can I use my membership at all locations?", a: "Yes — membership is honoured at every partner across India." },
  { q: "Can I cancel anytime?", a: "Yes. Prorated refund available within the first 30 days." },
  { q: "Can I gift a membership?", a: "Absolutely. Choose 'Gift' at checkout and we'll send a beautiful e-card." },
];

export function MembershipPage() {
  const [billing, setBilling] = useState<"year" | "month">("year");
  return (
    <PublicPageHeader />
    <div className="min-h-screen bg-background">
      <section className="from-primary/10 to-accent/10 border-border relative overflow-hidden border-b bg-gradient-to-br py-20 text-center md:py-28">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_2px_2px,#635BFF_1px,transparent_0)] [background-size:32px_32px]" />
        <div className="relative mx-auto max-w-3xl px-4">
          <span className="bg-gradient-cta text-primary-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3 w-3" /> Nexora Membership
          </span>
          <h1 className="text-heading mt-4 text-4xl font-black tracking-tight md:text-6xl" style={{ fontFamily: "Inter, sans-serif" }}>
            Save more. Style more.
          </h1>
          <p className="text-muted-foreground mt-4 text-base md:text-lg">
            Members save an average of ₹14,000/year on services they'd book anyway. Join 38,000+ happy members.
          </p>
          <div className="bg-card border-border mt-8 inline-flex rounded-full border p-1">
            {(["year", "month"] as const).map((p) => (
              <button key={p} onClick={() => setBilling(p)} className={cn("rounded-full px-5 py-2 text-sm font-bold capitalize transition", billing === p ? "bg-gradient-cta text-primary-foreground" : "text-muted-foreground")}>
                {p === "year" ? "Yearly (save 20%)" : "Monthly"}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {PLANS.map((p) => (
            <motion.article key={p.name} whileHover={{ y: -4 }} className={cn("relative overflow-hidden rounded-[24px] p-7 shadow-[var(--shadow-card)]", p.featured && "ring-4 ring-primary/30")}>
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-100", p.color)} />
              <div className="relative">
                {p.featured && <span className="bg-card text-primary mb-3 inline-block rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider">Most Popular</span>}
                <h3 className="text-2xl font-black sm:text-3xl">{p.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black sm:text-4xl">₹{billing === "month" ? Math.round(p.price / 10) : p.price}</span>
                  <span className="text-sm opacity-80">/{billing === "month" ? "mo" : "yr"}</span>
                </div>
                <ul className="mt-6 space-y-2.5 text-sm">
                  {p.perks.map((perk) => <li key={perk} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0" /> {perk}</li>)}
                </ul>
                <button className="bg-card text-heading mt-7 w-full rounded-[var(--radius-button)] px-4 py-3 text-sm font-black hover:brightness-105">
                  Get {p.name}
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="bg-muted/30 border-y border-border py-16">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <h2 className="text-heading text-center text-3xl font-black md:text-4xl">Compare plans</h2>
          <div className="bg-card border-border mt-8 overflow-hidden rounded-[var(--radius-card-lg)] border">
            <table className="w-full text-sm">
              <thead className="border-border border-b bg-muted/50">
                <tr className="text-heading">
                  <th className="p-4 text-left font-bold">Feature</th>
                  {PLANS.map((p) => <th key={p.name} className="p-4 text-center font-bold">{p.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((row, i) => (
                  <tr key={i} className="border-border border-b last:border-0">
                    <td className="text-heading p-4 font-semibold">{row[0]}</td>
                    {row.slice(1).map((v, j) => (
                      <td key={j} className="p-4 text-center">
                        {v === true ? <Check className="text-success mx-auto h-5 w-5" /> : v === false ? <X className="text-muted-foreground/40 mx-auto h-5 w-5" /> : <span className="text-heading font-bold">{v as string}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 md:px-6">
        <h2 className="text-heading text-center text-3xl font-black md:text-4xl">Loved by 38,000+ members</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <article key={t.name} className="border-border bg-card rounded-[var(--radius-card)] border p-6">
              <div className="text-warning flex">{Array.from({length: 5}).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">"{t.text}"</p>
              <div className="border-border mt-4 border-t pt-3">
                <div className="text-heading text-sm font-bold">{t.name}</div>
                <div className="text-primary text-xs font-bold uppercase tracking-wider">{t.tier} member</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20 md:px-6">
        <h2 className="text-heading text-center text-3xl font-black md:text-4xl">Common questions</h2>
        <div className="bg-card border-border mt-8 rounded-[var(--radius-card-lg)] border px-5">
          <Accordion type="single" collapsible>
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`q-${i}`}>
                <AccordionTrigger className="text-heading text-left text-sm font-bold">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}
