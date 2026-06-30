export type SortKey =
  | "relevance"
  | "rating"
  | "distance"
  | "price_low"
  | "price_high"
  | "popular";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "relevance", label: "Recommended" },
  { key: "rating", label: "Rating: High to Low" },
  { key: "price_low", label: "Price: Low to High" },
  { key: "price_high", label: "Price: High to Low" },
  { key: "popular", label: "Popularity" },
  { key: "distance", label: "Distance: Near to Far" },
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
    !f.homeService
  );
}

export function formatRupees(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}
