export type SortKey =
  | "relevance"
  | "rating"
  | "distance"
  | "price_low"
  | "price_high"
  | "popular"
  | "newest";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "relevance", label: "Recommended" },
  { key: "distance", label: "Nearest" },
  { key: "rating", label: "Highest Rated" },
  { key: "price_low", label: "Lowest Price" },
  { key: "price_high", label: "Highest Price" },
  { key: "popular", label: "Trending" },
  { key: "newest", label: "Newest" },
];

export const CATEGORIES = [
  "Hair Salon",
  "Beauty Salon",
  "Spa",
  "Nail Studio",
  "Barber Shop",
  "Unisex Salon",
  "Tattoo Studio",
  "Massage Center",
];

export type Gender = "all" | "male" | "female" | "unisex";

export const PRICE_MIN = 0;
export const PRICE_MAX = 5000;

export type Filters = {
  minRating: number;
  maxDistance: number;
  priceRange: [number, number]; // rupees
  categories: string[];
  gender: Gender;
  openNow: boolean;
  verifiedOnly: boolean;
  topRated: boolean;
  mostPopular: boolean;
  offersOnly: boolean;
  homeService: boolean;
  parking: boolean;
  airConditioned: boolean;
};

export const DEFAULT_FILTERS: Filters = {
  minRating: 1,
  maxDistance: 20,
  priceRange: [PRICE_MIN, PRICE_MAX],
  categories: [],
  gender: "all",
  openNow: false,
  verifiedOnly: false,
  topRated: false,
  mostPopular: false,
  offersOnly: false,
  homeService: false,
  parking: false,
  airConditioned: false,
};

export function isDefault(f: Filters): boolean {
  return (
    f.minRating === DEFAULT_FILTERS.minRating &&
    f.maxDistance === DEFAULT_FILTERS.maxDistance &&
    f.priceRange[0] === PRICE_MIN &&
    f.priceRange[1] === PRICE_MAX &&
    f.categories.length === 0 &&
    f.gender === "all" &&
    !f.openNow &&
    !f.verifiedOnly &&
    !f.topRated &&
    !f.mostPopular &&
    !f.offersOnly &&
    !f.homeService &&
    !f.parking &&
    !f.airConditioned
  );
}

export function formatRupees(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

/* ───────── URL <-> Filters serialization ───────── */

export type SearchUrlParams = {
  q?: string;
  category?: string;
  area?: string;
  mr?: number;
  md?: number;
  pmin?: number;
  pmax?: number;
  cats?: string;
  g?: Gender;
  on?: 1;
  vo?: 1;
  tr?: 1;
  mp?: 1;
  oo?: 1;
  hs?: 1;
  pk?: 1;
  ac?: 1;
  sort?: SortKey;
  view?: "grid" | "map";
};

const GENDERS: Gender[] = ["all", "male", "female", "unisex"];
const SORTS: SortKey[] = [
  "relevance",
  "rating",
  "distance",
  "price_low",
  "price_high",
  "popular",
  "newest",
];

export function filtersFromSearch(s: SearchUrlParams): Filters {
  const g = s.g && GENDERS.includes(s.g) ? s.g : DEFAULT_FILTERS.gender;
  const cats = s.cats
    ? s.cats
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
    : [];
  const pmin = typeof s.pmin === "number" && !Number.isNaN(s.pmin) ? s.pmin : PRICE_MIN;
  const pmax = typeof s.pmax === "number" && !Number.isNaN(s.pmax) ? s.pmax : PRICE_MAX;
  return {
    minRating:
      typeof s.mr === "number" && s.mr >= 1 && s.mr <= 5 ? s.mr : DEFAULT_FILTERS.minRating,
    maxDistance: typeof s.md === "number" && s.md > 0 ? s.md : DEFAULT_FILTERS.maxDistance,
    priceRange: [Math.min(pmin, pmax), Math.max(pmin, pmax)],
    categories: cats,
    gender: g,
    openNow: s.on === 1,
    verifiedOnly: s.vo === 1,
    topRated: s.tr === 1,
    mostPopular: s.mp === 1,
    offersOnly: s.oo === 1,
    homeService: s.hs === 1,
    parking: s.pk === 1,
    airConditioned: s.ac === 1,
  };
}

export function filtersToSearch(f: Filters): Partial<SearchUrlParams> {
  const out: Partial<SearchUrlParams> = {};
  if (f.minRating !== DEFAULT_FILTERS.minRating) out.mr = f.minRating;
  if (f.maxDistance !== DEFAULT_FILTERS.maxDistance) out.md = f.maxDistance;
  if (f.priceRange[0] !== PRICE_MIN) out.pmin = f.priceRange[0];
  if (f.priceRange[1] !== PRICE_MAX) out.pmax = f.priceRange[1];
  if (f.categories.length > 0) out.cats = f.categories.join(",");
  if (f.gender !== "all") out.g = f.gender;
  if (f.openNow) out.on = 1;
  if (f.verifiedOnly) out.vo = 1;
  if (f.topRated) out.tr = 1;
  if (f.mostPopular) out.mp = 1;
  if (f.offersOnly) out.oo = 1;
  if (f.homeService) out.hs = 1;
  if (f.parking) out.pk = 1;
  if (f.airConditioned) out.ac = 1;
  return out;
}

export function sortFromSearch(s: SearchUrlParams): SortKey {
  return s.sort && SORTS.includes(s.sort) ? s.sort : "relevance";
}

export function viewFromSearch(s: SearchUrlParams): "grid" | "map" {
  return s.view === "map" ? "map" : "grid";
}
