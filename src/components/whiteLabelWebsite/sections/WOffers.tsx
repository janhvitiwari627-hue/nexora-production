import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";
import { SectionTitle } from "./WServices";

export function WOffers({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  return (
    <section className="px-6 py-16 md:px-12">
      <SectionTitle font={template.font}>Current Offers</SectionTitle>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {shop.offers.map(o => (
          <div key={o.id} className="relative overflow-hidden border-2 border-dashed p-6" style={{ borderRadius: template.radius, borderColor: template.colors.primary }}>
            <div className="absolute right-0 top-0 px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: template.colors.primary }}>{o.discount} OFF</div>
            <h3 className="text-xl font-bold">{o.title}</h3>
            <p className="text-muted-foreground mt-2">{o.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
