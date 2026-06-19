import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";
import { Button } from "@/components/ui/button";
import { Calendar, Star } from "lucide-react";

export function WHero({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  const variant = template.hero;
  if (variant === "split") {
    return (
      <section className="grid items-center gap-8 px-6 py-16 md:grid-cols-2 md:px-12 md:py-24">
        <div className="space-y-5">
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: template.colors.primary }}>{shop.category}</div>
          <h1 className="text-4xl font-bold leading-tight md:text-6xl" style={{ fontFamily: template.font }}>{shop.name}</h1>
          <p className="text-muted-foreground text-lg">{shop.tagline}</p>
          <div className="flex items-center gap-3 text-sm">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> <span className="font-semibold">{shop.rating}</span> · {shop.reviewCount} reviews
          </div>
          <div className="flex gap-3">
            <Button size="lg" style={{ backgroundColor: template.colors.primary, color: "white", borderRadius: template.radius }}><Calendar className="h-4 w-4" /> Book Now</Button>
            <Button size="lg" variant="outline" style={{ borderRadius: template.radius }}>View Services</Button>
          </div>
        </div>
        <img src={shop.coverImage} alt={shop.name} className="aspect-[4/5] w-full object-cover shadow-2xl" style={{ borderRadius: template.radius }} />
      </section>
    );
  }
  if (variant === "fullBleed") {
    return (
      <section className="relative grid h-[70vh] place-items-center overflow-hidden text-white">
        <img src={shop.coverImage} alt={shop.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/30" />
        <div className="relative z-10 max-w-2xl space-y-4 px-6 text-center">
          <h1 className="text-5xl font-bold md:text-7xl" style={{ fontFamily: template.font }}>{shop.name}</h1>
          <p className="text-xl">{shop.tagline}</p>
          <Button size="lg" style={{ backgroundColor: template.colors.secondary, borderRadius: template.radius }}>Book Appointment</Button>
        </div>
      </section>
    );
  }
  return (
    <section className="px-6 py-20 text-center md:py-28">
      <h1 className="mx-auto max-w-3xl text-5xl font-bold md:text-7xl" style={{ fontFamily: template.font }}>{shop.name}</h1>
      <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-xl">{shop.tagline}</p>
      <img src={shop.coverImage} alt={shop.name} className="mx-auto mt-10 aspect-video max-w-4xl w-full object-cover shadow-xl" style={{ borderRadius: template.radius }} />
    </section>
  );
}
