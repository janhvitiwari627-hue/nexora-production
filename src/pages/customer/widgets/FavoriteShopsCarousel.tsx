import { Link } from "@tanstack/react-router";
import { Heart, Star, Zap } from "lucide-react";
import { mockFavoriteShops } from "../mockDashboard";

export function FavoriteShopsCarousel() {
  const shops = mockFavoriteShops.slice(0, 3);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
          Your Favorites
        </h2>
        <Link
          to="/dashboard/favorites"
          className="rounded-full px-2 py-1 text-xs font-semibold text-primary transition hover:bg-primary/10 hover:underline"
        >
          See all
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
        {shops.map((s) => (
          <div
            key={s.id}
            className="snap-start min-w-[260px] flex-1 overflow-hidden rounded-2xl border bg-card shadow-sm"
          >
            <Link to="/shop/$slug" params={{ slug: s.slug }} className="block">
              <div className="relative h-28 w-full overflow-hidden">
                <img src={s.cover} alt={s.name} className="h-full w-full object-cover" />
                <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {s.rating}
                </span>
              </div>
            </Link>
            <div className="p-3">
              <p className="truncate text-sm font-bold">{s.name}</p>
              <p className="text-xs text-muted-foreground">{s.category}</p>
              <Link
                to="/book/$slug"
                params={{ slug: s.slug }}
                className="mt-2.5 inline-flex w-full items-center justify-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground transition hover:opacity-90"
              >
                <Zap className="h-3.5 w-3.5" /> Quick Book
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
