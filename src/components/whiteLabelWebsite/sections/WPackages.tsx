import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";
import { SectionTitle } from "./WServices";
import { ShareButton } from "./ShareButton";
import { Check } from "lucide-react";

export function WPackages({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  return (
    <section id="packages" className="px-6 py-16 md:px-12">
      <SectionTitle font={template.headingFont}>Curated Packages</SectionTitle>
      <p className="text-muted-foreground mt-2 text-center text-sm">Bundle and save on signature experiences.</p>
      <div className="mx-auto mt-8 grid max-w-6xl gap-5 md:grid-cols-3">
        {shop.packages.map((p) => (
          <article
            key={p.id}
            className="relative flex flex-col overflow-hidden border bg-white p-6 shadow-sm transition-transform hover:-translate-y-1"
            style={{ borderRadius: template.radius }}
          >
            {p.originalPrice && (
              <span className="absolute right-4 top-4 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white" style={{ backgroundColor: template.colors.primary }}>
                Save ₹{p.originalPrice - p.price}
              </span>
            )}
            <h3 className="text-xl font-bold" style={{ fontFamily: template.headingFont }}>{p.name}</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold" style={{ color: template.colors.primary }}>₹{p.price}</span>
              {p.originalPrice && <span className="text-muted-foreground text-sm line-through">₹{p.originalPrice}</span>}
            </div>
            <p className="text-muted-foreground mt-1 text-xs uppercase tracking-wider">{p.duration}</p>
            <ul className="mt-4 flex-1 space-y-2 text-sm">
              {p.services.map((s) => (
                <li key={s} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: template.colors.primary }} /> {s}</li>
              ))}
            </ul>
            <div className="mt-5 flex items-center gap-2">
              <a
                href="#appointment"
                className="flex-1 rounded-md py-2 text-center text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: template.colors.primary, borderRadius: template.radius }}
              >
                Book Package
              </a>
              <ShareButton title={`${p.name} — ${shop.name}`} label="" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
