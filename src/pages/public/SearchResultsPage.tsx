import { useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Grid3x3,
  Map as MapIcon,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ShopCard, type Shop } from "@/components/shared/ShopCard";
import { ShopCardSkeleton } from "@/components/shared/SkeletonLoader";
import { EmptyState } from "@/components/shared/EmptyState";
import { shopsQueryOptions } from "@/lib/shops.queries";
import { FilterSidebar } from "./search/FilterSidebar";
import { FilterBottomSheet } from "./search/FilterBottomSheet";
import { SortDropdown } from "./search/SortDropdown";
import { ActiveFiltersBar } from "./search/ActiveFiltersBar";
import { InstantBookingSection } from "./search/InstantBookingSection";
import { VoiceSearchButton } from "@/components/search/VoiceSearchButton";
import {
  DEFAULT_FILTERS,
  isDefault,
  type Filters,
  type SortKey,
} from "./search/filters";

type SearchParams = { q?: string; category?: string };

interface Props {
  search: SearchParams;
  onSearchChange: (next: SearchParams) => void;
}

function applyFilters(shops: Shop[], f: Filters): Shop[] {
  return shops.filter((s) => {
    if (s.rating < f.minRating) return false;
    if (typeof s.distance_km === "number" && s.distance_km > f.maxDistance) return false;
    if (s.price_level < f.priceRange[0] || s.price_level > f.priceRange[1]) return false;
    if (f.categories.length > 0 && !f.categories.includes(s.category)) return false;
    if (f.verifiedOnly && !s.is_verified) return false;
    if (f.offersOnly && !s.membership_perk) return false;
    return true;
  });
}

function sortShops(shops: Shop[], sort: SortKey): Shop[] {
  const arr = [...shops];
  switch (sort) {
    case "rating":
      return arr.sort((a, b) => b.rating - a.rating);
    case "distance":
      return arr.sort(
        (a, b) => (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity),
      );
    case "price":
      return arr.sort((a, b) => a.price_level - b.price_level);
    case "popular":
      return arr.sort((a, b) => b.review_count - a.review_count);
    default:
      return arr;
  }
}

