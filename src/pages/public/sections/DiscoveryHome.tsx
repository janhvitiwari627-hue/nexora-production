import { useMemo, useState, useCallback, useEffect, type ReactNode } from "react";
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
  Diamond,
  Wallet,
  Baby,
  UserRound,
  User,
  Home,
  Award,
  Scissors,
  Snowflake,
  Sun,
  CloudRain,
  Brush,
  PaintBucket,
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
  isLuxury: boolean;
  priceTier: "budget" | "mid" | "premium" | "luxury";
  suitableFor: { kids: boolean; women: boolean; men: boolean; seniors: boolean; family: boolean };
  genderFocus: "female" | "male" | "unisex";
  isHomeService: boolean;
  travelChargeINR: number;
  arrivalMin: number;
  serviceAreas: string[];
  membershipTier: "silver" | "gold" | "platinum" | "vip" | null;
  aiMatchPct: number;
  staffPickSpecialty: "Hair" | "Spa" | "Tattoo" | "Makeup" | "Nails" | null;
  seasonTag: "Wedding" | "Festival" | "Summer" | "Winter" | "Monsoon" | "Holiday";
  festivalTags: FestivalTag[];
  isCoupleFriendly: boolean;
  couplePackagePriceINR: number;
  partnerDiscountPct: number;
  isStudentSpecial: boolean;
  studentDiscountPct: number;
  isOfficeBreak: boolean;
  expressMins: number;
  isBridal: boolean;
  bridalPackagePriceINR: number;
  isTattoo: boolean;
  tattooArtist: string | null;
  tattooType: "Minimal" | "Premium" | "Cover Up" | "Removal" | null;
  isNailStudio: boolean;
  nailService: "Gel" | "Acrylic" | "Extensions" | "Luxury Art" | null;
  isWellness: boolean;
  wellnessFocus: "Spa" | "Massage" | "Therapy" | "Relaxation" | "Ayurveda" | null;
  isKidsCollection: boolean;
  isSeniorFriendly: boolean;
  wheelchairAccessible: boolean;
};

