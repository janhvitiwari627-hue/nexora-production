import { Link, useRouterState } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Mail, Sparkles, Twitter, Youtube } from "lucide-react";

type Col = { title: string; links: { label: string; to: string }[] };

const COLUMNS: Col[] = [
  {
    title: "Company",
    links: [
      { label: "About us", to: "/about" },
      { label: "Beauty jobs", to: "/jobs" },
      { label: "Growth partner", to: "/growth-partner" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Explore salons", to: "/search" },
      { label: "Customer app", to: "/customer-app" },
      { label: "Booking flow", to: "/booking-flow" },
      { label: "Membership rules", to: "/membership-rules" },
      { label: "QR payment guide", to: "/qr-payments" },
    ],
  },
  {
    title: "For Owners",
    links: [
      { label: "Run your salon", to: "/for-owners" },
      { label: "Shop Owner App", to: "/shop-owner-app" },
      { label: "Website builder", to: "/website-builder" },
      { label: "Owner login", to: "/role-selection" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help center", to: "/help" },
      { label: "Nexora Academy", to: "/academy" },
      { label: "Distributor app", to: "/distributor-app" },
      { label: "Jobs app", to: "/jobs-app" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", to: "/privacy" },
      { label: "Terms", to: "/terms" },
      { label: "Refund policy", to: "/refund-cancellation" },
      { label: "Contact support", to: "/contact" },
    ],
  },
];

const SOCIALS = [
  { Icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { Icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { Icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { Icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  { Icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
];

import { assertPublicOnly } from "@/lib/enforce-public-only";

export function PublicFooter() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  // The marketing footer belongs to the main landing page only.
  if (pathname !== "/" || assertPublicOnly("PublicFooter")) return null;
  return (
    <footer data-testid="public-footer" className="border-border bg-card mt-24 border-t">
      <div className="mx-auto max-w-7xl px-4 pt-14 pb-10 md:px-6">
        {/* Top: brand + socials */}
        <div className="grid items-start gap-6 border-b border-border pb-10 md:grid-cols-[1fr_auto]">
          <div className="max-w-md">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-cta grid h-9 w-9 place-items-center rounded-xl text-primary-foreground shadow-[var(--shadow-glow)]">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-gradient-brand text-xl font-extrabold tracking-tight">
                Nexora
              </span>
            </div>
            <p className="text-muted-foreground mt-3 text-sm">
              The operating system for modern salons, spas & barbershops. Discover, book, and grow —
              all in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {SOCIALS.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noreferrer"
                className="border-border text-muted-foreground hover:text-primary hover:border-primary grid h-10 w-10 place-items-center rounded-full border transition"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
            <a
              href="mailto:hello@nexora.app"
              className="border-border text-muted-foreground hover:text-primary hover:border-primary ml-1 inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition"
            >
              <Mail className="h-4 w-4" /> hello@nexora.app
            </a>
          </div>
        </div>

        {/* Columns: 2 cols on mobile, 6 on desktop */}
        <div className="grid grid-cols-2 gap-8 pt-10 md:grid-cols-5">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-heading text-sm font-bold">{col.title}</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-muted-foreground hover:text-primary transition">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-border border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground md:flex-row md:px-6">
          <p>© {new Date().getFullYear()} Nexora SalonOS. Crafted in India.</p>
          <p className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-primary transition">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-primary transition">
              Terms
            </Link>
            <Link to="/refund-cancellation" className="hover:text-primary transition">
              Refunds
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
