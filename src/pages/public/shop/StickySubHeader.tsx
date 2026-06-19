import { motion, useScroll, useTransform } from "framer-motion";
import { Star } from "lucide-react";

export function StickySubHeader({
  name,
  rating,
  reviewCount,
}: {
  name: string;
  rating: number;
  reviewCount: number;
}) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [240, 360], [0, 1]);
  const y = useTransform(scrollY, [240, 360], [-12, 0]);
  const pointerEvents = useTransform(scrollY, (v) => (v > 280 ? "auto" : "none"));

  return (
    <motion.div
      style={{ opacity, y, pointerEvents }}
      className="border-border/60 bg-card/95 fixed inset-x-0 top-0 z-40 border-b backdrop-blur"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-heading md:text-base">{name}</div>
          <div className="text-muted-foreground flex items-center gap-1 text-xs">
            <Star className="h-3 w-3 fill-warning text-warning" />
            <span className="font-semibold text-heading">{rating.toFixed(1)}</span>
            <span>· {reviewCount.toLocaleString("en-IN")} reviews</span>
          </div>
        </div>
        <button
          type="button"
          className="bg-gradient-cta text-primary-foreground inline-flex items-center justify-center rounded-[var(--radius-button)] px-4 py-2 text-sm font-bold shadow-[var(--shadow-glow)] transition hover:brightness-110 md:px-6"
        >
          Book Now
        </button>
      </div>
    </motion.div>
  );
}
