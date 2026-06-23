import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";
import { SectionTitle } from "./WServices";
import { ShareButton } from "./ShareButton";
import { Calendar, Star } from "lucide-react";

export function WStaff({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  return (
    <section id="staff" className="px-6 py-16 md:px-12">
      <SectionTitle font={template.headingFont}>Meet The Team</SectionTitle>
      <p className="text-muted-foreground mt-2 text-center text-sm">Book directly with your favourite specialist.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {shop.staff.map((s) => (
          <article
            key={s.id}
            className="group overflow-hidden border bg-white text-center shadow-sm transition hover:shadow-md"
            style={{ borderRadius: template.radius }}
          >
            <div className="relative">
              <img src={s.image} alt={s.name} loading="lazy" className="aspect-square w-full object-cover" />
              <span
                className={`absolute right-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow ${
                  s.available ? "" : "opacity-80"
                }`}
                style={{ backgroundColor: s.available ? "#10B981" : "#6B7280" }}
              >
                {s.available ? "Available" : "Booked"}
              </span>
            </div>
            <div className="space-y-1 p-4">
              <h3 className="font-semibold">{s.name}</h3>
              <p className="text-muted-foreground text-sm">{s.designation}</p>
              {s.specialization && (
                <p className="text-[11px]" style={{ color: template.colors.secondary }}>{s.specialization}</p>
              )}
              <div className="text-muted-foreground flex items-center justify-center gap-3 text-xs">
                <span>{s.experience} yrs exp</span>
                {s.rating != null && (
                  <span className="inline-flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {s.rating}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <a
                  href={`#appointment?staff=${s.id}`}
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                  style={{ backgroundColor: template.colors.primary, borderRadius: template.radius }}
                >
                  <Calendar className="h-3 w-3" /> Book
                </a>
                <ShareButton title={`${s.name} at ${shop.name}`} label="" className="!px-2 !py-1.5" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
