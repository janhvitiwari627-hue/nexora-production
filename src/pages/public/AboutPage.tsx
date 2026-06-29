import { Link } from "@tanstack/react-router";
import { Heart, Sparkles, Users } from "lucide-react";
import { PublicPageHeader } from "@/components/shared/PublicPageHeader";

export function AboutPage() {
  return (
  <div className="min-h-screen bg-background">
    <PublicPageHeader />
      <section className="from-primary/10 to-accent/10 border-border border-b bg-gradient-to-br py-20 text-center md:py-28">
        <div className="mx-auto max-w-3xl px-4">
          <span className="bg-card border-border inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider"><Sparkles className="text-primary h-3 w-3" /> Our story</span>
          <h1 className="text-heading mt-4 text-4xl font-black md:text-6xl" style={{ fontFamily: "Inter, sans-serif" }}>Beauty, beautifully organised.</h1>
          <p className="text-muted-foreground mt-4 text-base md:text-lg">
            Nexora is the operating system for India's beauty industry — connecting 2M+ customers with 12,000+ salons, spas and studios.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <h2 className="text-heading text-2xl font-black md:text-3xl">Why we exist</h2>
        <div className="text-muted-foreground mt-4 space-y-4 text-base leading-relaxed">
          <p>Booking a haircut shouldn't require five WhatsApp messages. Owning a salon shouldn't require five different apps. We started Nexora in 2024 with a simple belief: beauty businesses deserve software as beautiful as the work they do.</p>
          <p>Today we power bookings, payments, loyalty and marketing for thousands of partners across India — from neighbourhood barbers to multi-city luxury chains.</p>
        </div>

        <h2 className="text-heading mt-12 text-2xl font-black md:text-3xl">Our values</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            { icon: Heart, title: "Customer-obsessed", body: "Every decision starts with: does this delight our customers?" },
            { icon: Users, title: "Partner-first", body: "Our partners' success is our success. We grow together." },
            { icon: Sparkles, title: "Craft matters", body: "We sweat the details. Pixels, copy, code — all of it." },
          ].map((v) => (
            <div key={v.title} className="border-border bg-card rounded-[var(--radius-card)] border p-5">
              <v.icon className="text-primary h-5 w-5" />
              <h3 className="text-heading mt-3 text-base font-bold">{v.title}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{v.body}</p>
            </div>
          ))}
        </div>

        <div className="border-border mt-16 border-t pt-10 text-center">
          <h3 className="text-heading text-xl font-bold">Want to join us?</h3>
          <p className="text-muted-foreground mt-2 text-sm">We're hiring across product, engineering, design and partnerships.</p>
          <Link to="/contact" className="bg-gradient-cta text-primary-foreground mt-5 inline-block rounded-[var(--radius-button)] px-6 py-3 text-sm font-bold shadow-[var(--shadow-glow)]">Get in touch</Link>
        </div>
      </section>
    </div>
  );
}