export type FestivalTag =
  | "Diwali"
  | "Holi"
  | "Karwa Chauth"
  | "Eid"
  | "Christmas"
  | "New Year"
  | "Raksha Bandhan";

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
function enrich(b: MockBusiness, i: number, istHour: number, liveTick: number): Enriched {
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
  const rewardRatePct = 2 + ((i * 7) % 13); // 2–14%
  const rewardUsagePct = 30 + ((i * 17 + b.reviewCount) % 65); // 30–94%
  const savesCount = Math.round(40 + b.rating * 30 + (b.reviewCount % 200) + (i % 9) * 12);
  const staffTotal = 3 + (i % 6); // 3–8
  // Live tick perturbs staff/slots so the UI feels real-time.
  const staffJitter = (i * 5 + liveTick * 3) % staffTotal;
  const staffAvailable = isOpen ? Math.max(0, staffTotal - staffJitter) : 0;
  const slotsBase = 8 - (i % 7);
  const slotJitter = (i * 11 + liveTick * 7) % 6;
  const slotsAvailable = isOpen ? Math.max(0, slotsBase - slotJitter + ((liveTick + i) % 3)) : 0;

  // Luxury / pricing tiers — derived deterministically.
  const priceFromShop = typeof shop.starting_price === "number" ? shop.starting_price : 0;
  const startingPrice = priceFromShop > 0 ? priceFromShop : 150 + ((i * 53) % 1400);
  const isLuxury = b.rating >= 4.6 && startingPrice >= 800 && b.isVerified;
  const priceTier: Enriched["priceTier"] =
    startingPrice < 200 ? "budget"
    : startingPrice < 600 ? "mid"
    : startingPrice < 1200 ? "premium"
    : "luxury";

  // Suitability + gender focus inferred from category + index spread.
  const cat = (b.category || "").toLowerCase();
  const isBarber = cat.includes("barber") || cat.includes("men");
  const isLadies = cat.includes("ladies") || cat.includes("women") || cat.includes("beauty parlour");
  const isSpa = cat.includes("spa") || cat.includes("massage");
  const genderFocus: Enriched["genderFocus"] = isBarber
    ? "male"
    : isLadies
      ? "female"
      : "unisex";
  const suitableFor = {
    kids: i % 5 === 0 || cat.includes("salon"),
    women: genderFocus !== "male",
    men: genderFocus !== "female",
    seniors: i % 4 === 0,
    family: i % 3 === 0 && !isBarber && !isLadies,
  };

  const isHomeService = i % 6 === 0;
  const travelChargeINR = isHomeService ? 50 + (i % 4) * 50 : 0;
  const arrivalMin = isHomeService ? 30 + (i % 5) * 15 : 0;
  const allAreas = ["Vaishali Nagar", "Malviya Nagar", "C-Scheme", "Mansarovar", "Raja Park", "Jagatpura"];
  const serviceAreas = isHomeService ? allAreas.slice(0, 2 + (i % 4)) : [];

  const tiers: Enriched["membershipTier"][] = [null, "silver", "gold", "platinum", "vip"];
  const membershipTier = tiers[i % tiers.length];

  const aiMatchPct = 60 + ((i * 19 + Math.round(b.rating * 10)) % 40);

  const specialties: Enriched["staffPickSpecialty"][] = ["Hair", "Spa", "Tattoo", "Makeup", "Nails"];
  const staffPickSpecialty = i % 2 === 0 ? specialties[i % specialties.length] : null;

  const seasons: Enriched["seasonTag"][] = ["Wedding", "Festival", "Summer", "Winter", "Monsoon", "Holiday"];
  const seasonTag = seasons[i % seasons.length];

  const allFestivals: FestivalTag[] = [
    "Diwali", "Holi", "Karwa Chauth", "Eid", "Christmas", "New Year", "Raksha Bandhan",
  ];
  const festivalTags: FestivalTag[] = [
    allFestivals[i % allFestivals.length],
    allFestivals[(i * 3 + 2) % allFestivals.length],
  ].filter((v, idx, arr) => arr.indexOf(v) === idx);

  const isCoupleFriendly = i % 4 === 0 || isSpa;
  const couplePackagePriceINR = isCoupleFriendly ? 1499 + ((i * 113) % 2500) : 0;
  const partnerDiscountPct = isCoupleFriendly ? 10 + ((i * 7) % 21) : 0;

  const isStudentSpecial = i % 5 === 0;
  const studentDiscountPct = isStudentSpecial ? 10 + ((i * 11) % 26) : 0;

  const isOfficeBreak = i % 4 === 1;
  const expressMins = [15, 20, 30, 45][i % 4];

  const isBridal = (isLadies || cat.includes("makeup") || cat.includes("beauty")) && i % 3 === 0;
  const bridalPackagePriceINR = isBridal ? 4999 + ((i * 313) % 25000) : 0;

  const isTattoo = cat.includes("tattoo") || i % 11 === 0;
  const tattooTypes: Enriched["tattooType"][] = ["Minimal", "Premium", "Cover Up", "Removal"];
  const tattooType = isTattoo ? tattooTypes[i % tattooTypes.length] : null;
  const artistNames = ["Aarav Ink", "Riya Studio", "Vikram Tattoo", "Neha Art", "Karan Pro"];
  const tattooArtist = isTattoo ? artistNames[i % artistNames.length] : null;

  const isNailStudio = cat.includes("nail") || i % 9 === 0;
  const nailServices: Enriched["nailService"][] = ["Gel", "Acrylic", "Extensions", "Luxury Art"];
  const nailService = isNailStudio ? nailServices[i % nailServices.length] : null;

  const isWellness = isSpa || cat.includes("wellness") || cat.includes("ayurved") || i % 7 === 0;
  const wellnessFoci: Enriched["wellnessFocus"][] = ["Spa", "Massage", "Therapy", "Relaxation", "Ayurveda"];
  const wellnessFocus = isWellness ? wellnessFoci[i % wellnessFoci.length] : null;

  const isKidsCollection = suitableFor.kids && (cat.includes("salon") || i % 5 === 0);
  const isSeniorFriendly = suitableFor.seniors || i % 6 === 0;
  const wheelchairAccessible = isSeniorFriendly && i % 2 === 0;


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
    rewardRatePct,
    rewardUsagePct,
    savesCount,
    staffAvailable,
    staffTotal,
    slotsAvailable,
    starting_price: startingPrice,
    isLuxury,
    priceTier,
    suitableFor,
    genderFocus,
    isHomeService,
    travelChargeINR,
    arrivalMin,
    serviceAreas,
    membershipTier,
    aiMatchPct,
    staffPickSpecialty,
    seasonTag,
  };
}

