import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type DateRangeId = "today" | "7d" | "30d" | "6m" | "custom";

const RANGES: { id: DateRangeId; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "Last 7 Days" },
  { id: "30d", label: "Last 30 Days" },
  { id: "6m", label: "Last 6 Months" },
  { id: "custom", label: "Custom" },
];

export function BookingFilterRow({
  range,
  onRangeChange,
  query,
  onQueryChange,
}: {
  range: DateRangeId | null;
  onRangeChange: (r: DateRangeId | null) => void;
  query: string;
  onQueryChange: (q: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {RANGES.map((r) => {
          const active = r.id === range;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onRangeChange(active ? null : r.id)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-heading",
              )}
            >
              {r.label}
            </button>
          );
        })}
      </div>
      <div className="relative md:w-72">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search shop, service, ID…"
          className="w-full rounded-full border border-border bg-card py-2 pr-3 pl-9 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>
  );
}
