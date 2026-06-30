import { useMemo, useState, useCallback, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  MapPin,
  Star,
  Flame,
  Sparkles,
  Crown,
  BadgeCheck,
  Clock,
  Tag,
  Gem,
  Wand2,
  Megaphone,
  Navigation,
  Footprints,
  PartyPopper,
  Plus,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Gift,
  Heart,
  CalendarCheck,
  Users,
} from "lucide-react";
import {
  getMockBusinesses,
  mockBusinessToShop,
  type MockBusiness,
} from "@/lib/mock-businesses";
import type { Shop } from "@/components/shared/ShopCard";

/* ============================================================
 * NEXORA — DISCOVERY HOME
 * - Filterable by area + category (from HomePage)
 * - Real IST clock for Open Now (uses shop opening_hours when present)
 * - AI Picks personalization toggle + refresh
 * - Deep links to /search with area / category / sort / on params
 * ============================================================ */

/* ---------- TYPES ---------- */
export type Enriched = Shop & {
  joinedDaysAgo: number;
  isOpenNow: boolean;
  openHourStart: number;
  openHourEnd: number;
  etaMin: number;
  hasOffer: boolean;
  offerPct: number;
  membershipPerk: string | null;
  isSponsored: boolean;
  repeatRate: number;
  ownerActivity: number;
  verifiedReviews: number;
  trendingScore: number;
  recommendedScore: number;
  weeklyBookings: number;
  popularityScore: number;
  latestReviewDaysAgo: number;
  rewardRatePct: number;
  rewardUsagePct: number;
  savesCount: number;
  staffAvailable: number;
  staffTotal: number;
  slotsAvailable: number;
};

export type DiscoveryHomeProps = {
  selectedLocation?: string;
  selectedCategory?: string;
  /** Sentinels indicating "no filter". Match HomePage labels. */
  allAreasLabel?: string;
  allCategoriesLabel?: string;
};

type SearchDest = {
  area?: string;
  category?: string;
  sort?:
    | "relevance"
    | "rating"
    | "distance"
    | "price_low"
    | "price_high"
    | "popular";
  on?: 1;
  vo?: 1;
  tr?: 1;
  mp?: 1;
  oo?: 1;
};

type CardAccent = "primary" | "ai";

type CardProps = {
  s: Enriched;
  accent?: CardAccent;
  showDistance?: boolean;
  showEta?: boolean;
  showOpen?: boolean;
  showTrending?: boolean;
  showTopRated?: boolean;
  showNew?: boolean;
  showOffer?: boolean;
  showMembership?: boolean;
  showSponsored?: boolean;
};

type RailProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  items: Enriched[];
  render: (s: Enriched) => ReactNode;
  dest: SearchDest;
  rightSlot?: ReactNode;
};

type CategoryProps = {
  shops: Enriched[];
  dest: SearchDest;
};

const TRENDING_BADGE = "🔥 Trending";

/* ---------- IST TIME HELPERS ---------- */
function nowISTHour(): number {
  // IST = UTC + 5:30 → minutes-precise float hour.
  const d = new Date();
  const utcMin = d.getUTCHours() * 60 + d.getUTCMinutes();
  const istMin = (utcMin + 330) % (24 * 60);
  return istMin / 60;
}

function parseHourField(hours: unknown, fallback: number): number {
  if (typeof hours !== "string") return fallback;
  const m = hours.match(/(\d{1,2})/);
  if (!m) return fallback;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) ? n : fallback;
}

