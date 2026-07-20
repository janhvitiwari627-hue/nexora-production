import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, HeartOff, Phone, MapPin, Star, Tag, Sparkles, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FavoriteShop } from "./mockFavorites";

interface Props {
  shop: FavoriteShop;
  saved?: boolean;
  visitedISO?: string;
  reason?: string;
  showAiBadge?: boolean;
  onToggleSave?: (id: string, next: boolean) => void;
}

export function FavoriteShopCard({
  shop,
  saved = true,
  visitedISO,
  reason,
  showAiBadge,
  onToggleSave,
}: Props) {
  const [isSaved, setIsSaved] = useState(saved);

  return (
    <article className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md">
      <div className="relative">
        <Link to="/shop/$slug" params={{ slug: shop.slug }}>
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <img
              src={shop.cover}
              alt={shop.name}
              className="h-full w-full object-cover transition group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />
          </div>
        </Link>

        {showAiBadge && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow">
            <Sparkles className="h-3 w-3" /> AI Pick
          </span>
        )}
        {!showAiBadge && shop.offers ? (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow">
            <Tag className="h-3 w-3" /> {shop.offers} Offer{shop.offers > 1 ? "s" : ""}
          </span>
        ) : null}

        <button
          type="button"
          aria-label={isSaved ? "Remove from favourites" : "Add to favourites"}
          onClick={() => {
            const next = !isSaved;
            setIsSaved(next);
            onToggleSave?.(shop.id, next);
          }}
          className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow transition hover:scale-110"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition",
              isSaved ? "fill-rose-500 text-rose-500" : "text-heading",
            )}
          />
        </button>

        <div className="absolute right-3 bottom-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-heading shadow">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          {shop.rating.toFixed(1)}
          <span className="font-medium text-muted-foreground">({shop.reviews})</span>
        </div>
      </div>

      <div className="space-y-2 p-4">
        <div>
          <h3 className="truncate text-base font-bold">{shop.name}</h3>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {shop.area}, {shop.city}
          </p>
        </div>

        <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold">
          {shop.category}
        </span>

        {visitedISO && (
          <p className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600">
            <Calendar className="h-3 w-3" /> Visited{" "}
            {new Date(visitedISO).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        )}

        {reason && (
          <p className="rounded-lg bg-fuchsia-50 px-2.5 py-2 text-[11px] font-medium text-fuchsia-900 dark:bg-fuchsia-950/40 dark:text-fuchsia-100">
            {reason}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link
            to="/book/$slug"
            params={{ slug: shop.slug }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition hover:opacity-90"
          >
            Book Again
          </Link>
          <button
            type="button"
            onClick={() => {
              const next = !isSaved;
              setIsSaved(next);
              onToggleSave?.(shop.id, next);
            }}
            className="inline-flex items-center justify-center gap-1 rounded-full border border-border px-3 py-2 text-xs font-semibold transition hover:border-rose-300 hover:text-rose-600"
          >
            {isSaved ? (
              <>
                <HeartOff className="h-3.5 w-3.5" /> Remove
              </>
            ) : (
              <>
                <Heart className="h-3.5 w-3.5" /> Save
              </>
            )}
          </button>
          <a
            href={`tel:${shop.phone}`}
            className="inline-flex items-center justify-center gap-1 rounded-full border border-border px-3 py-2 text-xs font-semibold transition hover:border-primary/40 hover:bg-primary/5"
          >
            <Phone className="h-3.5 w-3.5" /> Call
          </a>
          <a
            href={shop.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1 rounded-full border border-border px-3 py-2 text-xs font-semibold transition hover:border-primary/40 hover:bg-primary/5"
          >
            <MapPin className="h-3.5 w-3.5" /> Navigate
          </a>
          {shop.offers ? (
            <Link
              to="/shop/$slug"
              params={{ slug: shop.slug }}
              className="col-span-2 inline-flex items-center justify-center gap-1 rounded-full border border-amber-300 px-3 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-50"
            >
              <Tag className="h-3.5 w-3.5" /> View Offers
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
