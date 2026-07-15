import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";
import { SectionTitle } from "./WServices";

export function WGallery({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  return (
    <section className="bg-muted/30 px-6 py-16 md:px-12">
      <SectionTitle font={template.font}>Gallery</SectionTitle>
      <div className="mt-8 grid gap-3 md:grid-cols-3 lg:grid-cols-4">
        {shop.gallery.map((g, i) =>
          g.type === "video" ? (
            <video
              key={g.url}
              src={g.url}
              controls
              preload="metadata"
              className="aspect-square w-full bg-black object-cover"
              style={{ borderRadius: template.radius }}
            />
          ) : (
            <img
              key={g.url}
              src={g.url}
              alt={`Gallery ${i + 1}`}
              loading="lazy"
              className={`aspect-square w-full object-cover ${i % 5 === 0 ? "md:col-span-2 md:row-span-2 aspect-auto md:h-full" : ""}`}
              style={{ borderRadius: template.radius }}
            />
          ),
        )}
      </div>
    </section>
  );
}
