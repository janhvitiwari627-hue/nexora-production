import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, MessageCircle, Mail, Phone } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PublicPageHeader } from "@/components/shared/PublicPageHeader";
import { NEXORA_CALL_DISPLAY, NEXORA_CALL_URL, NEXORA_WHATSAPP_URL } from "@/config/contact";

const TOPICS = [
  { name: "Bookings", icon: "📅" },
  { name: "Payments", icon: "💳" },
  { name: "Account", icon: "👤" },
  { name: "Memberships", icon: "✨" },
  { name: "Referrals", icon: "🎁" },
  { name: "Partners", icon: "🏪" },
];

const FAQ = [
  {
    q: "How do I cancel a booking?",
    a: "Open the booking in 'My Bookings' and tap Cancel. Free cancellation up to 4 hours before the slot.",
  },
  {
    q: "When will I be refunded?",
    a: "Refunds reach your original payment method in 5–7 business days.",
  },
  {
    q: "How do I redeem reward points?",
    a: "Toggle 'Use rewards' on the payment screen — your discount is calculated automatically.",
  },
  {
    q: "Can I change my booking date or time?",
    a: "Yes — tap 'Reschedule' on your booking, subject to slot availability.",
  },
  {
    q: "My code isn't working — what should I do?",
    a: "Check the expiry date and minimum order. If it still doesn't apply, contact support.",
  },
  {
    q: "How do I delete my account?",
    a: "Visit Settings → Account → Delete account. Your data is removed within 30 days.",
  },
];

export function HelpPage() {
  const [q, setQ] = useState("");
  const filtered = FAQ.filter(
    (f) =>
      f.q.toLowerCase().includes(q.toLowerCase()) || f.a.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background">
      <PublicPageHeader />
      <section className="from-primary/10 to-accent/10 border-border border-b bg-gradient-to-br py-16 text-center md:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h1
            className="text-heading text-4xl font-black md:text-6xl"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            How can we help?
          </h1>
          <div className="border-border bg-card mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full border p-2 shadow-[var(--shadow-card)]">
            <Search className="text-muted-foreground ml-3 h-5 w-5" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search help articles"
              className="placeholder:text-muted-foreground w-full bg-transparent px-2 py-2 text-sm outline-none"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 md:px-6">
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {TOPICS.map((t) => (
            <button
              key={t.name}
              className="border-border bg-card hover:border-primary/40 hover:shadow-[var(--shadow-card)] flex flex-col items-center gap-2 rounded-[var(--radius-card)] border p-5 transition"
            >
              <span className="text-2xl">{t.icon}</span>
              <span className="text-heading text-sm font-bold">{t.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-16 md:px-6">
        <h2 className="text-heading text-2xl font-black">Common questions</h2>
        <div className="bg-card border-border mt-5 rounded-[var(--radius-card-lg)] border px-5">
          <Accordion type="single" collapsible>
            {filtered.map((f, i) => (
              <AccordionItem key={i} value={`q-${i}`}>
                <AccordionTrigger className="text-heading text-left text-sm font-bold">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {filtered.length === 0 && (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No matches. Try different keywords or contact us.
            </p>
          )}
        </div>
      </section>

      <section className="bg-muted/30 border-t border-border py-12">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <h2 className="text-heading text-2xl font-black">Still need help?</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              {
                icon: MessageCircle,
                label: "WhatsApp us",
                sub: "Replies in minutes",
                href: NEXORA_WHATSAPP_URL,
              },
              {
                icon: Mail,
                label: "Email support",
                sub: "support@nexora.in",
                href: "mailto:support@nexora.in",
              },
              { icon: Phone, label: "Call us", sub: NEXORA_CALL_DISPLAY, href: NEXORA_CALL_URL },
            ].map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith("https://") ? "_blank" : undefined}
                rel={c.href.startsWith("https://") ? "noopener noreferrer" : undefined}
                className="border-border bg-card hover:border-primary/40 flex items-center gap-3 rounded-[var(--radius-card)] border p-5 transition"
              >
                <div className="bg-primary/10 text-primary grid h-11 w-11 place-items-center rounded-xl">
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-heading text-sm font-bold">{c.label}</div>
                  <div className="text-muted-foreground text-xs">{c.sub}</div>
                </div>
              </a>
            ))}
          </div>
          <p className="text-muted-foreground mt-6 text-center text-xs">
            Or visit our{" "}
            <Link to="/contact" className="text-primary font-semibold hover:underline">
              Contact page
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
