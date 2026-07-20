import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";
import { SectionTitle } from "./WServices";
import { ShareButton } from "./ShareButton";

export function WAbout({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  return (
    <section id="about" className="px-6 py-16 md:px-12">
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
        <img
          src={shop.coverImage}
          alt={`About ${shop.name}`}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover shadow-lg"
          style={{ borderRadius: template.radius }}
        />
        <div className="space-y-4">
          <SectionTitle font={template.headingFont}>About {shop.name}</SectionTitle>
          <p className="text-muted-foreground leading-relaxed">{shop.about}</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Stat
              label="Years"
              value={`${new Date().getFullYear() - 2015}+`}
              color={template.colors.primary}
            />
            <Stat label="Reviews" value={`${shop.reviewCount}+`} color={template.colors.primary} />
            <Stat label="Rating" value={`${shop.rating}★`} color={template.colors.primary} />
          </div>
          <ShareButton title={`${shop.name} — ${shop.tagline}`} label="Share Website" />
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg border bg-white px-4 py-2 shadow-sm">
      <div className="text-lg font-bold" style={{ color }}>
        {value}
      </div>
      <div className="text-muted-foreground text-xs uppercase tracking-wider">{label}</div>
    </div>
  );
}
