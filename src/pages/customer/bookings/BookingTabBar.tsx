import { cn } from "@/lib/utils";
import type { BookingTab } from "./mockBookings";

const TABS: { id: BookingTab; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "rescheduled", label: "Rescheduled" },
];

export function BookingTabBar({
  active,
  counts,
  onChange,
}: {
  active: BookingTab;
  counts: Record<BookingTab, number>;
  onChange: (tab: BookingTab) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-full border bg-card p-1 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {TABS.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
              isActive
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:bg-muted hover:text-heading",
            )}
          >
            <span>{t.label}</span>
            <span
              className={cn(
                "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold",
                isActive ? "bg-white/20 text-white" : "bg-muted text-heading",
              )}
            >
              {counts[t.id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
