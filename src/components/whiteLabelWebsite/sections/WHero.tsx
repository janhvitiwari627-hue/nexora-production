import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";
import { Button } from "@/components/ui/button";
import { ShareButton } from "./ShareButton";
import { Calendar, Star } from "lucide-react";

export function WHero({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  const animClass =
    template.animation === "slide" ? "animate-slide-in-right" :
    template.animation === "scale" ? "animate-scale-in" : "animate-fade-in";

  if (template.hero === "split") {
    return (
      <section className={`grid items-center gap-8 px-6 py-16 md:grid-cols-2 md:px-12 md:py-24 ${animClass}`}>
        <div className="space-y-5">
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: template.colors.primary }}>
            {shop.category} · {shop.city}
          </div>
          <h1 className="text-4xl font-bold leading-tight md:text-6xl" style={{ fontFamily: template.headingFont }}>
            {shop.name}
          </h1>
          <p className="text-muted-foreground text-lg">{shop.tagline}</p>
          <div className="flex items-center gap-3 text-sm">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />{" "}
            <span className="font-semibold">{shop.rating}</span> · {shop.reviewCount} reviews
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" style={{ backgroundColor: template.colors.primary, color: "white", borderRadius: template.radius }} asChild>
              <a href="#appointment"><Calendar className="h-4 w-4" /> Book Now</a>
            </Button>
            <Button size="lg" variant="outline" style={{ borderRadius: template.radius }} asChild>
              <a href="#services">View Services</a>
            </Button>
            <ShareButton title={`${shop.name} — ${shop.tagline}`} label="Share Website" />
          </div>
        </div>
        <img
          src={shop.coverImage}
          alt={shop.name}
          loading="eager"
          className="aspect-[4/5] w-full object-cover shadow-2xl"
          style={{ borderRadius: template.radius }}
        />
      </section>
    );
  }

  if (template.hero === "fullBleed") {
    return (
      <section className={`relative grid h-[70vh] place-items-center overflow-hidden text-white ${animClass}`}>
        <img src={shop.coverImage} alt={shop.name} loading="eager" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/30" />
        <div className="relative z-10 max-w-2xl space-y-4 px-6 text-center">
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: template.colors.accent }}>
            {shop.category} · {shop.city}
          </div>
          <h1 className="text-5xl font-bold md:text-7xl" style={{ fontFamily: template.headingFont }}>
            {shop.name}
          </h1>
          <p className="text-xl">{shop.tagline}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" style={{ backgroundColor: template.colors.primary, borderRadius: template.radius }} asChild>
              <a href="#appointment">Book Appointment</a>
            </Button>
            <ShareButton title={`${shop.name} — ${shop.tagline}`} label="Share Website" />
          </div>
        </div>
      </section>
    );
  }

  // video hero — coverImage as poster + dark overlay
  return (
    <section className={`relative grid h-[80vh] place-items-center overflow-hidden text-white ${animClass}`}>
      <img src={shop.coverImage} alt={shop.name} loading="eager" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/90" />
      <div className="relative z-10 max-w-3xl space-y-5 px-6 text-center">
        <div className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: template.colors.secondary }}>
          {shop.category} · Est. 2015
        </div>
        <h1 className="text-5xl font-bold leading-tight md:text-7xl" style={{ fontFamily: template.headingFont }}>
          {shop.name}
        </h1>
        <p className="mx-auto max-w-xl text-lg opacity-90">{shop.tagline}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" style={{ backgroundColor: template.colors.secondary, color: "#0A0A0A", borderRadius: template.radius }} asChild>
            <a href="#appointment"><Calendar className="h-4 w-4" /> Reserve Your Visit</a>
          </Button>
          <ShareButton title={`${shop.name} — ${shop.tagline}`} label="Share" />
        </div>
      </div>
    </section>
  );
}
