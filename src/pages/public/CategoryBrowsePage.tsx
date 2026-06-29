import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useParams } from "@tanstack/react-router";
import { ChevronRight, Filter, Sparkles, TrendingUp, Users } from "lucide-react";
import { ShopCard, type Shop } from "@/components/shared/ShopCard";
import { FilterPills } from "@/components/shared/FilterPills";
import { cn } from "@/lib/utils";
import { PublicPageHeader } from "@/components/shared/PublicPageHeader";

const CATEGORIES: Record<
  string,
  { name: string; tagline: string; gradient: string; subs: string[] }
> = {
  salon: {
    name: "Salons",
    tagline: "Cuts, colour, styling — all the great hair days",
    gradient: "from-[#635BFF] via-[#8B5CF6] to-[#EC4899]",
    subs: ["Unisex", "Men's", "Women's", "Kids"],
  },
  "beauty-parlour": {
    name: "Beauty Parlours",
    tagline: "Facials, threading, waxing — your beauty ritual",
    gradient: "from-[#EC4899] via-[#F97316] to-[#F59E0B]",
    subs: ["Facial", "Bridal", "Threading", "Waxing"],
  },
  spa: {
    name: "Spa & Wellness",
    tagline: "Relax, unwind, restore",
    gradient: "from-[#0EA5E9] via-[#6366F1] to-[#8B5CF6]",
    subs: ["Aromatherapy", "Couple Spa", "Foot Spa", "Body Polish"],
  },
  tattoo: {
    name: "Tattoo Studios",
    tagline: "Tell your story in ink",
    gradient: "from-[#0F172A] via-[#1E293B] to-[#635BFF]",
    subs: ["Fine line", "Black & grey", "Colour", "Cover-up"],
  },
  massage: {
    name: "Massage Centres",
    tagline: "Knots out. Calm in.",
    gradient: "from-[#10B981] via-[#0EA5E9] to-[#6366F1]",
    subs: ["Swedish", "Deep tissue", "Thai", "Ayurvedic"],
  },
  nails: {
    name: "Nail Studios",
    tagline: "Polished to perfection",
    gradient: "from-[#F472B6] via-[#FB7185] to-[#F59E0B]",
    subs: ["Gel", "Acrylic", "Nail art", "Extensions"],
  },
  makeup: {
    name: "Makeup Artists",
    tagline: "From everyday to occasion",
    gradient: "from-[#F43F5E] via-[#EC4899] to-[#8B5CF6]",
    subs: ["Party", "Bridal", "HD", "Airbrush"],
  },
  mehendi: {
    name: "Mehendi Artists",
    tagline: "Tradition, designed beautifully",
    gradient: "from-[#F59E0B] via-[#F97316] to-[#EF4444]",
    subs: ["Bridal", "Arabic", "Indo-Arabic", "Minimal"],
  },
};

const AREAS = [
  "All Jaipur",
  "Malviya Nagar",
  "C-Scheme",
  "Vaishali Nagar",
  "Mansarovar",
  "Raja Park",
  "Jagatpura",
  "Tonk Road",
];
const SORTS = ["Recommended", "Top rated", "Nearest", "Most booked"];

const SAMPLE_SHOPS: Shop[] = Array.from({ length: 8 }).map((_, i) => ({
  slug: `sample-${i}`,
  name: [
    "Looks Unisex Salon",
    "Bliss Spa",
    "The Barber Co.",
    "Glow Studio",
    "Halo Hair Lounge",
    "Studio Noir",
    "Pure Skin Clinic",
    "Nail Boutique",
  ][i],
  tagline: "Top-rated in your area",
  category: "Salon",
  city: "Jaipur",
  area: AREAS[(i % (AREAS.length - 1)) + 1],
  cover_image: `https://images.unsplash.com/photo-${["1560066984-138dadb4c035", "1540555700478-4be289fbecef", "1503951914875-452162b0f3f1", "1522337360788-8b13dee7a37e", "1562322140-8baeececf3df", "1633681926022-84c23e8cb2d6", "1521590832167-7bcbfaa6381f", "1487412947147-5cebf100ffc2"][i]}?w=800&q=80`,
  rating: 4.5 + (i % 5) * 0.1,
  review_count: 200 + i * 47,
  price_level: (i % 3) + 1,
  is_verified: i % 2 === 0,
  distance_km: 0.6 + i * 0.4,
}));

