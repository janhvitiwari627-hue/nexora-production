import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function HeroCarousel({
  images,
  name,
  category,
  area,
  city,
  badges,
  verified,
}: {
  images: string[];
  name: string;
  category: string;
  area: string;
  city: string;
  badges: string[];
  verified: boolean;
}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => setI((p) => (p + 1) % images.length), 4000);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div className="relative w-full overflow-hidden bg-[#0A2540]" style={{ aspectRatio: "3 / 1" }}>
      <AnimatePresence mode="sync">
        <motion.img
          key={i}
          src={images[i]}
          alt={name}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 px-4 pb-8 md:px-10 md:pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
                <BadgeCheck className="h-3 w-3" /> Verified
              </span>
            )}
            {badges.map((b) => (
              <span
                key={b}
                className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur"
              >
                {b}
              </span>
            ))}
          </div>
          <h1
            className="text-3xl font-black tracking-tight text-white md:text-5xl"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {name}
          </h1>
          <p className="mt-2 text-sm text-white/80 md:text-base">
            {category} · {area}, {city}
          </p>
        </div>
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => setI(idx)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                idx === i ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