/* ---------- ENRICHMENT ---------- */
function enrich(b: MockBusiness, i: number, istHour: number): Enriched {
  const shop = mockBusinessToShop(b);

  // Real-ish hours: prefer business-provided opening hours when available.
  // MockBusiness has loose shape; read with guards.
  const raw = b as unknown as { opening_hours?: string; openTime?: string; closeTime?: string };
  const openStart = parseHourField(raw.openTime ?? raw.opening_hours, 9 + (i % 3));
  const openEnd = parseHourField(raw.closeTime, Math.min(23, openStart + 9 + (i % 3)));

  const isOpen = istHour >= openStart && istHour < openEnd;
  const joined = (i * 7 + b.reviewCount) % 240;
  const eta = Math.max(2, Math.round((shop.distance_km ?? 1) * 3 + (i % 4)));
  const hasOffer = i % 3 === 0;
  const offerPct = hasOffer ? 10 + (i % 5) * 5 : 0;
  const repeatRate = Math.min(1, 0.4 + ((b.reviewCount % 60) / 100));
  const ownerActivity = ((i * 13) % 100) / 100;
  const verifiedReviews = Math.round(b.reviewCount * (0.5 + ((i % 4) / 10)));
  const weeklyBookings = Math.round(
    20 + (b.reviewCount % 80) + (b.rating - 3) * 25 + (i % 11) * 3,
  );
  const popularityScore = Math.min(
    100,
    Math.round(
      weeklyBookings * 0.5 + b.rating * 8 + (b.isVerified ? 6 : 0) + repeatRate * 10,
    ),
  );
  const latestReviewDaysAgo = (i * 3) % 21;
  const trendingScore =
    weeklyBookings * 0.6 + (b.rating - 3) * 30 + (hasOffer ? 15 : 0) + ((i * 11) % 25);
  const recommendedScore =
    b.rating * 20 + (b.isVerified ? 10 : 0) + repeatRate * 25 + (hasOffer ? 8 : 0);

  return {
    ...shop,
    joinedDaysAgo: joined,
    isOpenNow: isOpen,
    openHourStart: openStart,
    openHourEnd: openEnd,
    etaMin: eta,
    hasOffer,
    offerPct,
    membershipPerk: i % 4 === 0 ? "10% off + free service for members" : null,
    isSponsored: i % 9 === 0,
    repeatRate,
    ownerActivity,
    verifiedReviews,
    trendingScore,
    recommendedScore,
    weeklyBookings,
    popularityScore,
    latestReviewDaysAgo,
  };
}

function useEnrichedShops(
  selectedLocation: string | undefined,
  selectedCategory: string | undefined,
  allAreasLabel: string,
  allCategoriesLabel: string,
): Enriched[] {
  return useMemo(() => {
    const istHour = nowISTHour();
    const all = getMockBusinesses().map((b, i) => enrich(b, i, istHour));
    return all.filter((s) => {
      if (selectedLocation && selectedLocation !== allAreasLabel) {
        if (s.area !== selectedLocation) return false;
      }
      if (selectedCategory && selectedCategory !== allCategoriesLabel) {
        if (s.category !== selectedCategory) return false;
      }
      return true;
    });
  }, [selectedLocation, selectedCategory, allAreasLabel, allCategoriesLabel]);
}

