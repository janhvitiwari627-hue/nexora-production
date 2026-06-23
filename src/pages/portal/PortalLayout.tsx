import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Building2, LayoutDashboard, Megaphone, Package, Sparkles, Star, Store, Tag, Target, Truck, Users, HelpCircle, Phone } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

type NavItem = { to: string; label: string; icon: typeof Sparkles; exact?: boolean };
const NAV: NavItem[] = [
  { to: "/portal", label: "Overview", icon: Sparkles, exact: true },
  { to: "/portal/brands", label: "Brand Directory", icon: Tag },
  { to: "/portal/distributors", label: "Distributor Directory", icon: Truck },
  { to: "/portal/products", label: "Products", icon: Package },
  { to: "/portal/sponsored", label: "Sponsored", icon: Star },
  { to: "/portal/business-pages", label: "Business Pages", icon: Building2 },
  { to: "/portal/promotions", label: "Promotion Center", icon: Megaphone },
  { to: "/portal/leads", label: "Lead Opportunities", icon: Target },
  { to: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/portal/pricing", label: "Pricing", icon: Users },
  { to: "/portal/contact", label: "Contact", icon: Phone },
] as const;

export function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <div className="border-b border-border/60 bg-card/40 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-3 md:px-6">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: !!n.exact }}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-xs font-semibold text-body transition hover:bg-muted hover:text-heading [&.active]:bg-gradient-cta [&.active]:text-primary-foreground [&.active]:border-transparent"
            >
              <n.icon className="h-3.5 w-3.5" />
              {n.label}
            </Link>
          ))}
        </div>
      </div>
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}

export function PortalHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Store className="h-3 w-3" /> {eyebrow}
          </span>
        )}
        <h1 className="text-3xl font-black tracking-tight text-heading md:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-body">{description}</p>}
      </div>
      {action}
    </header>
  );
}

export function EmptyHint({ icon: Icon = HelpCircle, title, body, action }: { icon?: React.ComponentType<{ className?: string }>; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-card-lg)] border border-dashed border-border/70 bg-card/60 p-10 text-center">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-bold text-heading">{title}</h3>
      {body && <p className="mx-auto mt-1 max-w-md text-sm text-body">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
