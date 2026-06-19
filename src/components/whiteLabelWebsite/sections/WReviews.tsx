import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";
import { SectionTitle } from "./WServices";
import { Star } from "lucide-react";

export function WReviews({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  return (
    <section className="bg-muted/30 px-6 py-16 md:px-12">
      <SectionTitle font={template.font}>Customer Reviews</SectionTitle>
      <div className="mt-2 text-center text-sm">
        <Star className="inline h-4 w-4 fill-amber-400 text-amber-400" /> <strong>{shop.rating}</strong> · {shop.reviewCount} reviews
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {shop.reviews.map(r => (
          <div key={r.id} className="bg-white p-5 shadow-sm" style={{ borderRadius: template.radius }}>
            <div className="flex">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}</div>
            <p className="mt-2 text-sm">"{r.text}"</p>
            <div className="text-muted-foreground mt-3 text-xs">— {r.author} · {r.date}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
