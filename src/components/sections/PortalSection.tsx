import { Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Megaphone, Package, Star, Tag, Target, Truck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const ITEMS = [
  { icon: Tag, label: "Brand Profiles" },
  { icon: Package, label: "Product Showcase" },
  { icon: Truck, label: "Distributor Network" },
  { icon: Star, label: "Sponsored Listings" },
  { icon: Building2, label: "Business Pages" },
  { icon: Target, label: "Lead Generation" },
  { icon: Users, label: "Industry Visibility" },
  { icon: Megaphone, label: "Product Promotion" },
];

export function PortalSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6">
      <div className="relative overflow-hidden rounded-[var(--radius-card-lg)] border border-border/60 bg-card p-8 md:p-12">
        <div className="absolute inset-0 bg-gradient-mesh opacity-10" />
        <div className="relative grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-cta px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
              <Star className="h-3 w-3" /> Business Growth
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-heading md:text-4xl">
              Distributor & Brand Portal
            </h2>
            <p className="mt-3 max-w-xl text-body">
              Promote your brand, products and distribution network across thousands of beauty businesses on Nexora.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild className="bg-gradient-cta text-primary-foreground"><Link to="/portal/brands/register">Register as Brand</Link></Button>
              <Button asChild variant="outline"><Link to="/portal/distributors/register">Register as Distributor</Link></Button>
              <Button asChild variant="ghost"><Link to="/portal">Explore Directory <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            {ITEMS.map((it) => (
              <div key={it.label} className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 p-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-cta text-primary-foreground">
                  <it.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold text-heading">{it.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
