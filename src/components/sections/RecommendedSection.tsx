import { Link } from "@tanstack/react-router";
import { ArrowRight, Lock, Sparkles } from "lucide-react";
import { ShopCard, type Shop } from "@/components/shared/ShopCard";
import { ScrollCarousel } from "./ScrollCarousel";

const MOCK: Shop[] = Array.from({ length: 8 }).map((_, i) => ({
  slug: `rec-${i}`,
  name: [
    "Aura Beauty Bar",
    "Mint Hair Atelier",
    "Velvet Spa Retreat",
    "The Grooming Room",
    "Lush Nails Lounge",
    "Bloom Bridal House",
    "Indigo Hair Co.",
    "Serene Day Spa",
  ][i],
  tagline: "Picked for your vibe.",
  category: ["Hair Salon", "Spa", "Nail Studio", "Barber Shop", "Beauty Salon"][i % 5],
  area: ["Malviya Nagar", "C-Scheme", "Raja Park", "Mansarovar"][i % 4],
  city: "Jaipur",
  cover_image: `https://images.unsplash.com/photo-${
    [
      "1633681926022-84c23e8cb2d6",
      "1580618672591-eb180b1a973f",
      "1540555700478-4be289fbecef",
      "1599351431202-1e0f0137899a",
      "1604654894610-df63bc536371",
      "1595476108010-b4d1f102b1b1",
      "1556228724-4d8c5bba7d36",
      "1571781926291-c477ebfd024b",
    ][i]
  }?w=800&q=80`,
  rating: 4.5 + (i % 5) * 0.1,
  review_count: 60 + i * 31,
  price_level: (i % 4) + 1,
  is_verified: true,
  distance_km: 0.8 + i * 0.6,
  membership_perk: i % 3 === 0 ? "Member perk" : null,
}));

export function RecommendedSection() {
  // TODO: replace with auth check when session is wired in
  const isAuthed = false;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-20 md:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#635BFF] to-[#00D4FF] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
            <Sparkles className="h-3 w-3" /> AI Recommended
          </div>
          <h2 className="text-3xl font-black tracking-tight text-heading md:text-4xl">
            Picked for you
          </h2>
          <p className="mt-2 text-muted-foreground">
            Based on your location and preferences.
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

        {!isAuthed && (
          <div className="flex w-[280px] shrink-0 md:w-[320px]">
            <div className="relative flex w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-[var(--radius-card)] border border-border bg-gradient-to-br from-[#0A2540] to-[#635BFF] p-6 text-center text-white">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-white/15">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base font-bold">Unlock smarter picks</div>
                <p className="mt-1 text-xs text-white/80">
                  Sign in so we can tailor recommendations to your style and history.
                </p>
              </div>
              <Link
                to="/search"
                className="mt-1 rounded-[var(--radius-button)] bg-white px-5 py-2 text-xs font-bold text-heading transition hover:scale-[1.03]"
              >
                Login / Register
              </Link>
            </div>
          </div>
        )}
      </ScrollCarousel>
    </section>
  );
}