export function CategoryBrowsePage() {
  const { slug } = useParams({ from: "/category/$slug" });
  const cat = CATEGORIES[slug] ?? CATEGORIES.salon;
  const [sub, setSub] = useState(cat.subs[0]);
  const [area, setArea] = useState(AREAS[0]);
  const [sort, setSort] = useState(SORTS[0]);

  const filtered = useMemo(() => {
    let shops = [...SAMPLE_SHOPS];
    if (area !== "All Jaipur") shops = shops.filter((s) => s.area === area);
    if (sort === "Top rated") shops.sort((a, b) => b.rating - a.rating);
    if (sort === "Nearest") shops.sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0));
    if (sort === "Most booked") shops.sort((a, b) => b.review_count - a.review_count);
    return shops;
  }, [area, sort]);

  return (
    <div className="min-h-screen bg-background">
      <PublicPageHeader />
      <section
        className={cn("relative overflow-hidden bg-gradient-to-br py-16 md:py-24", cat.gradient)}
      >
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <nav className="text-xs text-white/80">
            <Link to="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">{cat.name}</span>
          </nav>
          <h1
            className="mt-4 text-4xl font-black tracking-tight text-white md:text-6xl"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {cat.name}
          </h1>
          <p className="mt-3 max-w-xl text-base text-white/90 md:text-lg">{cat.tagline}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-white">
            <Stat icon={Users} value="2.4k+" label="customers monthly" />
            <Stat icon={TrendingUp} value="124" label="businesses" />
            <Stat icon={Sparkles} value="4.8" label="avg rating" />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:px-6 lg:grid-cols-[1fr_300px]">
        <main>
          <FilterPills options={cat.subs} value={sub} onChange={setSub} />
          <div className="border-border bg-card mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border p-3">
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="bg-background border-border rounded-[var(--radius-button)] border px-3 py-2 text-sm font-semibold"
            >
              {AREAS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-background border-border rounded-[var(--radius-button)] border px-3 py-2 text-sm font-semibold"
            >
              {SORTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
              <Filter className="h-3.5 w-3.5" /> {filtered.length} results
            </span>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((s) => (
              <ShopCard key={s.slug} shop={s} variant="grid" />
            ))}
          </div>
        </main>

        <aside className="space-y-4">
          <InsightCard
            title="Trending in your area"
            lines={[
              "Bridal packages — bookings up 38% this month",
              "Hair colour services peak on Saturdays",
              "Best value: morning slots before 11 AM",
            ]}
          />
          <InsightCard title="Popular searches" lines={cat.subs.map((s) => `${s} near me`)} />
          <Link
            to="/membership"
            className="from-primary/10 to-accent/10 border-primary/30 block rounded-[var(--radius-card)] border bg-gradient-to-br p-5"
          >
            <Sparkles className="text-primary h-5 w-5" />
            <h4 className="text-heading mt-2 text-base font-bold">Save up to 25%</h4>
            <p className="text-muted-foreground mt-1 text-xs">
              Join Nexora Membership for member-only pricing
            </p>
            <span className="text-primary mt-3 inline-flex items-center text-sm font-bold">
              Learn more <ChevronRight className="h-4 w-4" />
            </span>
          </Link>
        </aside>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 backdrop-blur">
      <Icon className="h-3.5 w-3.5" />
      <b>{value}</b> {label}
    </span>
  );
}

function InsightCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="border-border bg-card rounded-[var(--radius-card)] border p-5">
      <h4 className="text-heading mb-3 text-sm font-bold uppercase tracking-wider">{title}</h4>
      <ul className="space-y-2">
        {lines.map((l) => (
          <li key={l} className="text-muted-foreground flex items-start gap-2 text-sm">
            <span className="bg-primary mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" /> {l}
          </li>
        ))}
      </ul>
    </div>
  );
}
