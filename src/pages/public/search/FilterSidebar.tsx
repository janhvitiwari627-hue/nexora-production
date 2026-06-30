import { Star } from "lucide-react";
import {
  CATEGORIES,
  DEFAULT_FILTERS,
  PRICE_MAX,
  PRICE_MIN,
  formatRupees,
  type Filters,
  type Gender,
} from "./filters";

interface Props {
  draft: Filters;
  onChange: (f: Filters) => void;
  onApply: () => void;
  onReset: () => void;
}

export function FilterSidebar({ draft, onChange, onApply, onReset }: Props) {
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) =>
    onChange({ ...draft, [k]: v });

  const toggleCat = (c: string) => {
    set(
      "categories",
      draft.categories.includes(c)
        ? draft.categories.filter((x) => x !== c)
        : [...draft.categories, c],
    );
  };

  return (
    <div className="flex flex-col gap-6 p-5">
      <Section title="Minimum Rating">
        <div className="mb-2 flex items-center gap-1 text-sm font-bold text-heading">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < draft.minRating ? "fill-warning text-warning" : "text-muted-foreground/30"
              }`}
            />
          ))}
          <span className="ml-2">{draft.minRating}+</span>
        </div>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={draft.minRating}
          onChange={(e) => set("minRating", Number(e.target.value))}
          className="w-full accent-primary"
        />
      </Section>

      <Section title="Distance">
        <div className="mb-2 text-sm font-bold text-heading">
          Within {draft.maxDistance.toFixed(1)} km
        </div>
        <input
          type="range"
          min={0.5}
          max={20}
          step={0.5}
          value={draft.maxDistance}
          onChange={(e) => set("maxDistance", Number(e.target.value))}
          className="w-full accent-primary"
        />
      </Section>

      <Section title="Price Range">
        <div className="mb-2 flex items-center justify-between text-sm font-bold text-heading">
          <span>{formatRupees(draft.priceRange[0])}</span>
          <span>{formatRupees(draft.priceRange[1])}</span>
        </div>
        <div className="space-y-2">
          <input
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={100}
            value={draft.priceRange[0]}
            onChange={(e) => {
              const lo = Math.min(Number(e.target.value), draft.priceRange[1]);
              set("priceRange", [lo, draft.priceRange[1]]);
            }}
            className="w-full accent-primary"
          />
          <input
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={100}
            value={draft.priceRange[1]}
            onChange={(e) => {
              const hi = Math.max(Number(e.target.value), draft.priceRange[0]);
              set("priceRange", [draft.priceRange[0], hi]);
            }}
            className="w-full accent-primary"
          />
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Min: {formatRupees(PRICE_MIN)}</span>
            <span>Max: {formatRupees(PRICE_MAX)}</span>
          </div>
        </div>
      </Section>

      <Section title="Category">
        <ul className="space-y-2">
          {CATEGORIES.map((c) => (
            <li key={c}>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-heading">
                <input
                  type="checkbox"
                  checked={draft.categories.includes(c)}
                  onChange={() => toggleCat(c)}
                  className="h-4 w-4 accent-primary"
                />
                {c}
              </label>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Gender">
        <div className="grid grid-cols-2 gap-2">
          {(["all", "male", "female", "unisex"] as Gender[]).map((g) => (
            <label
              key={g}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold capitalize ${
                draft.gender === g
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-heading"
              }`}
            >
              <input
                type="radio"
                name="gender"
                checked={draft.gender === g}
                onChange={() => set("gender", g)}
                className="hidden"
              />
              {g}
            </label>
          ))}
        </div>
      </Section>

      <Section title="Quick Filters">
        <div className="space-y-2.5">
          <Toggle
            label="Open Now"
            checked={draft.openNow}
            onChange={(v) => set("openNow", v)}
          />
          <Toggle
            label="Verified Only"
            checked={draft.verifiedOnly}
            onChange={(v) => set("verifiedOnly", v)}
          />
          <Toggle
            label="Top Rated"
            checked={draft.topRated}
            onChange={(v) => set("topRated", v)}
          />
          <Toggle
            label="Most Popular"
            checked={draft.mostPopular}
            onChange={(v) => set("mostPopular", v)}
          />
          <Toggle
            label="Offers Available"
            checked={draft.offersOnly}
            onChange={(v) => set("offersOnly", v)}
          />
          <Toggle
            label="Home Service"
            checked={draft.homeService}
            onChange={(v) => set("homeService", v)}
          />
        </div>
      </Section>

      <div className="sticky bottom-0 -mx-5 -mb-5 flex gap-2 border-t border-border bg-card p-4">
        <button
          type="button"
          onClick={onReset}
          className="flex-1 rounded-[var(--radius-button)] border border-border bg-card px-4 py-2.5 text-sm font-bold text-heading hover:bg-muted"
        >
          Reset All
        </button>
        <button
          type="button"
          onClick={onApply}
          className="flex-[1.4] rounded-[var(--radius-button)] bg-gradient-cta px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-110"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between text-sm font-medium text-heading">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition ${
          checked ? "bg-gradient-cta" : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
            checked ? "left-4" : "left-0.5"
          }`}
        />
      </button>
    </label>
  );
}

// Re-export for convenience
export { DEFAULT_FILTERS };