export function SearchResultsPage({ search, onSearchChange }: Props) {
  const [q, setQ] = useState(search.q ?? "");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [draft, setDraft] = useState<Filters>(DEFAULT_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sort, setSort] = useState<SortKey>("relevance");
  const [view, setView] = useState<"grid" | "map">("grid");

  const { data: rawShops, isFetching } = useSuspenseQuery(shopsQueryOptions(search));

  const filtered = useMemo(
    () => sortShops(applyFilters(rawShops, filters), sort),
    [rawShops, filters, sort],
  );

  // Comparison badges
  const badges = useMemo(() => {
    if (filtered.length === 0) return { lowest: "", best: "", popular: "" };
    const lowest = [...filtered].sort((a, b) => a.price_level - b.price_level)[0];
    const best = [...filtered].sort((a, b) => b.rating - a.rating)[0];
    const popular = [...filtered].sort((a, b) => b.review_count - a.review_count)[0];
    return { lowest: lowest.slug, best: best.slug, popular: popular.slug };
  }, [filtered]);

  const resetFilters = () => {
    setDraft(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange({ ...search, q: q || undefined });
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Search bar */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-5 md:px-6">
          <form
            onSubmit={submitSearch}
            className="flex flex-col gap-2 md:flex-row md:items-center"
          >
            <div className="flex flex-1 items-center gap-2 rounded-[var(--radius-card)] border border-border bg-background px-4 py-2.5">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search salons, services, areas… or tap the mic"
                className="flex-1 bg-transparent text-sm font-medium text-heading outline-none placeholder:text-muted-foreground"
              />
              <VoiceSearchButton
                onTranscript={(text) => {
                  setQ(text);
                  onSearchChange({ ...search, q: text });
                }}
              />
            </div>
            <div className="flex items-center gap-2 rounded-[var(--radius-card)] border border-border bg-background px-4 py-2.5 md:w-56">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-heading">Jaipur, India</span>
            </div>
            <button
              type="submit"
              className="rounded-[var(--radius-button)] bg-gradient-cta px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-110"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Desktop sidebar */}
          <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] self-start overflow-hidden rounded-[var(--radius-card-lg)] border border-border bg-card shadow-[var(--shadow-card)] lg:block">
            <div className="h-full overflow-y-auto">
              <FilterSidebar
                draft={draft}
                onChange={setDraft}
                onApply={() => setFilters(draft)}
                onReset={resetFilters}
              />
            </div>
          </aside>

          <main className="min-w-0">
            {/* Toolbar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-black text-heading md:text-2xl" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600 }}>
                  {filtered.length} Matching Result{filtered.length === 1 ? "" : "s"}
                </h1>
                {search.q && (
                  <p className="text-xs text-muted-foreground">
                    for "<span className="font-semibold text-heading">{search.q}</span>"
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSheetOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-heading lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {!isDefault(filters) && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                      •
                    </span>
                  )}
                </button>
                <SortDropdown value={sort} onChange={setSort} />
                <MapViewToggle value={view} onChange={setView} />
              </div>
            </div>

            <div className="mb-4">
              <ActiveFiltersBar
                filters={filters}
                onChange={(f) => {
                  setFilters(f);
                  setDraft(f);
                }}
                onResetAll={resetFilters}
              />
            </div>

            <div className="mb-6">
              <InstantBookingSection shops={filtered} />
            </div>

            {/* Results */}
            <AnimatePresence mode="wait">
              {isFetching ? (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid gap-5 md:grid-cols-2"
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ShopCardSkeleton key={i} />
                  ))}
                </motion.div>
              ) : filtered.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <EmptyState
                    title="No salons match your filters."
                    description="Try widening your distance, rating, or price range."
                    ctaLabel="Reset filters"
                    onCta={resetFilters}
                  />
                </motion.div>
              ) : view === "map" ? (
                <motion.div
                  key="map"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <MapView shops={filtered} />
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid gap-5 md:grid-cols-2"
                >
                  {filtered.map((s) => (
                    <ResultCard key={s.slug} shop={s} badges={badges} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      <PublicFooter />

      <FilterBottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        draft={draft}
        onChange={setDraft}
        onApply={() => setFilters(draft)}
        onReset={resetFilters}
      />
    </div>
  );
}

/* ───────── helpers ───────── */

function ResultCard({
  shop,
  badges,
}: {
  shop: Shop;
  badges: { lowest: string; best: string; popular: string };
}) {
  const tags: { label: string; cls: string; icon: typeof Award }[] = [];
  if (badges.lowest === shop.slug)
    tags.push({ label: "Lowest Price", cls: "bg-success text-white", icon: Award });
  if (badges.best === shop.slug)
    tags.push({ label: "Top Rated", cls: "bg-primary text-primary-foreground", icon: Sparkles });
  if (badges.popular === shop.slug)
    tags.push({ label: "Most Popular", cls: "bg-warning text-heading", icon: TrendingUp });

  return (
    <div className="relative">
      {tags.length > 0 && (
        <div className="pointer-events-none absolute top-5 left-1/2 z-10 flex -translate-x-1/2 flex-wrap justify-center gap-1.5">
          {tags.map((t) => (
            <span
              key={t.label}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-lg ${t.cls}`}
            >
              <t.icon className="h-3 w-3" /> {t.label}
            </span>
          ))}
        </div>
      )}
      <ShopCard shop={shop} />
    </div>
  );
}

function MapViewToggle({
  value,
  onChange,
}: {
  value: "grid" | "map";
  onChange: (v: "grid" | "map") => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-border bg-card p-1">
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition ${
          value === "grid"
            ? "bg-gradient-cta text-primary-foreground shadow"
            : "text-muted-foreground"
        }`}
        aria-pressed={value === "grid"}
      >
        <Grid3x3 className="h-3.5 w-3.5" />
        Grid
      </button>
      <button
        type="button"
        onClick={() => onChange("map")}
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition ${
          value === "map"
            ? "bg-gradient-cta text-primary-foreground shadow"
            : "text-muted-foreground"
        }`}
        aria-pressed={value === "map"}
      >
        <MapIcon className="h-3.5 w-3.5" />
        Map
      </button>
    </div>
  );
}

function MapView({ shops }: { shops: Shop[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="relative h-[600px] overflow-hidden rounded-[var(--radius-card-lg)] border border-border shadow-[var(--shadow-card)]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 40%, rgba(99,91,255,0.15), transparent 60%), radial-gradient(circle at 70% 70%, rgba(0,212,255,0.15), transparent 60%), linear-gradient(135deg, #eef2f7, #dbe5f1)",
          }}
        />
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full opacity-40"
          viewBox="0 0 400 400"
          preserveAspectRatio="none"
        >
          {Array.from({ length: 14 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 30} x2="400" y2={i * 30} stroke="#94a3b8" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 14 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 30} y1="0" x2={i * 30} y2="400" stroke="#94a3b8" strokeWidth="0.5" />
          ))}
        </svg>
        {shops.slice(0, 12).map((s, i) => (
          <div
            key={s.slug}
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ left: `${10 + (i * 7) % 80}%`, top: `${20 + (i * 11) % 60}%` }}
          >
            <div className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground shadow-lg ring-2 ring-white">
              <Star className="h-3 w-3 fill-warning text-warning" />
              {s.rating.toFixed(1)}
            </div>
          </div>
        ))}
        <div className="absolute right-3 bottom-3 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-heading shadow">
          Live map coming soon
        </div>
      </div>
      <ul className="flex max-h-[600px] flex-col gap-3 overflow-y-auto pr-1">
        {shops.map((s) => (
          <li key={s.slug}>
            <ShopCard shop={s} variant="list" />
          </li>
        ))}
      </ul>
    </div>
  );
}
