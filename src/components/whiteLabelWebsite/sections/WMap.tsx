import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";

export function WMap({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  const { lat, lng } = shop.location;
  const bbox = `${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}`;
  return (
    <section className="px-6 pb-16 md:px-12">
      <div
        className="mx-auto max-w-5xl overflow-hidden shadow-lg"
        style={{ borderRadius: template.radius }}
      >
        <iframe
          title={`Map of ${shop.name}`}
          className="h-72 w-full md:h-96"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`}
          loading="lazy"
        />
      </div>
    </section>
  );
}
