import { Check } from "lucide-react";
import { ServiceCard } from "@/components/shared/ServiceCard";
import type { BookingState } from "./state";

export function Step1Services({
  booking,
  onToggle,
}: {
  booking: BookingState;
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      <header className="mb-6">
        <h2 className="text-heading text-2xl font-black md:text-3xl">Choose your services</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Pick one or more — you can adjust later.
        </p>
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        {booking.services.map((s) => {
          const selected = booking.selectedServiceIds.includes(s.id);
          return (
            <ServiceCard
              key={s.id}
              service={s}
              selected={selected}
              onToggle={() => onToggle(s.id)}
            />
          );
        })}
      </div>
      <div className="text-muted-foreground mt-6 inline-flex items-center gap-1.5 text-xs">
        <Check className="text-success h-4 w-4" /> Free cancellation up to 4 hours before your slot.
      </div>
    </div>
  );
}