/* ============= TOP-LEVEL ============= */
export function DiscoveryHome({
  selectedLocation,
  selectedCategory,
  allAreasLabel = "All locations",
  allCategoriesLabel = "All categories",
}: DiscoveryHomeProps = {}) {
  const shops = useEnrichedShops(
    selectedLocation,
    selectedCategory,
    allAreasLabel,
    allCategoriesLabel,
  );

  // Base dest carries the user's active home filters into deep links.
  const baseDest: SearchDest = useMemo(() => {
    const d: SearchDest = {};
    if (selectedLocation && selectedLocation !== allAreasLabel) d.area = selectedLocation;
    if (selectedCategory && selectedCategory !== allCategoriesLabel) d.category = selectedCategory;
    return d;
  }, [selectedLocation, selectedCategory, allAreasLabel, allCategoriesLabel]);

  // AI Picks personalization state
  const [aiPersonalized, setAiPersonalized] = useState(true);
  const [aiSeed, setAiSeed] = useState(0);
  const refreshAi = useCallback(() => setAiSeed((n) => n + 1), []);

  if (shops.length === 0) {
    return (
      <div className="px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-[1400px] rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-slate-700">
            No shops match your current filters.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Try clearing the location or category to see Discovery results.
          </p>
        </div>
      </div>
    );
  }

  const aiSorted = useMemo(() => {
    const personalWeight = aiPersonalized ? 0.7 : 0.3;
    const trendingWeight = 1 - personalWeight;
    // aiSeed mixes the order without breaking determinism within one click.
    return [...shops].sort((a, b) => {
      const aScore =
        a.recommendedScore * personalWeight +
        a.trendingScore * trendingWeight +
        ((a.slug.charCodeAt(0) + aiSeed) % 17);
      const bScore =
        b.recommendedScore * personalWeight +
        b.trendingScore * trendingWeight +
        ((b.slug.charCodeAt(0) + aiSeed) % 17);
      return bScore - aScore;
    });
  }, [shops, aiPersonalized, aiSeed]);

  return (
    <div className="space-y-14 px-5 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-[1400px] space-y-14">
        <QuickJumpBar />

        <Rail
          title="Recommended For You"
          subtitle="Personalised picks based on your activity"
          icon={<Wand2 className="h-4 w-4" />}
          items={[...shops]
            .sort((a, b) => b.recommendedScore - a.recommendedScore)
            .slice(0, 10)}
          render={(s) => <Card s={s} accent="primary" />}
          dest={{ ...baseDest, sort: "popular" }}
        />

        <Rail
          title="Nearby Shops"
          subtitle="Closest verified businesses to you"
          icon={<MapPin className="h-4 w-4" />}
          items={[...shops]
            .sort((a, b) => (a.distance_km ?? 99) - (b.distance_km ?? 99))
            .slice(0, 10)}
          render={(s) => <Card s={s} showDistance showEta />}
          dest={{ ...baseDest, sort: "distance" }}
        />

        <Rail
          title="Trending Today"
          subtitle="Most booked in the last few hours"
          icon={<Flame className="h-4 w-4 text-orange-500" />}
          items={[...shops]
            .sort((a, b) => b.trendingScore - a.trendingScore)
            .slice(0, 10)}
          render={(s) => <Card s={s} showTrending />}
          dest={{ ...baseDest, sort: "popular", tr: 1 }}
        />

        <Rail
          title="Top Rated"
          subtitle="Verified excellence · min 4.5★"
          icon={<Crown className="h-4 w-4 text-amber-500" />}
          items={shops
            .filter((s) => s.rating >= 4.5)
            .sort((a, b) => topRatedScore(b) - topRatedScore(a))
            .slice(0, 10)}
          render={(s) => <Card s={s} showTopRated />}
          dest={{ ...baseDest, sort: "rating" }}
        />

        <Rail
          title="Newly Joined"
          subtitle="Fresh additions to Nexora"
          icon={<PartyPopper className="h-4 w-4 text-pink-500" />}
          items={[...shops]
            .filter((s) => s.joinedDaysAgo <= 30)
            .sort((a, b) => a.joinedDaysAgo - b.joinedDaysAgo)
            .slice(0, 10)}
          render={(s) => <Card s={s} showNew />}
          dest={{ ...baseDest, sort: "relevance" }}
        />

        <Rail
          title="Open Now"
          subtitle="Walk-in or book in minutes"
          icon={<Clock className="h-4 w-4 text-emerald-500" />}
          items={shops.filter((s) => s.isOpenNow).slice(0, 10)}
          render={(s) => <Card s={s} showEta showOpen />}
          dest={{ ...baseDest, on: 1, sort: "distance" }}
        />

        <Rail
          title="Offers Near You"
          subtitle="Limited-time deals from nearby shops"
          icon={<Tag className="h-4 w-4 text-rose-500" />}
          items={shops
            .filter((s) => s.hasOffer)
            .sort((a, b) => (a.distance_km ?? 99) - (b.distance_km ?? 99))
            .slice(0, 10)}
          render={(s) => <Card s={s} showOffer />}
          dest={{ ...baseDest, oo: 1, sort: "distance" }}
        />

        <Rail
          title="Membership Benefits"
          subtitle="Extra perks for Nexora Members"
          icon={<Gem className="h-4 w-4 text-indigo-500" />}
          items={shops.filter((s) => s.membershipPerk).slice(0, 10)}
          render={(s) => <Card s={s} showMembership />}
          dest={{ ...baseDest, mp: 1 }}
        />

        <Rail
          title="AI Picks"
          subtitle={
            aiPersonalized
              ? "Curated by Nexora AI for your profile"
              : "Curated by Nexora AI · trending mix"
          }
          icon={<Sparkles className="h-4 w-4 text-violet-500" />}
          items={aiSorted.slice(0, 10)}
          render={(s) => <Card s={s} accent="ai" />}
          dest={{ ...baseDest, sort: "popular" }}
          rightSlot={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAiPersonalized((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-violet-400 hover:text-violet-700"
                aria-pressed={aiPersonalized}
                title="Toggle personalization"
              >
                {aiPersonalized ? (
                  <ToggleRight className="h-3.5 w-3.5 text-violet-600" />
                ) : (
                  <ToggleLeft className="h-3.5 w-3.5" />
                )}
                Personalize
              </button>
              <button
                type="button"
                onClick={refreshAi}
                className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
                title="Refresh AI picks"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>
          }
        />

        <Rail
          title="Sponsored Picks"
          subtitle="Featured by partner brands"
          icon={<Megaphone className="h-4 w-4 text-blue-500" />}
          items={shops.filter((s) => s.isSponsored).slice(0, 10)}
          render={(s) => <Card s={s} showSponsored />}
          dest={{ ...baseDest }}
        />

        {/* ───────── Category deep dives ───────── */}
        <NearbyCategory shops={shops} dest={{ ...baseDest, sort: "distance" }} />
        <TopRatedCategory shops={shops} dest={{ ...baseDest, sort: "rating" }} />
        <TrendingCategory shops={shops} dest={{ ...baseDest, tr: 1, sort: "popular" }} />
        <NewShopsCategory shops={shops} dest={{ ...baseDest }} />
        <MostBookedCategory shops={shops} dest={{ ...baseDest, sort: "popular" }} />
        <MostReviewedCategory shops={shops} dest={{ ...baseDest, sort: "rating" }} />
      </div>
    </div>
  );
}

/* ===== TOP-RATED RANKING FORMULA =====
 * 40% rating · 30% verified reviews · 20% repeat · 10% owner activity */
function topRatedScore(s: Enriched): number {
  const ratingPct = (s.rating / 5) * 100;
  const reviewsPct = Math.min(100, (s.verifiedReviews / 500) * 100);
  const repeatPct = s.repeatRate * 100;
  const ownerPct = s.ownerActivity * 100;
  return ratingPct * 0.4 + reviewsPct * 0.3 + repeatPct * 0.2 + ownerPct * 0.1;
}

/* ============= JUMP BAR ============= */
function QuickJumpBar() {
  const chips = [
    { label: "Recommended", href: "#recommended-for-you" },
    { label: "Nearby", href: "#nearby-shops" },
    { label: "Trending", href: "#trending-today" },
    { label: "Top Rated", href: "#top-rated" },
    { label: "New Shops", href: "#newly-joined" },
    { label: "Open Now", href: "#open-now" },
    { label: "Offers", href: "#offers-near-you" },
    { label: "Membership", href: "#membership-benefits" },
    { label: "AI Picks", href: "#ai-picks" },
    { label: "Sponsored", href: "#sponsored-picks" },
  ];
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {chips.map((c) => (
        <a
          key={c.label}
          href={c.href}
          className="shrink-0 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
        >
          {c.label}
        </a>
      ))}
    </div>
  );
}

/* ============= RAIL ============= */
function Rail({ title, subtitle, icon, items, render, dest, rightSlot }: RailProps) {
  if (items.length === 0) return null;
  const anchor = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return (
    <section id={anchor} aria-label={title} className="scroll-mt-20">
      <header className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-900/5">
              {icon}
            </span>
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {rightSlot}
          <Link
            to="/search"
            search={dest}
            className="text-sm font-semibold text-slate-900 hover:underline"
          >
            See all →
          </Link>
        </div>
      </header>
      <div className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((s) => (
          <div key={s.slug} className="w-[260px] shrink-0 snap-start">
            {render(s)}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============= CARD ============= */
function Card({
  s,
  accent,
  showDistance,
  showEta,
  showOpen,
  showTrending,
  showTopRated,
  showNew,
  showOffer,
  showMembership,
  showSponsored,
}: CardProps) {
  const accentRing =
    accent === "ai"
      ? "ring-1 ring-violet-300"
      : accent === "primary"
        ? "ring-1 ring-blue-200"
        : "";
  const walkable = (s.distance_km ?? 9) <= 1.2;
  return (
    <Link
      to="/book/$slug"
      params={{ slug: s.slug }}
      className={`group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${accentRing}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {s.cover_image && (
          <img
            src={s.cover_image}
            alt={s.name}
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        )}
        <div className="absolute inset-x-0 top-0 flex flex-wrap gap-1 p-2">
          {showTrending && (
            <Pill icon={<Flame className="h-3 w-3" />} cls="bg-orange-500 text-white">
              {TRENDING_BADGE}
            </Pill>
          )}
          {showTopRated && (
            <Pill icon={<Crown className="h-3 w-3" />} cls="bg-amber-500 text-white">
              Top Rated
            </Pill>
          )}
          {showNew && (
            <Pill icon={<Plus className="h-3 w-3" />} cls="bg-pink-500 text-white">
              {s.joinedDaysAgo <= 7 ? "Grand Opening" : "New"}
            </Pill>
          )}
          {showOffer && (
            <Pill icon={<Tag className="h-3 w-3" />} cls="bg-rose-500 text-white">
              {s.offerPct}% OFF
            </Pill>
          )}
          {showMembership && (
            <Pill icon={<Gem className="h-3 w-3" />} cls="bg-indigo-500 text-white">
              Member Perk
            </Pill>
          )}
          {showSponsored && (
            <Pill icon={<Megaphone className="h-3 w-3" />} cls="bg-blue-500 text-white">
              Sponsored
            </Pill>
          )}
          {accent === "ai" && (
            <Pill icon={<Sparkles className="h-3 w-3" />} cls="bg-violet-500 text-white">
              AI
            </Pill>
          )}
        </div>
        <div className="absolute right-2 bottom-2 flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-xs font-bold text-slate-900 shadow">
          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
          {s.rating.toFixed(1)}
          <span className="font-medium text-slate-500">({s.review_count})</span>
        </div>
      </div>
      <div className="space-y-1.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-bold text-slate-900">{s.name}</h3>
          {s.is_verified && <BadgeCheck className="h-4 w-4 shrink-0 text-blue-500" />}
        </div>
        <p className="line-clamp-1 text-xs text-slate-500">
          {s.category} · {s.area}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-semibold">
          {showDistance && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
              <Navigation className="h-3 w-3" />
              {s.distance_km?.toFixed(1)} km
            </span>
          )}
          {showEta && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
              <Clock className="h-3 w-3" />
              {s.etaMin} min
            </span>
          )}
          {showOpen && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Open · till {s.openHourEnd}:00
            </span>
          )}
          {showDistance && walkable && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
              <Footprints className="h-3 w-3" />
              Walkable
            </span>
          )}
        </div>
        {typeof s.starting_price === "number" && s.starting_price > 0 && (
          <div className="pt-1 text-xs text-slate-500">
            From <span className="font-bold text-slate-900">₹{s.starting_price}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

function Pill({
  icon,
  cls,
  children,
}: {
  icon?: ReactNode;
  cls: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-sm ${cls}`}
    >
      {icon}
      {children}
    </span>
  );
}

/* ============= CATEGORY SHELL ============= */
function CategoryHeader({
  title,
  purpose,
  badges,
  dest,
}: {
  title: string;
  purpose: string;
  badges: string[];
  dest: SearchDest;
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-600">{purpose}</p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {badges.map((b) => (
          <span
            key={b}
            className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
          >
            {b}
          </span>
        ))}
        <Link
          to="/search"
          search={dest}
          className="ml-2 rounded-full border border-slate-300 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-900 hover:text-slate-900"
        >
          See all →
        </Link>
      </div>
    </div>
  );
}

function FormulaStrip({
  items,
}: {
  items: { pct: number; label: string }[];
}) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((i) => (
        <div
          key={i.label}
          className="rounded-xl bg-white p-3 text-center ring-1 ring-slate-200"
        >
          <div className="text-lg font-black text-amber-600">{i.pct}%</div>
          <div className="text-[11px] font-semibold text-slate-600">{i.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ============= CATEGORY: NEARBY ============= */
function NearbyCategory({ shops, dest }: CategoryProps) {
  const list = useMemo(
    () =>
      [...shops]
        .sort((a, b) => (a.distance_km ?? 99) - (b.distance_km ?? 99))
        .slice(0, 8),
    [shops],
  );
  if (list.length === 0) return null;
  return (
    <section id="cat-nearby" className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 sm:p-8">
      <CategoryHeader
        title="Nearby"
        purpose="Closest verified businesses · sorted by distance"
        badges={["Nearby", "Closest", "Walkable"]}
        dest={dest}
      />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((s) => (
          <Card key={s.slug} s={s} showDistance showEta showOpen={s.isOpenNow} />
        ))}
      </div>
    </section>
  );
}

/* ============= CATEGORY: TOP RATED ============= */
function TopRatedCategory({ shops, dest }: CategoryProps) {
  const list = useMemo(
    () =>
      shops
        .filter((s) => s.rating >= 4.5)
        .sort((a, b) => topRatedScore(b) - topRatedScore(a))
        .slice(0, 8),
    [shops],
  );
  if (list.length === 0) return null;
  return (
    <section
      id="cat-top-rated"
      className="rounded-3xl bg-gradient-to-br from-amber-50 via-white to-white p-6 ring-1 ring-amber-200 sm:p-8"
    >
      <CategoryHeader
        title="Top Rated"
        purpose="Minimum 4.5★ · weighted excellence"
        badges={["Top Rated"]}
        dest={dest}
      />
      <FormulaStrip
        items={[
          { pct: 40, label: "Customer Ratings" },
          { pct: 30, label: "Verified Reviews" },
          { pct: 20, label: "Repeat Customers" },
          { pct: 10, label: "Owner Activity" },
        ]}
      />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((s) => (
          <Card key={s.slug} s={s} showTopRated />
        ))}
      </div>
    </section>
  );
}

/* ============= CATEGORY: TRENDING ============= */
function TrendingCategory({ shops, dest }: CategoryProps) {
  const list = useMemo(
    () => [...shops].sort((a, b) => b.trendingScore - a.trendingScore).slice(0, 8),
    [shops],
  );
  if (list.length === 0) return null;
  return (
    <section
      id="cat-trending"
      className="rounded-3xl bg-gradient-to-br from-orange-50 via-white to-white p-6 ring-1 ring-orange-200 sm:p-8"
    >
      <CategoryHeader
        title="Trending"
        purpose="Hot right now · updated every hour"
        badges={[TRENDING_BADGE]}
        dest={dest}
      />
      <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-semibold text-slate-600">
        {["Bookings", "QR Payments", "Reviews", "Saves", "Views"].map((b) => (
          <span key={b} className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
            {b}
          </span>
        ))}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((s) => (
          <Card key={s.slug} s={s} showTrending />
        ))}
      </div>
    </section>
  );
}

/* ============= CATEGORY: NEW SHOPS ============= */
function NewShopsCategory({ shops, dest }: CategoryProps) {
  const list = useMemo(
    () =>
      shops
        .filter((s) => s.joinedDaysAgo <= 30)
        .sort((a, b) => a.joinedDaysAgo - b.joinedDaysAgo)
        .slice(0, 8),
    [shops],
  );
  if (list.length === 0) return null;
  return (
    <section
      id="cat-new-shops"
      className="rounded-3xl bg-gradient-to-br from-pink-50 via-white to-white p-6 ring-1 ring-pink-200 sm:p-8"
    >
      <CategoryHeader
        title="New Shops"
        purpose="Businesses added in the last 30 days"
        badges={["New", "Recently Joined", "Grand Opening"]}
        dest={dest}
      />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((s) => (
          <Card key={s.slug} s={s} showNew />
        ))}
      </div>
    </section>
  );
}

/* ============= CATEGORY: MOST BOOKED ============= */
function MostBookedCategory({ shops, dest }: CategoryProps) {
  const list = useMemo(
    () => [...shops].sort((a, b) => b.weeklyBookings - a.weeklyBookings).slice(0, 8),
    [shops],
  );
  if (list.length === 0) return null;
  const peak = list[0]?.weeklyBookings ?? 1;
  return (
    <section
      id="cat-most-booked"
      className="rounded-3xl bg-gradient-to-br from-blue-50 via-white to-white p-6 ring-1 ring-blue-200 sm:p-8"
    >
      <CategoryHeader
        title="Most Booked"
        purpose="Highest weekly bookings · sorted by demand"
        badges={["Most Booked", "Hot Demand"]}
        dest={dest}
      />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((s) => (
          <div key={s.slug} className="space-y-2">
            <Card s={s} />
            <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                <span>Bookings this week</span>
                <span className="text-slate-900">{s.weeklyBookings}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${Math.round((s.weeklyBookings / peak) * 100)}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                <span>Popularity score</span>
                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-blue-700">
                  {s.popularityScore}/100
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============= CATEGORY: MOST REVIEWED ============= */
function MostReviewedCategory({ shops, dest }: CategoryProps) {
  const list = useMemo(
    () =>
      [...shops]
        .filter((s) => s.verifiedReviews > 0)
        .sort((a, b) => b.verifiedReviews - a.verifiedReviews)
        .slice(0, 8),
    [shops],
  );
  if (list.length === 0) return null;
  return (
    <section
      id="cat-most-reviewed"
      className="rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-white p-6 ring-1 ring-emerald-200 sm:p-8"
    >
      <CategoryHeader
        title="Most Reviewed"
        purpose="Verified reviews only · social proof leaders"
        badges={["Verified Reviews", "Community Favourite"]}
        dest={dest}
      />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((s) => (
          <div key={s.slug} className="space-y-2">
            <Card s={s} />
            <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                <span>Verified reviews</span>
                <span className="inline-flex items-center gap-1 text-slate-900">
                  <BadgeCheck className="h-3 w-3 text-emerald-600" />
                  {s.verifiedReviews}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                <span>Latest review</span>
                <span className="text-slate-900">
                  {s.latestReviewDaysAgo === 0
                    ? "Today"
                    : `${s.latestReviewDaysAgo}d ago`}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
