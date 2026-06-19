import { motion } from "framer-motion";
import { Instagram, MessageCircle, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type Staff = {
  id: string;
  name: string;
  designation: string;
  avatar_url?: string | null;
  experience_years: number;
  specializations: string[];
  rating: number;
  available: boolean;
  instagram_url?: string | null;
  whatsapp_url?: string | null;
};

export function StaffCard({
  staff,
  selected = false,
  onSelect,
}: {
  staff: Staff;
  selected?: boolean;
  onSelect?: (id: string) => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "bg-card flex flex-col items-center gap-3 rounded-[var(--radius-card)] border p-4 text-center transition",
        selected
          ? "border-primary shadow-[var(--shadow-glow)]"
          : "border-border hover:border-primary/40 hover:shadow-[var(--shadow-card)]",
      )}
    >
      <div className="relative">
        <div className="bg-muted aspect-square h-20 w-20 overflow-hidden rounded-full">
          {staff.avatar_url ? (
            <img
              src={staff.avatar_url}
              alt={staff.name}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="bg-gradient-cta text-primary-foreground grid h-full w-full place-items-center text-xl font-bold">
              {staff.name.charAt(0)}
            </div>
          )}
        </div>
        <span
          aria-label={staff.available ? "Available" : "Unavailable"}
          className={cn(
            "border-card absolute right-1 bottom-1 h-3.5 w-3.5 rounded-full border-2",
            staff.available ? "bg-success" : "bg-danger",
          )}
        />
      </div>

      <div className="min-w-0">
        <h4 className="text-heading truncate text-sm font-bold">{staff.name}</h4>
        <p className="text-muted-foreground truncate text-xs">{staff.designation}</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <span className="bg-muted text-heading rounded-full px-2 py-0.5 text-[11px] font-semibold">
          {staff.experience_years}+ yrs
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-semibold text-heading">
          <Star className="h-3 w-3 fill-warning text-warning" />
          {staff.rating.toFixed(1)}
        </span>
      </div>

      {staff.specializations.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1">
          {staff.specializations.slice(0, 3).map((s) => (
            <span
              key={s}
              className="border-border text-muted-foreground rounded-full border px-2 py-0.5 text-[10px]"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        {staff.instagram_url && (
          <a
            href={staff.instagram_url}
            target="_blank"
            rel="noreferrer"
            aria-label={`${staff.name} on Instagram`}
            className="text-muted-foreground hover:text-primary border-border grid h-8 w-8 place-items-center rounded-full border transition"
          >
            <Instagram className="h-3.5 w-3.5" />
          </a>
        )}
        {staff.whatsapp_url && (
          <a
            href={staff.whatsapp_url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Chat with ${staff.name} on WhatsApp`}
            className="text-muted-foreground hover:text-success border-border grid h-8 w-8 place-items-center rounded-full border transition"
          >
            <MessageCircle className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      <button
        type="button"
        onClick={() => onSelect?.(staff.id)}
        disabled={!staff.available}
        className={cn(
          "mt-1 inline-flex w-full items-center justify-center rounded-[var(--radius-button)] px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
          selected
            ? "bg-primary text-primary-foreground"
            : "bg-gradient-cta text-primary-foreground hover:brightness-110",
        )}
      >
        {selected ? "Selected" : "Select"}
      </button>
    </motion.div>
  );
}
