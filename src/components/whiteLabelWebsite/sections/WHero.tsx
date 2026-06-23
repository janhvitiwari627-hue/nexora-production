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

  // video hero — cinematic Royal Luxe treatment
  return (
    <section className={`relative grid h-[90vh] min-h-[640px] place-items-center overflow-hidden text-white ${animClass}`}>
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={shop.coverImage}
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="https://cdn.coverr.co/videos/coverr-luxury-spa-treatment-2417/1080p.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black" />
      <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 50% 60%, rgba(212,175,55,0.25), transparent 55%)" }} />
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)" }} />

      <div className="royal-rise relative z-10 max-w-3xl space-y-6 px-6 text-center">
        <div className="flex items-center justify-center gap-3 text-[10px] font-semibold uppercase tracking-[0.5em]" style={{ color: template.colors.secondary }}>
          <span className="h-px w-10" style={{ background: template.colors.secondary }} />
          {shop.category} · Est. 2015
          <span className="h-px w-10" style={{ background: template.colors.secondary }} />
        </div>
        <h1 className="text-5xl font-light leading-[1.05] md:text-7xl lg:text-8xl" style={{ fontFamily: template.headingFont }}>
          <span className="royal-gold-text">{shop.name}</span>
        </h1>
        <div className="royal-divider" style={{ background: "linear-gradient(90deg, transparent, #d4af37, transparent)" }} />
        <p className="mx-auto max-w-xl text-base font-light tracking-wide opacity-85 md:text-lg">{shop.tagline}</p>
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <Button size="lg" className="royal-shimmer relative overflow-hidden border-0 px-8 py-6 text-sm font-medium uppercase tracking-[0.25em]" style={{ backgroundColor: template.colors.secondary, color: "#0A0A0A", borderRadius: 2 }} asChild>
            <a href="#appointment"><Calendar className="h-4 w-4" /> Reserve Your Visit</a>
          </Button>
          <Button size="lg" variant="outline" className="border px-8 py-6 text-sm font-medium uppercase tracking-[0.25em] text-white hover:bg-white/10" style={{ borderColor: "rgba(212,175,55,0.5)", borderRadius: 2, backgroundColor: "transparent" }} asChild>
            <a href="#services">Discover Services</a>
          </Button>
          <ShareButton title={`${shop.name} — ${shop.tagline}`} label="Share" />
        </div>
        <div className="flex items-center justify-center gap-2 pt-6 text-xs opacity-75">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-medium tracking-widest">{shop.rating} · {shop.reviewCount} GUEST REVIEWS</span>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.4em] opacity-60">
        Scroll
      </div>
    </section>
  );
}
