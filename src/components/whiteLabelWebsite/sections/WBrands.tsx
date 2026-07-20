import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";

export function WBrands({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  return (
    <section className="bg-muted/30 px-6 py-10 md:px-12">
      <p className="text-muted-foreground text-center text-xs font-semibold uppercase tracking-widest">
        Brands We Trust
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
        {shop.brands.map((b, i) => (
          <div key={i} className="text-lg font-bold" style={{ fontFamily: template.font }}>
            {b.name}
          </div>
        ))}
      </div>
    </section>
  );
}
