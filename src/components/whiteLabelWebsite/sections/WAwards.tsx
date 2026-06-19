import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";
import { SectionTitle } from "./WServices";
import { Award } from "lucide-react";

export function WAwards({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  return (
    <section className="px-6 py-16 md:px-12">
      <SectionTitle font={template.font}>Awards & Recognition</SectionTitle>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {shop.awards.map((a, i) => (
          <div key={i} className="flex items-center gap-3 border bg-white px-5 py-3 shadow-sm" style={{ borderRadius: template.radius }}>
            <Award className="h-6 w-6" style={{ color: template.colors.secondary }} />
            <div>
              <div className="font-semibold">{a.title}</div>
              <div className="text-muted-foreground text-xs">{a.year}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
