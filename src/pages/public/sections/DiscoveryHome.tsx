import { useMemo, useState } from "react";
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
} from "lucide-react";
import {
  getMockBusinesses,
  mockBusinessToShop,
  type MockBusiness,
} from "@/lib/mock-businesses";
import type { Shop } from "@/components/shared/ShopCard";

/* ============================================================
 * NEXORA — DISCOVERY HOME
 * Spec sections:
 *   Default rails:
 *     1. Recommended For You    2. Nearby Shops
 *     3. Trending Today         4. Top Rated
 *     5. Newly Joined           6. Open Now
 *     7. Offers Near You        8. Membership Benefits
 *     9. AI Picks              10. Sponsored Picks
 *   Category deep-dives:
 *     A. Nearby (distance, ETA, open status, walkable)
 *     B. Top Rated (40/30/20/10 formula, min 4.5★)
 *     C. Trending (hourly, 🔥 badge)
 *     D. New Shops (≤ 30 days, "New" / "Grand Opening")
 * ============================================================ */

type Enriched = Shop & {
  joinedDaysAgo: number;
  isOpenNow: boolean;
  etaMin: number;
  hasOffer: boolean;
  offerPct: number;
  membershipPerk: string | null;
  isSponsored: boolean;
  repeatRate: number; // 0..1
  ownerActivity: number; // 0..1
  verifiedReviews: number;
  trendingScore: number;
  recommendedScore: number;
};

const TRENDING_BADGE = "🔥 Trending";

function enrich(b: MockBusiness, i: number): Enriched {
  const shop = mockBusinessToShop(b);
  const joined = (i * 7 + b.reviewCount) % 240; // 0..239 days
  const eta = Math.max(2, Math.round((shop.distance_km ?? 1) * 3 + (i % 4)));
  const hasOffer = i % 3 === 0;
  const isOpen = i % 5 !== 0;
  const offerPct = hasOffer ? 10 + (i % 5) * 5 : 0;
  const repeatRate = Math.min(1, 0.4 + ((b.reviewCount % 60) / 100));
  const ownerActivity = ((i * 13) % 100) / 100;
  const verifiedReviews = Math.round(b.reviewCount * (0.5 + ((i % 4) / 10)));
  const trendingScore =
    b.reviewCount * 0.4 +
    (b.rating - 3) * 30 +
    (hasOffer ? 15 : 0) +
    ((i * 11) % 25);
  const recommendedScore =
    b.rating * 20 +
    (b.isVerified ? 10 : 0) +
    repeatRate * 25 +
    (hasOffer ? 8 : 0);
  return {
    ...shop,
    joinedDaysAgo: joined,
    isOpenNow: isOpen,
    etaMin: eta,
    hasOffer,
    offerPct,
    membershipPerk:
      i % 4 === 0 ? "10% off + free service for members" : null,
    isSponsored: i % 9 === 0,
    repeatRate,
    ownerActivity,
    verifiedReviews,
    trendingScore,
    recommendedScore,
  };
}

function useEnrichedShops(): Enriched[] {
  return useMemo(() => getMockBusinesses().map(enrich), []);
}

