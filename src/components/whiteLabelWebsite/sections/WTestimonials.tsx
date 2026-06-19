import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";
import { SectionTitle } from "./WServices";
import { Quote } from "lucide-react";

export function WTestimonials({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  return (
    <section className="px-6 py-16 md:px-12">
      <SectionTitle font={template.font}>What People Say</SectionTitle>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {shop.testimonials.map(t => (
          <div key={t.id} className="border bg-white p-6 shadow-sm" style={{ borderRadius: template.radius }}>
            <Quote className="h-6 w-6" style={{ color: template.colors.primary }} />
            <p className="mt-3 text-sm italic">"{t.text}"</p>
            <div className="mt-4 font-semibold">— {t.author}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
