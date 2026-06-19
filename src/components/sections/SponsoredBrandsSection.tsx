import { ArrowRight } from "lucide-react";
import { ScrollCarousel } from "./ScrollCarousel";

type Brand = {
  id: string;
  name: string;
  initials: string;
  description: string;
  banner: string;
  accent: string;
};

const BRANDS: Brand[] = [
  {
    id: "lakme",
    name: "Lakmé Salon",
    initials: "LK",
    description: "Iconic Indian beauty, reimagined for modern routines.",
    banner: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&q=80",
    accent: "#FF4F8B",
  },
  {
    id: "lorel",
    name: "L'Oréal Professionnel",
    initials: "L'O",
    description: "Salon-grade color, care and styling expertise.",
    banner: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&q=80",
    accent: "#0A2540",
  },
  {
    id: "kerastase",
    name: "Kérastase",
    initials: "KS",
    description: "Bespoke hair rituals crafted by Paris hair scientists.",
    banner: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=900&q=80",
    accent: "#635BFF",
  },
  {
    id: "macc",
    name: "MAC Cosmetics",
    initials: "MAC",
    description: "Pro artistry kits trusted on global runways and red carpets.",
    banner: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900&q=80",
    accent: "#111",
  },
  {
    id: "olaplex",
    name: "Olaplex",
    initials: "OP",
    description: "Bond-building treatments for healthier, stronger hair.",
    banner: "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=900&q=80",
    accent: "#22D3A0",
  },
];

export function SponsoredBrandsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-20 md:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2">
            <h2 className="text-3xl font-black tracking-tight text-heading md:text-4xl">
              Trusted Beauty Brands
            </h2>
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Sponsored
            </span>
          </div>
          <p className="mt-2 text-muted-foreground">
            Premium products, curated by partner salons across Jaipur.
          </p>
        </div>
      </div>

      <ScrollCarousel>
        {BRANDS.map((b) => (
          <article
            key={b.id}
            className="group relative w-[280px] shrink-0 overflow-hidden rounded-[var(--radius-card)] border border-border bg-card shadow-[0_20px_50px_-25px_rgba(10,37,64,0.45)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_70px_-25px_rgba(10,37,64,0.6)] sm:w-[340px] md:w-[380px]"
          >
            <span className="absolute top-3 right-3 z-10 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
              Sponsored
            </span>

            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={b.banner}
                alt={b.name}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div
                className="absolute bottom-3 left-3 grid h-14 w-14 place-items-center rounded-2xl text-sm font-black text-white shadow-lg ring-2 ring-white/40"
                style={{ background: b.accent }}
              >
                {b.initials}
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-lg font-bold text-heading">{b.name}</h3>
              <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                {b.description}
              </p>
              <button
                type="button"
                className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary transition hover:gap-2"
              >
                Explore Brand <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </ScrollCarousel>
    </section>
  );
}
