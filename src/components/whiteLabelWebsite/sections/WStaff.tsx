import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";
import { SectionTitle } from "./WServices";

export function WStaff({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  return (
    <section className="px-6 py-16 md:px-12">
      <SectionTitle font={template.font}>Meet The Team</SectionTitle>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {shop.staff.map(s => (
          <div key={s.id} className="text-center">
            <img src={s.image} alt={s.name} className="aspect-square w-full object-cover shadow-md" style={{ borderRadius: template.radius }} />
            <h3 className="mt-3 font-semibold">{s.name}</h3>
            <p className="text-muted-foreground text-sm">{s.designation}</p>
            <p className="text-xs" style={{ color: template.colors.primary }}>{s.experience} yrs exp</p>
          </div>
        ))}
      </div>
    </section>
  );
}
