import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { ShopCard, type Shop } from "@/components/shared/ShopCard";
import { ScrollCarousel } from "./ScrollCarousel";

const MOCK: Shop[] = Array.from({ length: 10 }).map((_, i) => ({
  slug: `top-${i}`,
  name: [
    "Looks Unisex Salon",
    "Glamour Studio Jaipur",
    "Bliss Spa & Wellness",
    "The Barber Co.",
    "Nail Boutique",
    "Bridal by Aanya",
    "Studio Noir",
    "Halo Hair Lounge",
    "Pure Skin Clinic",
    "Urban Cuts",
  ][i],
  tagline: "Premium experience, every visit.",
  category: ["Hair Salon", "Spa", "Nail Studio", "Barber Shop", "Beauty Salon"][i % 5],
  area: ["Malviya Nagar", "C-Scheme", "Vaishali Nagar", "Mansarovar"][i % 4],
  city: "Jaipur",
  cover_image: `https://images.unsplash.com/photo-${
    [
      "1560066984-138dadb4c035",
      "1522337360788-8b13dee7a37e",
      "1600948836101-f9ffda59d250",
      "1503951914875-452162b0f3f1",
      "1604654894610-df63bc536371",
      "1595476108010-b4d1f102b1b1",
      "1559599101-f09722fb4948",
      "1521590832167-7bcbfaa6381f",
      "1571781926291-c477ebfd024b",
      "1562322140-8baeececf3df",
    ][i]
  }?w=800&q=80`,
  rating: 4.4 + (i % 6) * 0.1,
  review_count: 80 + i * 23,
  price_level: (i % 4) + 1,
  is_verified: i % 3 !== 0,
  distance_km: 0.5 + i * 0.4,
  membership_perk: i % 2 === 0 ? "10% off" : null,
}));

export function TopRatedShopsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-20 md:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-heading md:text-4xl">
            Top-rated near you
          </h2>
          <p className="mt-2 text-muted-foreground">
            The salons our members can't stop talking about.
          </p>
        </div>
        <Link
          to="/search"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          View All <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <ScrollCarousel>
        {MOCK.map((s) => (
          <div key={s.slug} className="w-[280px] shrink-0 md:w-[320px]">
            <ShopCard shop={s} variant="carousel" />
          </div>
        ))}
      </ScrollCarousel>
    </section>
  );
}
