import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Scissors, Sparkles, Star } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { HeroSection } from "@/components/sections/HeroSection";
import { ShopCard } from "@/components/shared/ShopCard";
import { Button } from "@/components/ui/button";
import { shopsQueryOptions } from "@/lib/shops.queries";

const CATEGORIES = [
  { label: "Hair", icon: Scissors },
  { label: "Spa", icon: Sparkles },
  { label: "Nails", icon: Star },
  { label: "Barber", icon: Scissors },
  { label: "Brows", icon: Sparkles },
  { label: "Unisex", icon: Scissors },
];

export function HomePage() {
  const { data: shops } = useSuspenseQuery(shopsQueryOptions({ limit: 6 }));

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <HeroSection />

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 pt-20 md:px-6">
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {CATEGORIES.map((c) => (
            <Link
              key={c.label}
              to="/search"
              className="group flex flex-col items-center gap-2 rounded-[var(--radius-card)] border border-border bg-card p-4 transition hover:-translate-y-1 hover:border-primary hover:shadow-[var(--shadow-card)]"
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-cta text-primary-foreground transition group-hover:scale-110">
                <c.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-heading">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* TOP RATED */}
      <section className="mx-auto max-w-7xl px-4 pt-16 md:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-heading md:text-4xl">
              Top-rated near you
            </h2>
            <p className="mt-2 text-muted-foreground">
              Hand-picked salons our members love this month.
            </p>
          </div>
          <Link
            to="/search"
            className="hidden items-center gap-1 text-sm font-semibold text-primary md:inline-flex"
          >
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shops.map((s) => (
            <ShopCard key={s.slug} shop={s} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-24 max-w-7xl px-4 md:px-6">
        <div className="relative overflow-hidden rounded-[var(--radius-card-lg)] bg-gradient-hero p-10 text-primary-foreground md:p-16">
          <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
          <div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <h3 className="text-3xl font-black tracking-tight md:text-4xl">
                Own a salon? Run it on Nexora.
              </h3>
              <p className="mt-2 max-w-xl opacity-90">
                One platform for bookings, staff, inventory, marketing and payments.
                Free for the first 30 days.
              </p>
            </div>
            <Button
              size="lg"
              className="h-12 rounded-[var(--radius-button)] bg-card px-7 font-bold text-heading hover:bg-card/90"
            >
              For business owners
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
