import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";
import { ShareButton } from "./ShareButton";
import { Clock, Star } from "lucide-react";

export function WServices({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  return (
    <section className="px-6 py-16 md:px-12">
      <SectionTitle font={template.headingFont}>Our Services</SectionTitle>
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {shop.services.map((s) => (
          <article
            key={s.id}
            className="relative overflow-hidden border bg-white shadow-sm transition-transform hover:-translate-y-1"
            style={{ borderRadius: template.radius }}
          >
            {s.popular && (
              <span
                className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow"
                style={{ backgroundColor: template.colors.primary }}
              >
                <Star className="h-2.5 w-2.5 fill-current" /> Popular
              </span>
            )}
            {s.image && <img src={s.image} alt={s.name} loading="lazy" className="aspect-video w-full object-cover" />}
            <div className="space-y-2 p-5">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-lg font-semibold">{s.name}</h3>
                <div className="text-right">
                  {s.discountPrice ? (
                    <>
                      <div className="text-muted-foreground text-xs line-through">₹{s.price}</div>
                      <div className="font-bold" style={{ color: template.colors.primary }}>₹{s.discountPrice}</div>
                    </>
                  ) : (
                    <span className="font-bold" style={{ color: template.colors.primary }}>₹{s.price}</span>
                  )}
                </div>
              </div>
              <p className="text-muted-foreground text-sm">{s.desc}</p>
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {s.duration} min</span>
                <ShareButton title={`${s.name} at ${shop.name}`} label="Share" className="!px-2 !py-0.5 !text-[10px]" />
              </div>
              <a
                href="#appointment"
                className="mt-2 block rounded-md py-2 text-center text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: template.colors.primary, borderRadius: template.radius }}
              >
                Book Service
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function SectionTitle({ children, font }: { children: React.ReactNode; font?: string }) {
  return <h2 className="text-center text-3xl font-bold md:text-4xl" style={{ fontFamily: font }}>{children}</h2>;
}
