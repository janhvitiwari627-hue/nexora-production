import { Link } from "@tanstack/react-router";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import type { Shop } from "@/components/shared/ShopCard";

export function CustomerSalonCard({ shop }: { shop: Shop }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#e8e0d2] bg-white shadow-[0_10px_30px_rgba(69,49,12,0.08)]">
      <Link to="/site/$businessSlug" params={{ businessSlug: shop.slug }} className="block">
        <div className="relative aspect-[16/10] bg-gradient-to-br from-[#fff0c2] to-[#f3e7ce]">
          {shop.cover_image ? (
            <img src={shop.cover_image} alt={shop.name} className="h-full w-full object-cover" />
          ) : null}
          {shop.is_verified ? (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-emerald-700 shadow">
              <BadgeCheck className="h-3 w-3" /> Verified
            </span>
          ) : null}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate font-bold">{shop.name}</h3>
              <p className="mt-1 flex items-center gap-1 truncate text-xs text-[#7a746a]">
                <MapPin className="h-3 w-3 shrink-0" />
                {shop.area ? `${shop.area}, ` : ""}
                {shop.city}
              </p>
              {typeof shop.distance_km === "number" ? (
                <p className="mt-1 text-xs font-bold text-[#9a6b16]">
                  {shop.distance_km < 1
                    ? `${Math.max(1, Math.round(shop.distance_km * 1000))} m away`
                    : `${shop.distance_km.toFixed(1)} km away`}
                </p>
              ) : null}
            </div>
            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800">
              <Star className="h-3 w-3 fill-current" /> {shop.rating.toFixed(1)}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-[#7a746a]">{shop.category}</span>
            <span className="rounded-full bg-[#0b0a08] px-4 py-2 text-xs font-bold text-[#f3cf70]">
              View & book
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
