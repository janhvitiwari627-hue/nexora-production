import { Link } from "@tanstack/react-router";
import { Clock, Zap } from "lucide-react";
import type { Shop } from "@/components/shared/ShopCard";

const SLOTS = ["12:30 PM", "1:00 PM", "2:15 PM", "3:00 PM", "4:30 PM"];

export function InstantBookingSection({ shops }: { shops: Shop[] }) {
  const picks = shops.slice(0, 4);
  if (picks.length === 0) return null;

  return (
    <section className="relative overflow-hidden rounded-[var(--radius-card-lg)] border border-border bg-gradient-to-r from-[#fff7ed] via-[#fef2f2] to-[#fdf2f8] p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#FF6B9D] to-[#FFB36B] text-white shadow-lg">
          <Zap className="h-5 w-5 fill-white" />
        </span>
        <div>
          <h3 className="text-base font-black text-heading">Book within 2 hours</h3>
          <p className="text-xs text-muted-foreground">
            Live availability — grab the next slot.
          </p>
        </div>
      </div>

      <ul className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
        {picks.map((s, i) => (
          <li
            key={s.slug}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted">
              {s.cover_image && (
                <img
                  src={s.cover_image}
                  alt={s.name}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-heading">{s.name}</div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="h-3 w-3" /> Next: {SLOTS[i % SLOTS.length]}
              </div>
            </div>
            <Link
              to="/book/$slug"
              params={{ slug: s.slug }}
              className="shrink-0 rounded-full bg-gradient-cta px-3 py-1.5 text-[11px] font-bold text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-110"
            >
              Book
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
