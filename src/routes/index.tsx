import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Calendar, MapPin, Scissors, Search, Sparkles, Star } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ShopCard } from "@/components/cards/ShopCard";
import { Button } from "@/components/ui/button";
import { shopsQueryOptions } from "@/lib/shops.queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nexora — Book salons, spas & barbers near you" },
      {
        name: "description",
        content:
          "Discover top-rated salons, spas and barbershops. Instant booking, member rewards, and exclusive offers — all on Nexora SalonOS.",
      },
      { property: "og:title", content: "Nexora SalonOS" },
      {
        property: "og:description",
        content: "Discover, book, and grow with the operating system for modern salons.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(shopsQueryOptions({ limit: 6 })),
  component: HomePage,
});

const CATEGORIES = [
  { label: "Hair", icon: Scissors, slug: "Hair Salon" },
  { label: "Spa", icon: Sparkles, slug: "Spa" },
  { label: "Nails", icon: Star, slug: "Nail Studio" },
  { label: "Barber", icon: Scissors, slug: "Barber Shop" },
  { label: "Brows", icon: Sparkles, slug: "Beauty Salon" },
  { label: "Unisex", icon: Scissors, slug: "Unisex Salon" },
];

function HomePage() {
  const { data: shops } = useSuspenseQuery(shopsQueryOptions({ limit: 6 }));

  return (
    <div className="bg-background min-h-screen">
      <PublicHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="bg-gradient-mesh absolute inset-0 -z-10" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pt-12 pb-16 md:grid-cols-2 md:px-6 md:pt-20 md:pb-28">
          <div>
            <span className="border-border bg-card text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold shadow-[var(--shadow-card)]">
              <span className="bg-success h-1.5 w-1.5 rounded-full" />
              Trusted by 2,400+ salons across India
            </span>
            <h1 className="text-heading mt-5 text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
              Your next great
              <br />
              <span className="text-gradient-brand">look starts here.</span>
            </h1>
            <p className="text-muted-foreground mt-5 max-w-lg text-base md:text-lg">
              Discover top-rated salons, spas and barbershops near you. Book in seconds,
              earn rewards, and walk out feeling amazing.
            </p>

            <div className="bg-card border-border mt-8 flex flex-col gap-2 rounded-[var(--radius-card)] border p-2 shadow-[var(--shadow-float)] md:flex-row md:items-center">
              <div className="flex flex-1 items-center gap-2 px-3 py-2">
                <MapPin className="text-primary h-5 w-5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                    Location
                  </div>
                  <div className="text-heading truncate text-sm font-semibold">Jaipur, India</div>
                </div>
              </div>
              <div className="bg-border hidden h-10 w-px md:block" />
              <div className="flex flex-1 items-center gap-2 px-3 py-2">
                <Search className="text-primary h-5 w-5 shrink-0" />
                <input
                  placeholder="Try ‘balayage’, ‘facial’, ‘fade’…"
                  className="w-full bg-transparent text-sm font-medium text-heading outline-none placeholder:text-muted-foreground"
                />
              </div>
              <Button
                asChild
                className="bg-gradient-cta text-primary-foreground h-12 rounded-[var(--radius-button)] px-6 font-semibold shadow-[var(--shadow-glow)]"
              >
                <Link to="/search">
                  Search <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {CATEGORIES.slice(0, 4).map((c) => (
                <Link
                  key={c.label}
                  to="/search"
                  className="bg-card border-border text-muted-foreground hover:text-primary hover:border-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition"
                >
                  <c.icon className="h-3.5 w-3.5" /> {c.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-cta absolute -inset-4 rounded-[var(--radius-card-lg)] opacity-20 blur-3xl" />
            <div className="bg-card border-border relative rounded-[var(--radius-card-lg)] border p-2 shadow-[var(--shadow-float)]">
              <img
                src="https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=1400&q=85"
                alt="A modern salon interior"
                className="aspect-[5/6] w-full rounded-[var(--radius-card)] object-cover"
              />
              <div className="glass-panel absolute right-6 -bottom-6 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-[var(--shadow-card)]">
                <div className="bg-gradient-cta grid h-10 w-10 place-items-center rounded-xl text-primary-foreground">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-heading text-sm font-bold">2,150 bookings</div>
                  <div className="text-muted-foreground text-xs">made this week</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 pt-4 md:px-6">
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {CATEGORIES.map((c) => (
            <Link
              key={c.label}
              to="/search"
              className="bg-card border-border group flex flex-col items-center gap-2 rounded-[var(--radius-card)] border p-4 transition hover:-translate-y-1 hover:border-primary hover:shadow-[var(--shadow-card)]"
            >
              <div className="bg-gradient-cta grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground transition group-hover:scale-110">
                <c.icon className="h-5 w-5" />
              </div>
              <span className="text-heading text-sm font-semibold">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* TOP RATED */}
      <section className="mx-auto max-w-7xl px-4 pt-16 md:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-heading text-3xl font-black tracking-tight md:text-4xl">
              Top-rated near you
            </h2>
            <p className="text-muted-foreground mt-2">
              Hand-picked salons our members love this month.
            </p>
          </div>
          <Link
            to="/search"
            className="text-primary hidden items-center gap-1 text-sm font-semibold md:inline-flex"
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
        <div className="bg-gradient-hero relative overflow-hidden rounded-[var(--radius-card-lg)] p-10 text-primary-foreground md:p-16">
          <div className="bg-gradient-mesh absolute inset-0 opacity-30" />
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
              className="bg-card text-heading hover:bg-card/90 h-12 rounded-[var(--radius-button)] px-7 font-bold"
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
