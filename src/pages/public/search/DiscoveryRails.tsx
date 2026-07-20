import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { BadgeCheck, MapPin, Star, TrendingUp, Compass, Sparkles } from "lucide-react";
import type { Shop } from "@/components/shared/ShopCard";
import type { Filters } from "./filters";
import { DEFAULT_FILTERS } from "./filters";

type RailKey = "nearby" | "trending" | "category" | "verified";

interface Props {
  shops: Shop[];
  onApplyFilters: (f: Filters) => void;
  onSelectCategory: (category: string) => void;
}

/**
 * Customer Discovery Engine — V1 rails.
 * Surfaces the 4 conversion-first sections directly above the search results
 * using whatever Supabase data the parent query already returned (with mock
 * fallback). Clicking a rail header drills into the existing /search filters.
 */
export function DiscoveryRails({ shops, onApplyFilters, onSelectCategory }: Props) {
  const nearby = useMemo(
    () =>
      [...shops]
        .sort((a, b) => (a.distance_km ?? 99) - (b.distance_km ?? 99) || b.rating - a.rating)
        .slice(0, 10),
    [shops],
  );
  const trending = useMemo(
    () =>
      [...shops]
        .sort((a, b) => (b.popularity ?? b.review_count) - (a.popularity ?? a.review_count))
        .slice(0, 10),
    [shops],
  );
  const verified = useMemo(
    () =>
      shops
        .filter((s) => s.is_verified)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 10),
    [shops],
  );
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    shops.forEach((s) => counts.set(s.category, (counts.get(s.category) ?? 0) + 1));
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [shops]);

  if (shops.length === 0) return null;

  return (
    <section aria-label="Discover" className="mb-6 space-y-6">
      <Rail
        icon={<Compass className="h-4 w-4" />}
        title="Nearby Discovery"
        subtitle="Closest beauty spots to you"
        items={nearby}
        onSeeAll={() => onApplyFilters({ ...DEFAULT_FILTERS, maxDistance: 5 })}
        keyName="nearby"
      />
      <Rail
        icon={<TrendingUp className="h-4 w-4" />}
        title="Trending Now"
        subtitle="Most booked this week"
        items={trending}
        onSeeAll={() => onApplyFilters({ ...DEFAULT_FILTERS, mostPopular: true })}
        keyName="trending"
      />
      <CategoryRail categories={categories} onPick={onSelectCategory} />
      <Rail
        icon={<BadgeCheck className="h-4 w-4" />}
        title="Verified Discovery"
        subtitle="Hand-picked & verified salons"
        items={verified}
        onSeeAll={() => onApplyFilters({ ...DEFAULT_FILTERS, verifiedOnly: true })}
        keyName="verified"
      />
    </section>
  );
}

function Rail({
  icon,
  title,
  subtitle,
  items,
  onSeeAll,
  keyName,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  items: Shop[];
  onSeeAll: () => void;
  keyName: RailKey;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-heading">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary">
              {icon}
            </span>
            {title}
          </h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onSeeAll}
          className="text-xs font-semibold text-primary hover:underline"
        >
          See all →
        </button>
      </div>
      <div
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        data-discovery-rail={keyName}
      >
        {items.map((s) => (
          <MiniCard key={s.slug} shop={s} />
        ))}
      </div>
    </div>
  );
}

function MiniCard({ shop }: { shop: Shop }) {
  return (
    <Link
      to="/site/$businessSlug"
      params={{ businessSlug: shop.slug }}
      className="group w-[240px] shrink-0 snap-start overflow-hidden rounded-[var(--radius-card)] border border-border bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {shop.cover_image ? (
          <img
            src={shop.cover_image}
            alt={shop.name}
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Sparkles className="h-6 w-6" />
          </div>
        )}
        {shop.is_verified && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
            <BadgeCheck className="h-3 w-3" /> Verified
          </span>
        )}
      </div>
      <div className="space-y-1 p-3">
        <h3 className="line-clamp-1 text-sm font-bold text-heading">{shop.name}</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="line-clamp-1">{shop.area ?? shop.city}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1 font-semibold text-heading">
            <Star className="h-3 w-3 fill-warning text-warning" />
            {shop.rating?.toFixed(1) ?? "—"}
            <span className="text-muted-foreground">({shop.review_count})</span>
          </span>
          {typeof shop.starting_price === "number" && shop.starting_price > 0 ? (
            <span className="font-bold text-primary">
              ₹{shop.starting_price.toLocaleString("en-IN")}+
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function CategoryRail({
  categories,
  onPick,
}: {
  categories: Array<[string, number]>;
  onPick: (cat: string) => void;
}) {
  if (categories.length === 0) return null;
  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-heading">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            Browse by Category
          </h2>
          <p className="text-xs text-muted-foreground">Jump straight into what you want today</p>
        </div>
      </div>
      <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map(([cat, count]) => (
          <button
            key={cat}
            type="button"
            onClick={() => onPick(cat)}
            className="shrink-0 snap-start rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-heading shadow-sm transition hover:border-primary hover:bg-primary/5"
          >
            {cat} <span className="ml-1 text-xs font-normal text-muted-foreground">({count})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
