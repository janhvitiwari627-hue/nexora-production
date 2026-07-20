import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";
import { SectionTitle } from "./WServices";
import { ShareButton } from "./ShareButton";
import { Clock, Star, Tag } from "lucide-react";

/**
 * Rate Card — structured pricing table.
 * Same data as services, but presented as a transparent price list with
 * duration, original price, discounted price, and a Popular badge.
 */
export function WRateCard({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  const grouped = shop.services.reduce<Record<string, typeof shop.services>>((acc, s) => {
    const cat = s.category ?? "All Services";
    (acc[cat] ??= []).push(s);
    return acc;
  }, {});
  return (
    <section id="rate-card" className="bg-muted/30 px-6 py-16 md:px-12">
      <SectionTitle font={template.headingFont}>Rate Card</SectionTitle>
      <p className="text-muted-foreground mt-2 text-center text-sm">
        Transparent pricing. No hidden costs.
      </p>
      <div className="mx-auto mt-8 max-w-4xl space-y-8">
        {Object.entries(grouped).map(([cat, list]) => (
          <div key={cat}>
            <h3
              className="mb-3 text-xs font-bold uppercase tracking-widest"
              style={{ color: template.colors.secondary }}
            >
              {cat}
            </h3>
            <div
              className="overflow-hidden border bg-white shadow-sm"
              style={{ borderRadius: template.radius }}
            >
              {list.map((s, idx) => (
                <div
                  key={s.id}
                  className={`flex items-center justify-between gap-4 p-4 ${idx !== list.length - 1 ? "border-b" : ""}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{s.name}</span>
                      {s.popular && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                          style={{ backgroundColor: template.colors.primary }}
                        >
                          <Star className="h-2.5 w-2.5 fill-current" /> Popular
                        </span>
                      )}
                    </div>
                    <div className="text-muted-foreground mt-0.5 flex items-center gap-3 text-xs">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {s.duration} min
                      </span>
                      <ShareButton
                        title={`${s.name} at ${shop.name}`}
                        label="Share"
                        className="!px-2 !py-0.5 !text-[10px]"
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    {s.discountPrice ? (
                      <>
                        <div className="text-muted-foreground text-xs line-through">₹{s.price}</div>
                        <div
                          className="text-lg font-bold"
                          style={{ color: template.colors.primary }}
                        >
                          ₹{s.discountPrice}
                        </div>
                      </>
                    ) : (
                      <div className="text-lg font-bold" style={{ color: template.colors.primary }}>
                        ₹{s.price}
                      </div>
                    )}
                    <a
                      href={`https://wa.me/${shop.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi, I'd like the price for ${s.name}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground mt-1 inline-flex items-center gap-1 text-[10px] hover:underline"
                    >
                      <Tag className="h-2.5 w-2.5" /> Inquire
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
