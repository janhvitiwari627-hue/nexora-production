import { motion } from "framer-motion";
import { Heart, MessageCircle, Navigation, Phone } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function QuickActionBar({
  phone,
  whatsapp,
  lat,
  lng,
}: {
  phone: string;
  whatsapp: string;
  lat: number;
  lng: number;
}) {
  const [fav, setFav] = useState(false);
  const waNum = whatsapp.replace(/\D/g, "");
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className="border-border bg-card sticky top-0 z-30 border-b">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 md:gap-3 md:px-6">
        <button
          type="button"
          className="bg-gradient-cta text-primary-foreground order-1 inline-flex flex-1 items-center justify-center rounded-[var(--radius-button)] px-5 py-3 text-sm font-bold shadow-[var(--shadow-glow)] transition hover:brightness-110 md:flex-none md:px-8"
        >
          Book Now
        </button>
        <a
          href={`https://wa.me/${waNum}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat on WhatsApp"
          className="order-3 inline-flex items-center gap-1.5 rounded-[var(--radius-button)] bg-[#25D366] px-4 py-3 text-sm font-bold text-white transition hover:brightness-110 md:order-2"
        >
          <MessageCircle className="h-4 w-4" /> <span className="hidden sm:inline">WhatsApp</span>
        </a>
        <a
          href={`tel:${phone.replace(/\s/g, "")}`}
          aria-label="Call"
          className="order-4 inline-flex items-center gap-1.5 rounded-[var(--radius-button)] bg-[#0A66C2] px-4 py-3 text-sm font-bold text-white transition hover:brightness-110 md:order-3"
        >
          <Phone className="h-4 w-4" /> <span className="hidden sm:inline">Call</span>
        </a>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Directions"
          className="border-primary text-primary hover:bg-primary/5 order-5 inline-flex items-center gap-1.5 rounded-[var(--radius-button)] border bg-transparent px-4 py-3 text-sm font-bold transition md:order-4"
        >
          <Navigation className="h-4 w-4" /> <span className="hidden sm:inline">Directions</span>
        </a>
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => setFav((f) => !f)}
          aria-label={fav ? "Remove from favourites" : "Add to favourites"}
          className={cn(
            "order-2 grid h-11 w-11 place-items-center rounded-full border transition md:order-5",
            fav ? "bg-danger/10 border-danger" : "border-border bg-card hover:bg-muted",
          )}
        >
          <Heart className={cn("h-5 w-5", fav ? "fill-danger text-danger" : "text-heading")} />
        </motion.button>
      </div>
    </div>
  );
}
