import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";
import { SectionTitle } from "./WServices";
import { ShareButton } from "./ShareButton";
import { Check, Star } from "lucide-react";

export function WMembership({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  return (
    <section id="membership" className="px-6 py-16 md:px-12">
      <SectionTitle font={template.headingFont}>Membership Plans</SectionTitle>
      <p className="text-muted-foreground mt-2 text-center text-sm">Silver · Gold · Platinum — pick the perks that suit you.</p>
      <div className="mx-auto mt-8 grid max-w-5xl gap-5 md:grid-cols-3">
        {shop.memberships.map((m) => {
          const featured = m.popular;
          return (
            <article
              key={m.id}
              className={`relative flex flex-col p-6 transition ${featured ? "scale-[1.03] shadow-2xl" : "border shadow"}`}
              style={{
                borderRadius: template.radius,
                backgroundColor: featured ? template.colors.primary : "white",
                color: featured ? "white" : "inherit",
              }}
            >
              {featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow" style={{ color: template.colors.primary }}>
                  <Star className="mr-1 inline h-3 w-3 fill-current" /> Most Popular
                </span>
              )}
              <div className="text-xs uppercase tracking-widest opacity-80">{m.tier}</div>
              <div className="mt-2 text-4xl font-bold">
                ₹{m.price}<span className="text-base font-normal opacity-70">/mo</span>
              </div>
              <ul className="mt-5 flex-1 space-y-2 text-sm">
                {m.benefits.map((b, j) => (
                  <li key={j} className="flex gap-2"><Check className="h-4 w-4 shrink-0" /> {b}</li>
                ))}
              </ul>
              <div className="mt-5 flex items-center gap-2">
                <a
                  href="#appointment"
                  className="flex-1 rounded-md py-2 text-center text-sm font-semibold transition hover:opacity-90"
                  style={{
                    backgroundColor: featured ? "white" : template.colors.primary,
                    color: featured ? template.colors.primary : "white",
                    borderRadius: template.radius,
                  }}
                >
                  Join {m.tier}
                </a>
                <ShareButton title={`${m.tier} membership at ${shop.name}`} label="" className={featured ? "!text-white !bg-white/10" : ""} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
