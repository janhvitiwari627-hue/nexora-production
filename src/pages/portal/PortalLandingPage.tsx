import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight, Building2, Megaphone, Package, Star, Tag, Target, Truck,
  Users, LayoutDashboard, Globe,
} from "lucide-react";
import { PortalLayout } from "./PortalLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const FEATURES = [
  { icon: Tag, title: "Brand Profile", body: "Build your professional company profile with logo, story and contact." },
  { icon: Package, title: "Product Showcase", body: "Display your complete product range with pricing and imagery." },
  { icon: Star, title: "Sponsored Listings", body: "Get top visibility in directories, search and category pages." },
  { icon: Building2, title: "Business Pages", body: "Dedicated SEO-friendly business pages for your brand." },
  { icon: Megaphone, title: "Product Promotion", body: "Promote products directly to thousands of industry businesses." },
  { icon: Globe, title: "Industry Visibility", body: "Increase market reach across India's beauty ecosystem." },
  { icon: LayoutDashboard, title: "Distributor Dashboard", body: "Manage your network, territory and opportunities in one place." },
  { icon: Target, title: "Lead Opportunities", body: "Receive qualified business inquiries directly to your inbox." },
];

type Stats = { brands: number; distributors: number; products: number; reach: number; leads: number };

export function PortalLandingPage() {
  const [stats, setStats] = useState<Stats>({ brands: 0, distributors: 0, products: 0, reach: 0, leads: 0 });

  useEffect(() => {
    (async () => {
      const [b, d, p, s, l] = await Promise.all([
        supabase.from("brands").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("distributors").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("brand_products").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("salons").select("id", { count: "exact", head: true }),
        supabase.from("portal_leads").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        brands: b.count ?? 0,
        distributors: d.count ?? 0,
        products: p.count ?? 0,
        reach: s.count ?? 0,
        leads: l.count ?? 0,
      });
    })();
  }, []);

  return (
    <PortalLayout>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[var(--radius-card-lg)] border border-border/60 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-8 md:p-14">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" aria-hidden />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-accent/20 blur-3xl" aria-hidden />
        <div className="relative max-w-3xl animate-fade-in">
          <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Distributor &amp; Brand Portal
          </span>
          <h1 className="mt-4 text-balance font-display text-4xl font-bold leading-tight text-heading md:text-5xl lg:text-6xl">
            Grow Your Beauty Brand Across India
          </h1>
          <p className="mt-4 text-pretty text-base text-body md:text-lg">
            Connect with salons, beauty parlours, spas, nail studios, tattoo studios, massage centers
            and beauty retailers through Nexora.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-gradient-cta text-primary-foreground">
              <Link to="/portal/brands/register">Register Brand</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/portal/distributors/register">Register Distributor</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link to="/portal/brands">Explore Directory <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Registered Brands" value={stats.brands} />
        <Stat label="Active Distributors" value={stats.distributors} />
        <Stat label="Product Listings" value={stats.products} />
        <Stat label="Business Reach" value={stats.reach} suffix="+" />
        <Stat label="Leads Generated" value={stats.leads} />
      </section>

      {/* Features */}
      <section className="mt-12">
        <div className="mb-6 max-w-2xl">
          <h2 className="font-display text-2xl font-bold text-heading md:text-3xl">Everything you need to scale</h2>
          <p className="mt-2 text-sm text-body">A complete growth toolkit built for brands, distributors and suppliers.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-[var(--radius-card)] border border-border/60 bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
            >
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-gradient-cta text-primary-foreground transition group-hover:scale-110">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-heading">{f.title}</h3>
              <p className="mt-1 text-sm text-body">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Directory CTAs */}
      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <Link to="/portal/brands" className="group rounded-[var(--radius-card-lg)] border border-border/60 bg-card p-8 transition hover:shadow-[var(--shadow-card)]">
          <Tag className="mb-3 h-7 w-7 text-primary" />
          <h3 className="text-xl font-bold text-heading">Browse the Brand Directory</h3>
          <p className="mt-1 text-sm text-body">Discover beauty brands, source products and connect with HQ teams.</p>
          <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary group-hover:gap-2">Open directory <ArrowRight className="ml-1 h-4 w-4" /></span>
        </Link>
        <Link to="/portal/distributors" className="group rounded-[var(--radius-card-lg)] border border-border/60 bg-card p-8 transition hover:shadow-[var(--shadow-card)]">
          <Truck className="mb-3 h-7 w-7 text-primary" />
          <h3 className="text-xl font-bold text-heading">Find a Distributor</h3>
          <p className="mt-1 text-sm text-body">Region-wise distributors carrying the brands you want to stock.</p>
          <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary group-hover:gap-2">Open directory <ArrowRight className="ml-1 h-4 w-4" /></span>
        </Link>
      </section>
    </PortalLayout>
  );
}

function Stat({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  const display = useCountUp(value);
  return (
    <div className="rounded-[var(--radius-card)] border border-border/60 bg-card p-5 text-center">
      <p className="font-display text-3xl font-bold text-heading md:text-4xl">
        {display.toLocaleString()}{suffix}
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

function useCountUp(target: number, duration = 1200) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (target <= 0) { setN(0); return; }
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return n;
}
