import { Link } from "@tanstack/react-router";
import { BadgeCheck, Star } from "lucide-react";

export type ShopCardData = {
  slug: string;
  name: string;
  tagline: string | null;
  category: string;
  area: string | null;
  city: string;
  cover_image: string | null;
  rating: number;
  review_count: number;
  price_level: number;
  is_verified: boolean;
};

export function ShopCard({ shop }: { shop: ShopCardData }) {
  return (
    <Link
      to="/search"
      className="group bg-card border-border block overflow-hidden rounded-[var(--radius-card)] border shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-float)]"
    >
      <div className="relative aspect-[5/4] overflow-hidden">
        <img
          src={shop.cover_image ?? ""}
          alt={shop.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="glass-panel rounded-full px-2.5 py-1 text-xs font-semibold text-heading">
            {shop.category}
          </span>
          {shop.is_verified && (
            <span className="bg-gradient-cta text-primary-foreground inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide">
              <BadgeCheck className="h-3 w-3" /> Verified
            </span>
          )}
        </div>
        <div className="absolute right-3 bottom-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-heading shadow">
          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
          {shop.rating.toFixed(1)}
          <span className="text-muted-foreground font-medium">({shop.review_count})</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-heading truncate text-base font-bold">{shop.name}</h3>
        <p className="text-muted-foreground mt-0.5 truncate text-sm">{shop.tagline}</p>
        <div className="text-muted-foreground mt-3 flex items-center justify-between text-xs">
          <span className="truncate">
            {shop.area ? `${shop.area}, ` : ""}
            {shop.city}
          </span>
          <span className="text-heading font-semibold">
            {"₹".repeat(shop.price_level)}
            <span className="text-muted-foreground">{"₹".repeat(4 - shop.price_level)}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
