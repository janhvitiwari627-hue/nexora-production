import { motion } from "framer-motion";
import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  offer_price?: number | null;
  description?: string | null;
};

export function ServiceCard({
  service,
  selected = false,
  onToggle,
}: {
  service: Service;
  selected?: boolean;
  onToggle?: (id: string, next: boolean) => void;
}) {
  const hasOffer = typeof service.offer_price === "number" && service.offer_price < service.price;

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={() => onToggle?.(service.id, !selected)}
      className={cn(
        "bg-card group w-full rounded-[var(--radius-card)] border p-4 text-left transition",
        selected
          ? "border-primary shadow-[var(--shadow-glow)]"
          : "border-border hover:border-primary/40 hover:shadow-[var(--shadow-card)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-sm font-semibold text-heading">{service.name}</h4>
            {selected && (
              <span className="bg-primary text-primary-foreground inline-flex h-5 w-5 items-center justify-center rounded-full">
                <Check className="h-3 w-3" />
              </span>
            )}
          </div>
          {service.description && (
            <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
              {service.description}
            </p>
          )}
          <span className="bg-muted text-heading mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold">
            <Clock className="h-3 w-3" /> {service.duration_minutes} min
          </span>
        </div>

        <div className="shrink-0 text-right">
          {hasOffer ? (
            <>
              <div className="text-heading text-base font-bold">₹{service.offer_price}</div>
              <div className="text-muted-foreground text-xs line-through">₹{service.price}</div>
            </>
          ) : (
            <div className="text-heading text-base font-bold">₹{service.price}</div>
          )}
        </div>
      </div>

      <div className="mt-3">
        <span
          className={cn(
            "inline-flex w-full items-center justify-center rounded-[var(--radius-button)] px-4 py-2 text-sm font-semibold transition",
            selected
              ? "bg-primary text-primary-foreground"
              : "border-primary text-primary border bg-transparent group-hover:bg-primary/5",
          )}
        >
          {selected ? "Added" : "Add to Booking"}
        </span>
      </div>
    </motion.button>
  );
}
