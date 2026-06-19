export type SortKey =
  | "relevance"
  | "rating"
  | "distance"
  | "price"
  | "popular";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "relevance", label: "Relevance" },
  { key: "rating", label: "Rating: High to Low" },
  { key: "distance", label: "Distance: Near to Far" },
  { key: "price", label: "Price: Low to High" },
  { key: "popular", label: "Most Booked" },
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

export type Gender = "all" | "men" | "women" | "unisex";

export type Filters = {
  minRating: number;
  maxDistance: number;
  priceRange: [number, number];
  categories: string[];
  gender: Gender;
  openNow: boolean;
  verifiedOnly: boolean;
  offersOnly: boolean;
  homeService: boolean;
};

export const DEFAULT_FILTERS: Filters = {
  minRating: 1,
  maxDistance: 20,
  priceRange: [1, 4],
  categories: [],
  gender: "all",
  openNow: false,
  verifiedOnly: false,
  offersOnly: false,
  homeService: false,
};

export function isDefault(f: Filters): boolean {
  return (
    f.minRating === DEFAULT_FILTERS.minRating &&
    f.maxDistance === DEFAULT_FILTERS.maxDistance &&
    f.priceRange[0] === 1 &&
    f.priceRange[1] === 4 &&
    f.categories.length === 0 &&
    f.gender === "all" &&
    !f.openNow &&
    !f.verifiedOnly &&
    !f.offersOnly &&
    !f.homeService
  );
}
