import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";

export function WServices({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  return (
    <section className="px-6 py-16 md:px-12">
      <SectionTitle font={template.font}>Our Services</SectionTitle>
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {shop.services.map(s => (
          <div key={s.id} className="overflow-hidden border bg-white shadow-sm transition-transform hover:-translate-y-1" style={{ borderRadius: template.radius }}>
            {s.image && <img src={s.image} alt={s.name} className="aspect-video w-full object-cover" />}
            <div className="space-y-2 p-5">
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-semibold">{s.name}</h3>
                <span className="font-bold" style={{ color: template.colors.primary }}>₹{s.price}</span>
              </div>
              <p className="text-muted-foreground text-sm">{s.desc}</p>
              <div className="text-xs text-muted-foreground">{s.duration} min</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SectionTitle({ children, font }: { children: React.ReactNode; font?: string }) {
  return <h2 className="text-center text-3xl font-bold md:text-4xl" style={{ fontFamily: font }}>{children}</h2>;
}
