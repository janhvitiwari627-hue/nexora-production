import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";
import { SectionTitle } from "./WServices";
import { Check } from "lucide-react";

export function WMembership({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  return (
    <section className="px-6 py-16 md:px-12">
      <SectionTitle font={template.font}>Membership Plans</SectionTitle>
      <div className="mx-auto mt-8 grid max-w-5xl gap-5 md:grid-cols-3">
        {shop.memberships.map((m, i) => (
          <div key={m.id} className={`p-6 ${i === 1 ? "scale-105 shadow-2xl" : "border shadow"}`} style={{ borderRadius: template.radius, backgroundColor: i === 1 ? template.colors.primary : "white", color: i === 1 ? "white" : "inherit" }}>
            <div className="text-xs uppercase tracking-widest opacity-70">{m.tier}</div>
            <div className="mt-2 text-4xl font-bold">₹{m.price}<span className="text-base font-normal opacity-70">/mo</span></div>
            <ul className="mt-5 space-y-2 text-sm">
              {m.benefits.map((b, j) => <li key={j} className="flex gap-2"><Check className="h-4 w-4 shrink-0" /> {b}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
