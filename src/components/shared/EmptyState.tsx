import type { ReactNode } from "react";
import { CalendarX, Heart, Inbox, MessageSquareOff, SearchX } from "lucide-react";

export type EmptyIllustration =
  | "no-results"
  | "no-bookings"
  | "no-reviews"
  | "no-favorites"
  | "generic";

const ILLOS: Record<EmptyIllustration, ReactNode> = {
  "no-results": <SearchX className="h-12 w-12" />,
  "no-bookings": <CalendarX className="h-12 w-12" />,
  "no-reviews": <MessageSquareOff className="h-12 w-12" />,
  "no-favorites": <Heart className="h-12 w-12" />,
  generic: <Inbox className="h-12 w-12" />,
};

export function EmptyState({
  illustration = "generic",
  title,
  description,
  ctaLabel,
  onCta,
}: {
  illustration?: EmptyIllustration;
  title: string;
  description?: string;
  ctaLabel?: string;
  onCta?: () => void;
}) {
  return (
    <div className="bg-card border-border flex flex-col items-center gap-3 rounded-[var(--radius-card)] border p-10 text-center">
      <div className="bg-gradient-cta text-primary-foreground grid h-20 w-20 place-items-center rounded-full opacity-90">
        {ILLOS[illustration]}
      </div>
      <h3 className="text-heading text-lg font-bold">{title}</h3>
      {description && <p className="text-muted-foreground max-w-sm text-sm">{description}</p>}
      {ctaLabel && onCta && (
        <button
          type="button"
          onClick={onCta}
          className="bg-gradient-cta text-primary-foreground mt-2 inline-flex items-center rounded-[var(--radius-button)] px-5 py-2 text-sm font-semibold shadow-[var(--shadow-glow)] hover:brightness-110"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
