import { Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, Star } from "lucide-react";

type NearbyShop = {
  slug: string;
  name: string;
  area: string;
  rating: number;
  reviews: number;
  distance_km: number;
  image: string;
  lat: number;
  lng: number;
};

const SHOPS: NearbyShop[] = [
  {
    slug: "looks",
    name: "Looks Unisex Salon",
    area: "Malviya Nagar",
    rating: 4.8,
    reviews: 312,
    distance_km: 0.6,
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80",
    lat: 26.85,
    lng: 75.81,
  },
  {
    slug: "bliss",
    name: "Bliss Spa & Wellness",
    area: "C-Scheme",
    rating: 4.7,
    reviews: 184,
    distance_km: 1.2,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80",
    lat: 26.91,
    lng: 75.79,
  },
  {
    slug: "barberco",
    name: "The Barber Co.",
    area: "Vaishali Nagar",
    rating: 4.6,
    reviews: 256,
    distance_km: 2.3,
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80",
    lat: 26.91,
    lng: 75.74,
  },
  {
    slug: "nailb",
    name: "Nail Boutique",
    area: "Raja Park",
    rating: 4.9,
    reviews: 142,
    distance_km: 3.1,
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80",
    lat: 26.9,
    lng: 75.83,
  },
];

export function NearbyShopsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-20 md:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-heading md:text-4xl">
            Nearby in Jaipur
          </h2>
          <p className="mt-2 text-muted-foreground">
            Showing salons within a 5 km radius of you.
          </p>
        </div>
        <Link
          to="/search"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          View All Nearby <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[55fr_45fr]">
        {/* MAP */}
        <div className="relative aspect-[5/4] overflow-hidden rounded-[var(--radius-card-lg)] border border-border bg-muted shadow-[var(--shadow-card)] lg:aspect-auto lg:min-h-[480px]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 40%, rgba(99,91,255,0.15), transparent 60%), radial-gradient(circle at 70% 70%, rgba(0,212,255,0.15), transparent 60%), linear-gradient(135deg, #eef2f7, #dbe5f1)",
            }}
          />
          {/* Pseudo street grid */}
          <svg
            aria-hidden
            className="absolute inset-0 h-full w-full opacity-40"
            viewBox="0 0 400 400"
            preserveAspectRatio="none"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <line
                key={`h${i}`}
                x1="0"
                y1={i * 34}
                x2="400"
                y2={i * 34}
                stroke="#94a3b8"
                strokeWidth="0.5"
              />
            ))}
            {Array.from({ length: 12 }).map((_, i) => (
              <line
                key={`v${i}`}
                x1={i * 34}
                y1="0"
                x2={i * 34}
                y2="400"
                stroke="#94a3b8"
                strokeWidth="0.5"
              />
            ))}
          </svg>
          {/* Pins */}
          {SHOPS.map((s, i) => (
            <div
              key={s.slug}
              className="absolute -translate-x-1/2 -translate-y-full"
              style={{ left: `${20 + i * 18}%`, top: `${35 + (i % 3) * 18}%` }}
            >
              <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-white">
                <MapPin className="h-4 w-4" />
              </div>
            </div>
          ))}
          <div className="absolute right-3 bottom-3 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-heading shadow">
            Live map coming soon
          </div>
        </div>

        {/* LIST */}
        <ul className="flex flex-col gap-3">
          {SHOPS.map((s) => (
            <li
              key={s.slug}
              className="flex gap-3 rounded-[var(--radius-card)] border border-border bg-card p-3 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]"
            >
              <img
                src={s.image}
                alt={s.name}
                loading="lazy"
                className="h-24 w-24 shrink-0 rounded-xl object-cover"
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate text-sm font-bold text-heading">{s.name}</h3>
                  <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-heading">
                    <Star className="h-3 w-3 fill-warning text-warning" />
                    {s.rating}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {s.area} · {s.distance_km} km
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {s.reviews} reviews
                </p>
                <div className="mt-auto pt-2">
                  <Link
                    to="/book/$slug"
                    params={{ slug: s.slug }}
                    className="inline-flex items-center justify-center rounded-[var(--radius-button)] bg-gradient-cta px-3 py-1.5 text-xs font-bold text-primary-foreground transition hover:brightness-110"
                  >
                    Quick Book
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