function useEnrichedShops(
  selectedLocation: string | undefined,
  selectedCategory: string | undefined,
  allAreasLabel: string,
  allCategoriesLabel: string,
  liveTick: number,
): Enriched[] {
  return useMemo(() => {
    const istHour = nowISTHour();
    const all = getMockBusinesses().map((b, i) => enrich(b, i, istHour, liveTick));
    return all.filter((s) => {
      if (selectedLocation && selectedLocation !== allAreasLabel) {
        if (s.area !== selectedLocation) return false;
      }
      if (selectedCategory && selectedCategory !== allCategoriesLabel) {
        if (s.category !== selectedCategory) return false;
      }
      return true;
    });
  }, [selectedLocation, selectedCategory, allAreasLabel, allCategoriesLabel, liveTick]);
}

/* ============= TOP-LEVEL ============= */
export function DiscoveryHome({
  selectedLocation,
  selectedCategory,
  allAreasLabel = "All locations",
  allCategoriesLabel = "All categories",
}: DiscoveryHomeProps = {}) {
  // Live tick — refreshes Open Now staff/slot availability every 20s while page is visible.
  const [liveTick, setLiveTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        setLiveTick((t) => t + 1);
      }
    }, 20_000);
    const onVis = () => {
      if (document.visibilityState === "visible") setLiveTick((t) => t + 1);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const shops = useEnrichedShops(
    selectedLocation,
    selectedCategory,
    allAreasLabel,
    allCategoriesLabel,
    liveTick,
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
        <MostRewardedCategory shops={shops} dest={{ ...baseDest }} />
        <MostSavedCategory shops={shops} dest={{ ...baseDest }} />
        <OpenNowCategory shops={shops} dest={{ ...baseDest, on: 1, sort: "distance" }} liveTick={liveTick} />
        <LuxuryCategory shops={shops} dest={{ ...baseDest }} />
        <BudgetFriendlyCategory shops={shops} dest={{ ...baseDest, sort: "price_low" }} />
        <FamilyFriendlyCategory shops={shops} dest={{ ...baseDest }} />
        <WomenOnlyCategory shops={shops} dest={{ ...baseDest }} />
        <MenOnlyCategory shops={shops} dest={{ ...baseDest }} />
        <UnisexCategory shops={shops} dest={{ ...baseDest }} />
        <HomeServiceCategory shops={shops} dest={{ ...baseDest }} />
        <PremiumMembersCategory shops={shops} dest={{ ...baseDest }} />
        <AIRecommendedCategory shops={shops} dest={{ ...baseDest, sort: "popular" }} />
        <StaffPicksCategory shops={shops} dest={{ ...baseDest }} />
        <SeasonalPicksCategory shops={shops} dest={{ ...baseDest }} />
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

/* ============= CATEGORY: MOST REWARDED ============= */
type RewardSort = "rate" | "usage";
function MostRewardedCategory({ shops, dest }: CategoryProps) {
  const [sort, setSort] = useState<RewardSort>("rate");
  const list = useMemo(
    () =>
      [...shops]
        .sort((a, b) =>
          sort === "rate"
            ? b.rewardRatePct - a.rewardRatePct
            : b.rewardUsagePct - a.rewardUsagePct,
        )
        .slice(0, 8),
    [shops, sort],
  );
  if (list.length === 0) return null;
  return (
    <section
      id="cat-most-rewarded"
      className="rounded-3xl bg-gradient-to-br from-yellow-50 via-white to-white p-6 ring-1 ring-yellow-200 sm:p-8"
    >
      <CategoryHeader
        title="Most Rewarded"
        purpose="Businesses where customers earn maximum rewards"
        badges={["Max Rewards", "Cashback"]}
        dest={dest}
      />
      <div className="mt-3 inline-flex rounded-full bg-white p-1 ring-1 ring-slate-200">
        {([
          { id: "rate", label: "Highest Reward Rate" },
          { id: "usage", label: "Highest Reward Usage" },
        ] as { id: RewardSort; label: string }[]).map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setSort(o.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              sort === o.id ? "bg-amber-500 text-white" : "text-slate-700 hover:text-slate-900"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((s) => (
          <div key={s.slug} className="space-y-2">
            <Card s={s} />
            <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <Gift className="h-3 w-3 text-amber-600" /> Reward rate
                </span>
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-700">
                  {s.rewardRatePct}%
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                <span>Usage</span>
                <span className="text-slate-900">{s.rewardUsagePct}%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${s.rewardUsagePct}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============= CATEGORY: MOST SAVED ============= */
function MostSavedCategory({ shops, dest }: CategoryProps) {
  const list = useMemo(
    () => [...shops].sort((a, b) => b.savesCount - a.savesCount).slice(0, 8),
    [shops],
  );
  if (list.length === 0) return null;
  return (
    <section
      id="cat-most-saved"
      className="rounded-3xl bg-gradient-to-br from-rose-50 via-white to-white p-6 ring-1 ring-rose-200 sm:p-8"
    >
      <CategoryHeader
        title="Most Saved"
        purpose="Businesses most added to Favorites"
        badges={["Customer Favorite"]}
        dest={dest}
      />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((s) => (
          <div key={s.slug} className="space-y-2">
            <Card s={s} />
            <div className="flex items-center justify-between rounded-xl bg-white p-3 text-[11px] font-semibold ring-1 ring-slate-200">
              <span className="inline-flex items-center gap-1 text-rose-600">
                <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />
                Customer Favorite
              </span>
              <span className="text-slate-900">{s.savesCount.toLocaleString()} saves</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============= CATEGORY: OPEN NOW ============= */
function OpenNowCategory({ shops, dest, liveTick }: CategoryProps & { liveTick: number }) {
  const list = useMemo(
    () =>
      shops
        .filter((s) => s.isOpenNow && s.staffAvailable > 0 && s.slotsAvailable > 0)
        .sort((a, b) => b.slotsAvailable - a.slotsAvailable)
        .slice(0, 8),
    [shops],
  );
  if (list.length === 0) return null;
  return (
    <section
      id="cat-open-now"
      className="rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-white p-6 ring-1 ring-emerald-200 sm:p-8"
    >
      <CategoryHeader
        title="Open Now"
        purpose="Business open · Staff available · Booking slots available"
        badges={["Live Status", "Open Now"]}
        dest={dest}
      />
      <LiveStatusBadge tick={liveTick} />

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((s) => (
          <div key={s.slug} className="space-y-2">
            <Card s={s} showEta showOpen />
            <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3 w-3 text-emerald-600" /> Staff
                </span>
                <span className="text-slate-900">
                  {s.staffAvailable}/{s.staffTotal} available
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <CalendarCheck className="h-3 w-3 text-emerald-600" /> Slots
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-700">
                  {s.slotsAvailable} open today
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- LIVE STATUS BADGE ---------- */
function LiveStatusBadge({ tick }: { tick: number }) {
  const [updatedAt, setUpdatedAt] = useState(() => Date.now());
  const [, setNow] = useState(Date.now());
  useEffect(() => {
    setUpdatedAt(Date.now());
  }, [tick]);
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const seconds = Math.max(0, Math.floor((Date.now() - updatedAt) / 1000));
  const label =
    seconds < 5 ? "just now" : seconds < 60 ? `${seconds}s ago` : `${Math.floor(seconds / 60)}m ago`;
  return (
    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-700">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      Live availability · updated {label}
    </div>
  );
}

/* ============= CATEGORY: LUXURY ============= */
function LuxuryCategory({ shops, dest }: CategoryProps) {
  const list = useMemo(
    () =>
      shops
        .filter((s) => s.isLuxury || s.priceTier === "luxury")
        .sort((a, b) => (b.starting_price ?? 0) - (a.starting_price ?? 0))
        .slice(0, 8),
    [shops],
  );
  if (list.length === 0) return null;
  return (
    <section
      id="cat-luxury"
      className="rounded-3xl bg-gradient-to-br from-violet-50 via-white to-amber-50 p-6 ring-1 ring-violet-200 sm:p-8"
    >
      <CategoryHeader
        title="Luxury"
        purpose="Premium beauty experience · verified brands · VIP services"
        badges={["Luxury", "Premium", "VIP"]}
        dest={dest}
      />
      <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-semibold text-slate-600">
        {["Premium Interior", "Verified Brand", "Luxury Pricing", "Premium Staff", "VIP Services"].map((b) => (
          <span key={b} className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 ring-1 ring-violet-200">
            <Diamond className="h-3 w-3 text-violet-600" />
            {b}
          </span>
        ))}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((s) => (
          <div key={s.slug} className="space-y-2">
            <Card s={s} />
            <div className="flex items-center justify-between rounded-xl bg-white p-3 text-[11px] font-semibold ring-1 ring-violet-200">
              <span className="inline-flex items-center gap-1 text-violet-700">
                <Crown className="h-3 w-3" />
                Luxury Badge
              </span>
              <span className="text-slate-900">From ₹{s.starting_price}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============= CATEGORY: BUDGET FRIENDLY ============= */
type PriceCap = 199 | 399 | 599;
function BudgetFriendlyCategory({ shops, dest }: CategoryProps) {
  const [cap, setCap] = useState<PriceCap>(399);
  const list = useMemo(
    () =>
      [...shops]
        .filter((s) => (s.starting_price ?? 9999) <= cap)
        .sort((a, b) => (a.starting_price ?? 0) - (b.starting_price ?? 0))
        .slice(0, 8),
    [shops, cap],
  );
  return (
    <section
      id="cat-budget"
      className="rounded-3xl bg-gradient-to-br from-lime-50 via-white to-white p-6 ring-1 ring-lime-200 sm:p-8"
    >
      <CategoryHeader
        title="Budget Friendly"
        purpose="Best value · lowest prices in your area"
        badges={["Best Value", "Lowest Price"]}
        dest={dest}
      />
      <div className="mt-3 inline-flex rounded-full bg-white p-1 ring-1 ring-slate-200">
        {([199, 399, 599] as PriceCap[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCap(c)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              cap === c ? "bg-lime-600 text-white" : "text-slate-700 hover:text-slate-900"
            }`}
          >
            Under ₹{c}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500">No shops under ₹{cap}. Try a higher cap.</p>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((s) => (
            <div key={s.slug} className="space-y-2">
              <Card s={s} />
              <div className="flex items-center justify-between rounded-xl bg-white p-3 text-[11px] font-semibold ring-1 ring-lime-200">
                <span className="inline-flex items-center gap-1 text-lime-700">
                  <Wallet className="h-3 w-3" />
                  Best Value
                </span>
                <span className="text-slate-900">From ₹{s.starting_price}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ============= CATEGORY: FAMILY FRIENDLY ============= */
function FamilyFriendlyCategory({ shops, dest }: CategoryProps) {
  const list = useMemo(
    () => shops.filter((s) => s.suitableFor.family).slice(0, 8),
    [shops],
  );
  if (list.length === 0) return null;
  return (
    <section
      id="cat-family"
      className="rounded-3xl bg-gradient-to-br from-sky-50 via-white to-white p-6 ring-1 ring-sky-200 sm:p-8"
    >
      <CategoryHeader
        title="Family Friendly"
        purpose="Suitable for kids, women, men and senior citizens"
        badges={["Family Packages"]}
        dest={dest}
      />
      <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-semibold text-slate-600">
        {[
          { l: "Kids", I: Baby },
          { l: "Women", I: UserRound },
          { l: "Men", I: User },
          { l: "Seniors", I: Users },
        ].map(({ l, I }) => (
          <span key={l} className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 ring-1 ring-sky-200">
            <I className="h-3 w-3 text-sky-600" />
            {l}
          </span>
        ))}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((s) => (
          <div key={s.slug} className="space-y-2">
            <Card s={s} />
            <div className="flex flex-wrap gap-1 rounded-xl bg-white p-3 text-[10px] font-semibold ring-1 ring-sky-200">
              {s.suitableFor.kids && <span className="rounded-full bg-sky-50 px-2 py-0.5 text-sky-700">Kids</span>}
              {s.suitableFor.women && <span className="rounded-full bg-sky-50 px-2 py-0.5 text-sky-700">Women</span>}
              {s.suitableFor.men && <span className="rounded-full bg-sky-50 px-2 py-0.5 text-sky-700">Men</span>}
              {s.suitableFor.seniors && <span className="rounded-full bg-sky-50 px-2 py-0.5 text-sky-700">Seniors</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============= CATEGORY: WOMEN ONLY ============= */
function WomenOnlyCategory({ shops, dest }: CategoryProps) {
  const list = useMemo(
    () => shops.filter((s) => s.genderFocus === "female").slice(0, 8),
    [shops],
  );
  if (list.length === 0) return null;
  return (
    <section
      id="cat-women-only"
      className="rounded-3xl bg-gradient-to-br from-pink-50 via-white to-white p-6 ring-1 ring-pink-200 sm:p-8"
    >
      <CategoryHeader
        title="Women Only"
        purpose="Only female staff · ladies salons · women spas & beauty parlours"
        badges={["Women Only", "Female Staff"]}
        dest={dest}
      />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((s) => (
          <Card key={s.slug} s={s} />
        ))}
      </div>
    </section>
  );
}

/* ============= CATEGORY: MEN ONLY ============= */
function MenOnlyCategory({ shops, dest }: CategoryProps) {
  const list = useMemo(
    () => shops.filter((s) => s.genderFocus === "male").slice(0, 8),
    [shops],
  );
  if (list.length === 0) return null;
  return (
    <section
      id="cat-men-only"
      className="rounded-3xl bg-gradient-to-br from-slate-100 via-white to-white p-6 ring-1 ring-slate-300 sm:p-8"
    >
      <CategoryHeader
        title="Men Only"
        purpose="Barber shops · men's spa · grooming & salons"
        badges={["Men Only", "Grooming"]}
        dest={dest}
      />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((s) => (
          <Card key={s.slug} s={s} />
        ))}
      </div>
    </section>
  );
}

/* ============= CATEGORY: UNISEX ============= */
function UnisexCategory({ shops, dest }: CategoryProps) {
  const list = useMemo(
    () => shops.filter((s) => s.genderFocus === "unisex").slice(0, 8),
    [shops],
  );
  if (list.length === 0) return null;
  return (
    <section
      id="cat-unisex"
      className="rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-white p-6 ring-1 ring-indigo-200 sm:p-8"
    >
      <CategoryHeader
        title="Unisex"
        purpose="Suitable for men, women, family and couples"
        badges={["Unisex", "Couples"]}
        dest={dest}
      />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((s) => (
          <Card key={s.slug} s={s} />
        ))}
      </div>
    </section>
  );
}

/* ============= CATEGORY: HOME SERVICE ============= */
function HomeServiceCategory({ shops, dest }: CategoryProps) {
  const list = useMemo(
    () =>
      shops
        .filter((s) => s.isHomeService)
        .sort((a, b) => a.arrivalMin - b.arrivalMin)
        .slice(0, 8),
    [shops],
  );
  if (list.length === 0) return null;
  return (
    <section
      id="cat-home-service"
      className="rounded-3xl bg-gradient-to-br from-teal-50 via-white to-white p-6 ring-1 ring-teal-200 sm:p-8"
    >
      <CategoryHeader
        title="Home Service"
        purpose="Professional visits your location · book a slot at home"
        badges={["Home Visit", "At Your Door"]}
        dest={dest}
      />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((s) => (
          <div key={s.slug} className="space-y-2">
            <Card s={s} />
            <div className="space-y-1.5 rounded-xl bg-white p-3 text-[11px] font-semibold ring-1 ring-teal-200">
              <div className="flex items-center justify-between text-slate-600">
                <span className="inline-flex items-center gap-1"><Home className="h-3 w-3 text-teal-600" /> Travel</span>
                <span className="text-slate-900">₹{s.travelChargeINR}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3 text-teal-600" /> Arrival</span>
                <span className="text-slate-900">~{s.arrivalMin} min</span>
              </div>
              <div className="text-[10px] text-slate-500">Areas: {s.serviceAreas.join(", ")}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============= CATEGORY: PREMIUM MEMBERS CHOICE ============= */
type MTier = "silver" | "gold" | "platinum" | "vip";
function PremiumMembersCategory({ shops, dest }: CategoryProps) {
  const [tier, setTier] = useState<MTier>("gold");
  const rank: Record<MTier, number> = { silver: 1, gold: 2, platinum: 3, vip: 4 };
  const list = useMemo(
    () =>
      shops
        .filter((s) => s.membershipTier && rank[s.membershipTier] >= rank[tier])
        .slice(0, 8),
    [shops, tier],
  );
  return (
    <section
      id="cat-members-choice"
      className="rounded-3xl bg-gradient-to-br from-amber-50 via-white to-violet-50 p-6 ring-1 ring-amber-200 sm:p-8"
    >
      <CategoryHeader
        title="Premium Members Choice"
        purpose="Visible to members · based on membership usage & exclusive benefits"
        badges={["Members Only", "Exclusive"]}
        dest={dest}
      />
      <div className="mt-3 inline-flex rounded-full bg-white p-1 ring-1 ring-slate-200">
        {(["silver", "gold", "platinum", "vip"] as MTier[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTier(t)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
              tier === t ? "bg-slate-900 text-white" : "text-slate-700 hover:text-slate-900"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500">No {tier}+ exclusives in this filter.</p>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((s) => (
            <div key={s.slug} className="space-y-2">
              <Card s={s} />
              <div className="flex items-center justify-between rounded-xl bg-white p-3 text-[11px] font-semibold ring-1 ring-amber-200">
                <span className="inline-flex items-center gap-1 text-amber-700">
                  <Gem className="h-3 w-3" />
                  {s.membershipTier?.toUpperCase()}
                </span>
                <span className="text-slate-900">Exclusive benefits</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ============= CATEGORY: AI RECOMMENDED ============= */
function AIRecommendedCategory({ shops, dest }: CategoryProps) {
  const list = useMemo(
    () => [...shops].sort((a, b) => b.aiMatchPct - a.aiMatchPct).slice(0, 8),
    [shops],
  );
  if (list.length === 0) return null;
  return (
    <section
      id="cat-ai-recommended"
      className="rounded-3xl bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-6 ring-1 ring-violet-200 sm:p-8"
    >
      <CategoryHeader
        title="AI Recommended"
        purpose="AI analyzes bookings, favorites, location, budget & reward usage"
        badges={["AI Match", "Personalised"]}
        dest={dest}
      />
      <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-semibold text-slate-600">
        {["Previous Bookings", "Favorite Services", "Location", "Budget", "Preferred Staff", "Visit Frequency", "Reward Usage", "Membership"].map((b) => (
          <span key={b} className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 ring-1 ring-violet-200">
            <Sparkles className="h-3 w-3 text-violet-600" />
            {b}
          </span>
        ))}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((s) => (
          <div key={s.slug} className="space-y-2">
            <Card s={s} accent="ai" />
            <div className="rounded-xl bg-white p-3 ring-1 ring-violet-200">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                <span>AI match</span>
                <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-violet-700">{s.aiMatchPct}%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-violet-500" style={{ width: `${s.aiMatchPct}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============= CATEGORY: STAFF PICKS ============= */
type Specialty = "Hair" | "Spa" | "Tattoo" | "Makeup" | "Nails";
function StaffPicksCategory({ shops, dest }: CategoryProps) {
  const [sp, setSp] = useState<Specialty>("Hair");
  const specs: { id: Specialty; I: typeof Scissors }[] = [
    { id: "Hair", I: Scissors },
    { id: "Spa", I: Sparkles },
    { id: "Tattoo", I: PaintBucket },
    { id: "Makeup", I: Brush },
    { id: "Nails", I: Award },
  ];
  const list = useMemo(
    () => shops.filter((s) => s.staffPickSpecialty === sp).slice(0, 8),
    [shops, sp],
  );
  return (
    <section
      id="cat-staff-picks"
      className="rounded-3xl bg-gradient-to-br from-fuchsia-50 via-white to-white p-6 ring-1 ring-fuchsia-200 sm:p-8"
    >
      <CategoryHeader
        title="Staff Picks"
        purpose="Top professionals across specialties"
        badges={["Top Pros", "Expert Picks"]}
        dest={dest}
      />
      <div className="mt-3 flex flex-wrap gap-1.5">
        {specs.map(({ id, I }) => (
          <button
            key={id}
            type="button"
            onClick={() => setSp(id)}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              sp === id ? "bg-fuchsia-600 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:text-slate-900"
            }`}
          >
            <I className="h-3 w-3" />
            {id}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500">No {sp} experts in this filter.</p>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((s) => (
            <Card key={s.slug} s={s} />
          ))}
        </div>
      )}
    </section>
  );
}

/* ============= CATEGORY: SEASONAL PICKS ============= */
type Season = "Wedding" | "Festival" | "Summer" | "Winter" | "Monsoon" | "Holiday";
function SeasonalPicksCategory({ shops, dest }: CategoryProps) {
  const seasons: { id: Season; I: typeof Sun; cls: string }[] = [
    { id: "Wedding", I: Crown, cls: "from-rose-50 to-amber-50 ring-rose-200" },
    { id: "Festival", I: PartyPopper, cls: "from-orange-50 to-yellow-50 ring-orange-200" },
    { id: "Summer", I: Sun, cls: "from-yellow-50 to-amber-50 ring-yellow-200" },
    { id: "Winter", I: Snowflake, cls: "from-sky-50 to-blue-50 ring-sky-200" },
    { id: "Monsoon", I: CloudRain, cls: "from-emerald-50 to-teal-50 ring-teal-200" },
    { id: "Holiday", I: Gift, cls: "from-violet-50 to-pink-50 ring-violet-200" },
  ];
  const [season, setSeason] = useState<Season>("Wedding");
  const list = useMemo(
    () => shops.filter((s) => s.seasonTag === season).slice(0, 8),
    [shops, season],
  );
  const active = seasons.find((s) => s.id === season)!;
  return (
    <section
      id="cat-seasonal"
      className={`rounded-3xl bg-gradient-to-br ${active.cls} p-6 ring-1 sm:p-8`}
    >
      <CategoryHeader
        title="Seasonal Picks"
        purpose="Curated for the moment · wedding, festival, summer, winter, monsoon & holiday specials"
        badges={["Seasonal"]}
        dest={dest}
      />
      <div className="mt-3 flex flex-wrap gap-1.5">
        {seasons.map(({ id, I }) => (
          <button
            key={id}
            type="button"
            onClick={() => setSeason(id)}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              season === id ? "bg-slate-900 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:text-slate-900"
            }`}
          >
            <I className="h-3 w-3" />
            {id}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500">No {season} specials in this filter.</p>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((s) => (
            <Card key={s.slug} s={s} />
          ))}
        </div>
      )}
    </section>
  );
}
