import { Sparkles } from "lucide-react";
import { StaffCard } from "@/components/shared/StaffCard";
import type { BookingState } from "./state";
import { cn } from "@/lib/utils";

export function Step2Staff({
  booking,
  onSelect,
}: {
  booking: BookingState;
  onSelect: (id: string | null) => void;
}) {
  const anySelected = booking.selectedStaffId === null;
  return (
    <div>
      <header className="mb-6">
        <h2 className="text-heading text-2xl font-black md:text-3xl">Pick your stylist</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Choose a specialist or let us assign the next available expert.
        </p>
      </header>

      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          "from-primary/10 to-accent/10 mb-5 flex w-full items-center gap-4 rounded-[var(--radius-card)] border bg-gradient-to-r p-5 text-left transition",
          anySelected
            ? "border-primary shadow-[var(--shadow-glow)]"
            : "border-border hover:border-primary/40",
        )}
      >
        <div className="bg-gradient-cta text-primary-foreground grid h-12 w-12 place-items-center rounded-full">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="text-heading text-base font-bold">Any available staff</div>
          <div className="text-muted-foreground text-xs">
            Get the soonest slot with our recommended specialist
          </div>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-bold",
            anySelected ? "bg-primary text-primary-foreground" : "border-border border",
          )}
        >
          {anySelected ? "Selected" : "Recommended"}
        </span>
      </button>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {booking.staff.map((s) => (
          <StaffCard
            key={s.id}
            staff={s}
            selected={booking.selectedStaffId === s.id}
            onSelect={() => onSelect(s.id)}
          />
        ))}
      </div>
    </div>
  );
}
