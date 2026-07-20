import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";
import { SectionTitle } from "./WServices";
import { ShareButton } from "./ShareButton";

export function WOffers({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  return (
    <section id="offers" className="px-6 py-16 md:px-12">
      <SectionTitle font={template.headingFont}>Current Offers</SectionTitle>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {shop.offers.map((o) => (
          <article
            key={o.id}
            className="relative overflow-hidden border-2 border-dashed p-6"
            style={{ borderRadius: template.radius, borderColor: template.colors.primary }}
          >
            <div
              className="absolute right-0 top-0 px-4 py-2 text-sm font-bold text-white"
              style={{ backgroundColor: template.colors.primary }}
            >
              {o.discount} OFF
            </div>
            <h3 className="text-xl font-bold">{o.title}</h3>
            <p className="text-muted-foreground mt-2">{o.description}</p>
            <div className="mt-4 flex items-center gap-2">
              <a
                href="#appointment"
                className="rounded-md px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: template.colors.primary, borderRadius: template.radius }}
              >
                Claim Offer
              </a>
              <ShareButton title={`${o.title} at ${shop.name}`} label="Share Offer" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