/* ============= TOP-LEVEL ============= */
export function DiscoveryHome() {
  const shops = useEnrichedShops();
  return (
    <div className="space-y-14 px-5 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-[1400px] space-y-14">
        {/* Quick chips so the user can jump to a category section */}
        <QuickJumpBar />

        <Rail
          title="Recommended For You"
          subtitle="Personalised picks based on your activity"
          icon={<Wand2 className="h-4 w-4" />}
          items={[...shops]
            .sort((a, b) => b.recommendedScore - a.recommendedScore)
            .slice(0, 10)}
          render={(s) => <Card s={s} accent="primary" />}
        />

        <Rail
          title="Nearby Shops"
          subtitle="Closest verified businesses to you"
          icon={<MapPin className="h-4 w-4" />}
          items={[...shops]
            .sort((a, b) => (a.distance_km ?? 99) - (b.distance_km ?? 99))
            .slice(0, 10)}
          render={(s) => <Card s={s} showDistance showEta />}
        />

        <Rail
          title="Trending Today"
          subtitle="Most booked in the last few hours"
          icon={<Flame className="h-4 w-4 text-orange-500" />}
          items={[...shops]
            .sort((a, b) => b.trendingScore - a.trendingScore)
            .slice(0, 10)}
          render={(s) => <Card s={s} showTrending />}
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
        />

        <Rail
          title="Open Now"
          subtitle="Walk-in or book in minutes"
          icon={<Clock className="h-4 w-4 text-emerald-500" />}
          items={shops.filter((s) => s.isOpenNow).slice(0, 10)}
          render={(s) => <Card s={s} showEta showOpen />}
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
        />

        <Rail
          title="Membership Benefits"
          subtitle="Extra perks for Nexora Members"
          icon={<Gem className="h-4 w-4 text-indigo-500" />}
          items={shops.filter((s) => s.membershipPerk).slice(0, 10)}
          render={(s) => <Card s={s} showMembership />}
        />

        <Rail
          title="AI Picks"
          subtitle="Curated by Nexora AI for your profile"
          icon={<Sparkles className="h-4 w-4 text-violet-500" />}
          items={[...shops]
            .sort(
              (a, b) =>
                b.recommendedScore * 0.6 +
                b.trendingScore * 0.4 -
                (a.recommendedScore * 0.6 + a.trendingScore * 0.4),
            )
            .slice(0, 10)}
          render={(s) => <Card s={s} accent="ai" />}
        />

        <Rail
          title="Sponsored Picks"
          subtitle="Featured by partner brands"
          icon={<Megaphone className="h-4 w-4 text-blue-500" />}
          items={shops.filter((s) => s.isSponsored).slice(0, 10)}
          render={(s) => <Card s={s} showSponsored />}
        />

        {/* ───────── Category deep dives ───────── */}
        <NearbyCategory shops={shops} />
        <TopRatedCategory shops={shops} />
        <TrendingCategory shops={shops} />
        <NewShopsCategory shops={shops} />
      </div>
    </div>
  );
}

/* ===== TOP-RATED RANKING FORMULA =====
 * 40% rating · 30% verified reviews · 20% repeat · 10% owner activity */
function topRatedScore(s: Enriched) {
  const ratingPct = (s.rating / 5) * 100;
  const reviewsPct = Math.min(100, (s.verifiedReviews / 500) * 100);
  const repeatPct = s.repeatRate * 100;
  const ownerPct = s.ownerActivity * 100;
  return (
    ratingPct * 0.4 + reviewsPct * 0.3 + repeatPct * 0.2 + ownerPct * 0.1
  );
}

