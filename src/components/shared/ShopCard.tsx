import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BadgeCheck, Heart, MapPin, Sparkles, Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type Shop = {
  slug: string;
  name: string;
  tagline?: string | null;
  category: string;
  area?: string | null;
  city: string;
  cover_image?: string | null;
  rating: number;
  review_count: number;
  price_level: number;
  is_verified: boolean;
  distance_km?: number | null;
  membership_perk?: string | null;
  starting_price?: number | null;
  popularity?: number;
  gender?: "male" | "female" | "unisex" | null;
  badges?: Array<"verified" | "top_rated" | "most_popular">;
  is_open_now?: boolean;
  has_offer?: boolean;
  is_home_service?: boolean;
  amenities?: string[];
  created_at?: string | null;
  price_tier?: "budget" | "mid" | "premium" | "luxury";
};

function formatStartingPrice(shop: Shop): string {
  if (typeof shop.starting_price === "number" && shop.starting_price > 0) {
    return `Starting from ₹${shop.starting_price.toLocaleString("en-IN")}`;
  }
  if (typeof shop.price_level === "number" && shop.price_level > 0) {
    const approx = shop.price_level * 250;
    return `Starting from ₹${approx.toLocaleString("en-IN")}`;
  }
  return "Price not added";
}

type Variant = "carousel" | "grid" | "list";

export function ShopCard({
  shop,
  variant = "grid",
  onWishlist,
}: {
  shop: Shop;
  variant?: Variant;
  onWishlist?: (slug: string, next: boolean) => void;
}) {
  const [wished, setWished] = useState(false);
  const isList = variant === "list";

  const Cover = (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-card)]",
        isList ? "aspect-[4/3] md:aspect-[3/2]" : "aspect-[3/2]",
      )}
    >
      {shop.cover_image ? (
        <img
          src={shop.cover_image}
          alt={shop.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="bg-gradient-hero h-full w-full" />
      )}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent" />

      {/* Verified chip (top-left) */}
      {shop.is_verified && (
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground shadow">
          <BadgeCheck className="h-3 w-3" /> Verified
        </span>
      )}

      {/* Wishlist (top-right) */}
      <button
        type="button"
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        onClick={(e) => {
          e.preventDefault();
          const next = !wished;
          setWished(next);
          onWishlist?.(shop.slug, next);
        }}
        className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow transition hover:scale-110"
      >
        <Heart
          className={cn("h-4 w-4 transition", wished ? "fill-danger text-danger" : "text-heading")}
        />
      </button>

      {/* Rating badge */}
      <div className="absolute right-3 bottom-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-heading shadow">
        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
        {shop.rating.toFixed(1)}
        <span className="text-muted-foreground font-medium">({shop.review_count})</span>
      </div>
    </div>
  );

  const Body = (
    <div className={cn("flex min-w-0 flex-col gap-2", isList ? "p-4 md:p-5" : "pt-3")}>
      <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
        <h3
          className="min-w-0 truncate text-base font-semibold text-heading"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {shop.name}
        </h3>
        <span className="text-heading min-w-0 text-sm font-semibold sm:max-w-[52%] sm:text-right">
          {formatStartingPrice(shop)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="bg-muted text-heading rounded-full px-2 py-0.5 text-[11px] font-semibold">
          {shop.category}
        </span>
        {shop.gender && shop.gender !== "unisex" && (
          <span className="bg-muted/60 text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize">
            {shop.gender}
          </span>
        )}
      </div>

      <div className="text-muted-foreground flex items-center gap-1 text-xs">
        <MapPin className="h-3.5 w-3.5" />
        <span className="truncate">
          {shop.area ? `${shop.area}, ` : ""}
          {shop.city}
          {typeof shop.distance_km === "number" && ` · ${shop.distance_km.toFixed(1)} km`}
        </span>
      </div>

      {shop.tagline && !isList && (
        <p className="text-muted-foreground line-clamp-1 text-xs">{shop.tagline}</p>
      )}

      <div className="mt-2">
        <span className="bg-gradient-cta inline-flex w-full items-center justify-center rounded-[var(--radius-button)] px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition group-hover:brightness-110">
          Book Now
        </span>
      </div>
    </div>
  );

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className={cn(
        "group min-w-0 max-w-full rounded-[var(--radius-card)] transition",
        "hover:shadow-[var(--shadow-glow)] hover:ring-1 hover:ring-primary/60",
      )}
    >
      <Link
        to="/book/$slug"
        params={{ slug: shop.slug }}
        aria-label={shop.name}
        className={cn(
          "bg-card block w-full min-w-0 max-w-full overflow-hidden rounded-[var(--radius-card)]",
          isList ? "grid grid-cols-1 gap-0 md:grid-cols-[minmax(0,260px)_1fr]" : "p-2",
          variant === "carousel" && "min-w-[280px] max-w-[320px]",
        )}
      >
        {Cover}
        {Body}
      </Link>
    </motion.div>
  );
}

export type ShopCardData = Shop;
