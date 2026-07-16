import { useEffect, useMemo, useRef, useState } from "react";
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
import { DiscoveryRails } from "./search/DiscoveryRails";
import { VoiceSearchButton } from "@/components/search/VoiceSearchButton";
import {
  DEFAULT_FILTERS,
  filtersFromSearch,
  filtersToSearch,
  isDefault,
  PRICE_MIN,
  PRICE_MAX,
  sortFromSearch,
  viewFromSearch,
  type Filters,
  type SearchUrlParams,
  type SortKey,
} from "./search/filters";

type SearchParams = SearchUrlParams;

interface Props {
  search: SearchParams;
  onSearchChange: (next: SearchParams) => void;
}

function shopStartingPrice(s: Shop): number | null {
  if (typeof s.starting_price === "number" && s.starting_price > 0) return s.starting_price;
  if (typeof s.price_level === "number" && s.price_level > 0) return s.price_level * 250;
  return null;
}

function matchesQuery(s: Shop, q: string): boolean {
  const needle = q.toLowerCase().trim();
  if (!needle) return true;
  const hay = [s.name, s.category, s.area ?? "", s.city ?? "", s.tagline ?? ""]
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
}

function applyFilters(shops: Shop[], f: Filters, q: string): Shop[] {
  return shops.filter((s) => {
    if (!matchesQuery(s, q)) return false;
    if (s.rating < f.minRating) return false;
    if (typeof s.distance_km === "number" && s.distance_km > f.maxDistance) return false;

    const priceFiltered = f.priceRange[0] !== PRICE_MIN || f.priceRange[1] !== PRICE_MAX;
    if (priceFiltered) {
      const sp = shopStartingPrice(s);
      if (sp === null) return false;
      if (sp < f.priceRange[0] || sp > f.priceRange[1]) return false;
    }
    if (f.categories.length > 0 && !f.categories.includes(s.category)) return false;
    if (f.gender !== "all") {
      const g = s.gender ?? "unisex";
      if (g !== "unisex" && g !== f.gender) return false;
    }
    if (f.verifiedOnly && !s.is_verified) return false;
    if (f.topRated && !(s.badges?.includes("top_rated") || s.rating >= 4.7)) return false;
    if (
      f.mostPopular &&
      !(s.badges?.includes("most_popular") || (s.review_count ?? 0) >= 300)
    )
      return false;
    if (f.offersOnly && !s.membership_perk) return false;
    return true;
  });
}

function sortShops(shops: Shop[], sort: SortKey): Shop[] {
  const arr = [...shops];
  const price = (s: Shop) => shopStartingPrice(s) ?? Number.POSITIVE_INFINITY;
  switch (sort) {
    case "rating":
      return arr.sort((a, b) => b.rating - a.rating);
    case "distance":
      return arr.sort(
        (a, b) => (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity),
      );
    case "price_low":
      return arr.sort((a, b) => price(a) - price(b));
    case "price_high":
      return arr.sort((a, b) => price(b) - price(a));
    case "popular":
      return arr.sort(
        (a, b) => (b.popularity ?? b.review_count) - (a.popularity ?? a.review_count),
      );
    default:
      return arr;
  }
}