/* ============= JUMP BAR ============= */
function QuickJumpBar() {
  const chips = [
    { label: "Recommended", href: "#recommended-for-you" },
    { label: "Nearby", href: "#nearby" },
    { label: "Trending", href: "#trending" },
    { label: "Top Rated", href: "#top-rated" },
    { label: "New Shops", href: "#new-shops" },
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
function Rail({
  title,
  subtitle,
  icon,
  items,
  render,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  items: Enriched[];
  render: (s: Enriched) => React.ReactNode;
}) {
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
        <Link
          to="/search"
          className="shrink-0 text-sm font-semibold text-slate-900 hover:underline"
        >
          See all →
        </Link>
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
}: {
  s: Enriched;
  accent?: "primary" | "ai";
  showDistance?: boolean;
  showEta?: boolean;
  showOpen?: boolean;
  showTrending?: boolean;
  showTopRated?: boolean;
  showNew?: boolean;
  showOffer?: boolean;
  showMembership?: boolean;
  showSponsored?: boolean;
}) {
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
          {showTrending && <Pill icon={<Flame className="h-3 w-3" />} cls="bg-orange-500 text-white">{TRENDING_BADGE}</Pill>}
          {showTopRated && <Pill icon={<Crown className="h-3 w-3" />} cls="bg-amber-500 text-white">Top Rated</Pill>}
          {showNew && (
            <Pill icon={<Plus className="h-3 w-3" />} cls="bg-pink-500 text-white">
              {s.joinedDaysAgo <= 7 ? "Grand Opening" : "New"}
            </Pill>
          )}
          {showOffer && <Pill icon={<Tag className="h-3 w-3" />} cls="bg-rose-500 text-white">{s.offerPct}% OFF</Pill>}
          {showMembership && <Pill icon={<Gem className="h-3 w-3" />} cls="bg-indigo-500 text-white">Member Perk</Pill>}
          {showSponsored && <Pill icon={<Megaphone className="h-3 w-3" />} cls="bg-blue-500 text-white">Sponsored</Pill>}
          {accent === "ai" && <Pill icon={<Sparkles className="h-3 w-3" />} cls="bg-violet-500 text-white">AI</Pill>}
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
              Open
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
  icon?: React.ReactNode;
  cls: string;
  children: React.ReactNode;
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

/* ============= CATEGORY: NEARBY ============= */
function NearbyCategory({ shops }: { shops: Enriched[] }) {
  const list = useMemo(
    () =>
      [...shops]
        .sort((a, b) => (a.distance_km ?? 99) - (b.distance_km ?? 99))
        .slice(0, 8),
    [shops],
  );
  return (
    <section id="cat-nearby" className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 sm:p-8">
      <CategoryHeader
        title="Nearby"
        purpose="Closest verified businesses · sorted by distance"
        badges={["Nearby", "Closest", "Walkable"]}
      />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((s, i) => (
          <Card
            key={s.slug}
            s={s}
            showDistance
            showEta
            showOpen={s.isOpenNow}
          />
        ))}
      </div>
    </section>
  );
}

/* ============= CATEGORY: TOP RATED ============= */
function TopRatedCategory({ shops }: { shops: Enriched[] }) {
  const list = useMemo(
    () =>
      shops
        .filter((s) => s.rating >= 4.5)
        .sort((a, b) => topRatedScore(b) - topRatedScore(a))
        .slice(0, 8),
    [shops],
  );
  return (
    <section id="cat-top-rated" className="rounded-3xl bg-gradient-to-br from-amber-50 via-white to-white p-6 ring-1 ring-amber-200 sm:p-8">
      <CategoryHeader
        title="Top Rated"
        purpose="Minimum 4.5★ · weighted excellence"
        badges={["Top Rated"]}
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
function TrendingCategory({ shops }: { shops: Enriched[] }) {
  const list = useMemo(
    () => [...shops].sort((a, b) => b.trendingScore - a.trendingScore).slice(0, 8),
    [shops],
  );
  return (
    <section id="cat-trending" className="rounded-3xl bg-gradient-to-br from-orange-50 via-white to-white p-6 ring-1 ring-orange-200 sm:p-8">
      <CategoryHeader
        title="Trending"
        purpose="Hot right now · updated every hour"
        badges={[TRENDING_BADGE]}
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
function NewShopsCategory({ shops }: { shops: Enriched[] }) {
  const list = useMemo(
    () =>
      shops
        .filter((s) => s.joinedDaysAgo <= 30)
        .sort((a, b) => a.joinedDaysAgo - b.joinedDaysAgo)
        .slice(0, 8),
    [shops],
  );
  return (
    <section id="cat-new-shops" className="rounded-3xl bg-gradient-to-br from-pink-50 via-white to-white p-6 ring-1 ring-pink-200 sm:p-8">
      <CategoryHeader
        title="New Shops"
        purpose="Businesses added in the last 30 days"
        badges={["New", "Recently Joined", "Grand Opening"]}
      />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((s) => (
          <Card key={s.slug} s={s} showNew />
        ))}
      </div>
    </section>
  );
}

/* ============= CATEGORY SHELL ============= */
function CategoryHeader({
  title,
  purpose,
  badges,
}: {
  title: string;
  purpose: string;
  badges: string[];
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-600">{purpose}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {badges.map((b) => (
          <span
            key={b}
            className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
          >
            {b}
          </span>
        ))}
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
