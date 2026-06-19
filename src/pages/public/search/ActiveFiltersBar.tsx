import { X } from "lucide-react";
import { DEFAULT_FILTERS, type Filters } from "./filters";

interface Chip {
  key: string;
  label: string;
  clear: () => void;
}

export function ActiveFiltersBar({
  filters,
  onChange,
  onResetAll,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onResetAll: () => void;
}) {
  const chips: Chip[] = [];

  if (filters.minRating > 1)
    chips.push({
      key: "rating",
      label: `${filters.minRating}★ & up`,
      clear: () => onChange({ ...filters, minRating: DEFAULT_FILTERS.minRating }),
    });
  if (filters.maxDistance < 20)
    chips.push({
      key: "distance",
      label: `≤ ${filters.maxDistance} km`,
      clear: () => onChange({ ...filters, maxDistance: DEFAULT_FILTERS.maxDistance }),
    });
  if (filters.priceRange[0] !== 1 || filters.priceRange[1] !== 4)
    chips.push({
      key: "price",
      label: `${"₹".repeat(filters.priceRange[0])} – ${"₹".repeat(filters.priceRange[1])}`,
      clear: () => onChange({ ...filters, priceRange: [1, 4] }),
    });
  filters.categories.forEach((c) =>
    chips.push({
      key: `cat-${c}`,
      label: c,
      clear: () =>
        onChange({ ...filters, categories: filters.categories.filter((x) => x !== c) }),
    }),
  );
  if (filters.gender !== "all")
    chips.push({
      key: "gender",
      label: filters.gender[0].toUpperCase() + filters.gender.slice(1),
      clear: () => onChange({ ...filters, gender: "all" }),
    });
  if (filters.openNow)
    chips.push({
      key: "openNow",
      label: "Open Now",
      clear: () => onChange({ ...filters, openNow: false }),
    });
  if (filters.verifiedOnly)
    chips.push({
      key: "verified",
      label: "Verified",
      clear: () => onChange({ ...filters, verifiedOnly: false }),
    });
  if (filters.offersOnly)
    chips.push({
      key: "offers",
      label: "Offers",
      clear: () => onChange({ ...filters, offersOnly: false }),
    });
  if (filters.homeService)
    chips.push({
      key: "home",
      label: "Home Service",
      clear: () => onChange({ ...filters, homeService: false }),
    });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={c.clear}
          className="group inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20"
        >
          {c.label}
          <X className="h-3 w-3 opacity-60 transition group-hover:opacity-100" />
        </button>
      ))}
      <button
        type="button"
        onClick={onResetAll}
        className="text-xs font-bold text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