export function SearchResultsPage({ search, onSearchChange }: Props) {
  // Filters / sort / view are derived from the URL so refresh & sharing preserve state.
  const filters = useMemo(() => filtersFromSearch(search), [search]);
  const sort = sortFromSearch(search);
  const view = viewFromSearch(search);

  // Local typing buffer for the search input — committed to URL on submit.
  const [q, setQ] = useState(search.q ?? "");
  // Staging buffer for the filter sidebar (Apply commits to URL).
  const [draft, setDraft] = useState<Filters>(filters);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Re-sync local buffers when URL changes externally (back/forward, share-link).
  useEffect(() => {
    setQ(search.q ?? "");
  }, [search.q]);
  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  const { data: rawShops, isFetching } = useSuspenseQuery(
    shopsQueryOptions({ q: search.q, category: search.category, area: search.area }),
  );

  const filtered = useMemo(
    () => sortShops(applyFilters(rawShops, filters, q), sort),
    [rawShops, filters, sort, q],
  );

  // Scroll restoration for browser back/forward navigation.
  // Persists window scrollY per history entry (keyed by history.state.key which
  // TanStack Router assigns), and re-applies it once results have rendered.
  const isPoppingRef = useRef(false);
  const pendingRestoreRef = useRef<number | null>(null);

  const historyKey = () => {
    if (typeof window === "undefined") return "";
    const state = window.history.state as { key?: string } | null;
    return state?.key ?? window.location.href;
  };

  // Continuously save scroll position for the current history entry.
  useEffect(() => {
    let raf = 0;
    const save = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        try {
          sessionStorage.setItem(`search-scroll:${historyKey()}`, String(window.scrollY));
        } catch {
          /* ignore quota / privacy errors */
        }
      });
    };
    window.addEventListener("scroll", save, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", save);
    };
  }, []);

  // Detect back/forward so we know to restore instead of preserving current pos.
  useEffect(() => {
    const onPop = () => {
      isPoppingRef.current = true;
      const saved = sessionStorage.getItem(`search-scroll:${historyKey()}`);
      pendingRestoreRef.current = saved != null ? Number(saved) : null;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Once results for the popped entry render, restore the saved scrollY.
  // Retries via rAF for up to ~1.5s so async re-renders don't fight us.
  useEffect(() => {
    if (!isPoppingRef.current) return;
    if (isFetching) return;
    const target = pendingRestoreRef.current;
    isPoppingRef.current = false;
    pendingRestoreRef.current = null;
    if (target == null) return;

    const deadline = performance.now() + 1500;
    const restore = () => {
      window.scrollTo({ top: target, behavior: "auto" });
      if (Math.abs(window.scrollY - target) < 2) return;
      if (performance.now() < deadline) requestAnimationFrame(restore);
    };
    requestAnimationFrame(() => requestAnimationFrame(restore));
  }, [filtered, isFetching]);

  // Comparison badges
  const badges = useMemo(() => {
    if (filtered.length === 0) return { lowest: "", best: "", popular: "" };
    const price = (s: Shop) => shopStartingPrice(s) ?? Number.POSITIVE_INFINITY;
    const lowest = [...filtered].sort((a, b) => price(a) - price(b))[0];
    const best = [...filtered].sort((a, b) => b.rating - a.rating)[0];
    const popular = [...filtered].sort((a, b) => b.review_count - a.review_count)[0];
    return { lowest: lowest.slug, best: best.slug, popular: popular.slug };
  }, [filtered]);

  // Helpers to write back to the URL while preserving unrelated params.
  const commitFilters = (f: Filters) => {
    onSearchChange({
      q: search.q,
      category: search.category,
      sort: search.sort,
      view: search.view,
      ...filtersToSearch(f),
    });
  };
  const setSort = (next: SortKey) => {
    const { sort: _omit, ...rest } = search;
    onSearchChange(next === "relevance" ? rest : { ...rest, sort: next });
  };
  const setView = (next: "grid" | "map") => {
    const { view: _omit, ...rest } = search;
    onSearchChange(next === "grid" ? rest : { ...rest, view: next });
  };

  const scrollResultsIntoView = (behavior: ScrollBehavior = "smooth") => {
    const target = document.getElementById("search-results");
    if (!target) return;

    const header = document.querySelector<HTMLElement>('[data-testid="public-header"]');
    const headerOffset = (header?.getBoundingClientRect().height ?? 0) + 14;
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;

    window.scrollTo({ top: Math.max(0, top), behavior });
  };

  const scrollToResultsAfterFiltering = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollResultsIntoView("smooth"));
    });

    [120, 320, 650].forEach((delay) => {
      window.setTimeout(() => scrollResultsIntoView("smooth"), delay);
    });
  };

  // Anchor-based scroll restore: pin the topmost visible result card so the
  // same section stays in view even when the list height changes.
  const preserveScroll = (fn: () => void) => {
    const fallbackY = window.scrollY;
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>("[data-result-slug]"),
    );
    let anchorSlug: string | null = null;
    let anchorOffset = 0;
    for (const el of cards) {
      const top = el.getBoundingClientRect().top;
      if (top >= 0) {
        anchorSlug = el.dataset.resultSlug ?? null;
        anchorOffset = top;
        break;
      }
      // Track last above-viewport card as fallback anchor (offset is negative).
      anchorSlug = el.dataset.resultSlug ?? anchorSlug;
      anchorOffset = top;
    }

    fn();

    const tryRestore = (): boolean => {
      if (anchorSlug) {
        const el = document.querySelector<HTMLElement>(
          `[data-result-slug="${CSS.escape(anchorSlug)}"]`,
        );
        if (el) {
          const top = el.getBoundingClientRect().top;
          window.scrollTo({ top: window.scrollY + top - anchorOffset, behavior: "auto" });
          return true;
        }
      }
      const remaining = Array.from(
        document.querySelectorAll<HTMLElement>("[data-result-slug]"),
      );
      if (remaining.length > 0) {
        const target = remaining.reduce((best, el) => {
          const y = el.getBoundingClientRect().top + window.scrollY;
          return Math.abs(y - fallbackY) < Math.abs(best.y - fallbackY)
            ? { el, y }
            : best;
        }, { el: remaining[0], y: remaining[0].getBoundingClientRect().top + window.scrollY });
        window.scrollTo({ top: target.y - anchorOffset, behavior: "auto" });
        return true;
      }
      return false;
    };

    // Hold the scroll at fallbackY across re-renders (incl. skeletons) and
    // keep retrying the anchor lookup for up to ~1s while data resolves.
    const deadline = performance.now() + 1000;
    const tick = () => {
      if (tryRestore()) return;
      // Keep page pinned to the pre-navigation Y so it never snaps to top.
      if (window.scrollY !== fallbackY) {
        window.scrollTo({ top: fallbackY, behavior: "auto" });
      }
      if (performance.now() < deadline) requestAnimationFrame(tick);
    };
    requestAnimationFrame(() => requestAnimationFrame(tick));
  };

  const resetFilters = () => {
    setDraft(DEFAULT_FILTERS);
    preserveScroll(() => commitFilters(DEFAULT_FILTERS));
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    preserveScroll(() => onSearchChange({ ...search, q: q || undefined }));
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
                onApply={() => commitFilters(draft)}
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
                  setDraft(f);
                  commitFilters(f);
                }}
                onResetAll={resetFilters}
              />
            </div>

            <div className="mb-6">
              <DiscoveryRails
                shops={rawShops}
                onApplyFilters={(f) => {
                  setDraft(f);
                  commitFilters(f);
                  scrollToResultsAfterFiltering();
                }}
                onSelectCategory={(cat) => {
                  const { category: _omit, ...rest } = search;
                  onSearchChange({ ...rest, category: cat });
                  scrollToResultsAfterFiltering();
                }}
              />
              <InstantBookingSection shops={filtered} />
            </div>

            {/* Results */}
            <div id="search-results" className="scroll-mt-24">

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
                    title="No matching beauty places found."
                    description="Try changing your filters or search another area."
                    ctaLabel="Reset Filters"
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
            </div>

          </main>
        </div>
      </div>

      <PublicFooter />

      <FilterBottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        draft={draft}
        onChange={setDraft}
        onApply={() => commitFilters(draft)}
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
    <div className="relative" data-result-slug={shop.slug}>
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
          <li key={s.slug} data-result-slug={s.slug}>
            <ShopCard shop={s} variant="list" />
          </li>
        ))}
      </ul>
    </div>
  );
}
