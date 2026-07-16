import { Link } from "@tanstack/react-router";
import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";
import { Calendar } from "lucide-react";

export function WBookingBar({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-white px-4 py-3 shadow-2xl md:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{shop.name}</div>
          <div className="text-muted-foreground text-xs">Available today</div>
        </div>
        <Link
          to="/site/$slug_/book"
          params={{ slug_: shop.slug }}
          search={{ service: undefined }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: template.colors.primary, borderRadius: template.radius }}
        >
          <Calendar className="h-4 w-4" /> Book Now
        </Link>
      </div>
    </div>
  );
}
