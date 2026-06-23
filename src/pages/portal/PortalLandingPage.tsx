import { Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Megaphone, Package, Star, Tag, Target, Truck, Users } from "lucide-react";
import { PortalLayout, PortalHeading } from "./PortalLayout";
import { Button } from "@/components/ui/button";

const FEATURES = [
  { icon: Tag, title: "Brand Profiles", body: "A polished brand page indexed across Nexora's salon network." },
  { icon: Package, title: "Product Showcase", body: "Showcase your catalog to thousands of salons and beauty pros." },
  { icon: Truck, title: "Distributor Network", body: "Map distributors by region, category and serviced brands." },
  { icon: Star, title: "Sponsored Listings", body: "Boost discovery in directories, search and category pages." },
  { icon: Building2, title: "Business Pages", body: "A full microsite for your brand with media, story and team." },
  { icon: Target, title: "Lead Generation", body: "Salons send inquiries directly to your portal inbox." },
  { icon: Users, title: "Industry Visibility", body: "Get featured to verified business owners ready to source." },
  { icon: Megaphone, title: "Product Promotion", body: "Run campaigns, launches and offers across the platform." },
];

export function PortalLandingPage() {
  return (
    <PortalLayout>
      <PortalHeading
        eyebrow="Distributor & Brand Portal"
        title="Grow your brand across India's beauty industry"
        description="Promote your brand, products and distribution network across thousands of salons, spas, parlours, barbershops and beauty businesses on Nexora."
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild className="bg-gradient-cta text-primary-foreground"><Link to="/portal/brands/register">Register as Brand</Link></Button>
            <Button asChild variant="outline"><Link to="/portal/distributors/register">Register as Distributor</Link></Button>
            <Button asChild variant="ghost"><Link to="/portal/brands">Explore Directory <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-[var(--radius-card)] border border-border/60 bg-card p-5 transition hover:shadow-[var(--shadow-card)]">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-gradient-cta text-primary-foreground">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-heading">{f.title}</h3>
            <p className="mt-1 text-sm text-body">{f.body}</p>
          </div>
        ))}
      </section>

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
