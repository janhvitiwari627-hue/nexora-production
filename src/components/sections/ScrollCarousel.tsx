import { useRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ScrollCarousel({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.85), behavior: "smooth" });
  };

  return (
    <div className="group/carousel relative">
      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scrollBy(-1)}
        className="absolute top-1/2 left-2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-border bg-card opacity-0 shadow-lg transition group-hover/carousel:opacity-100 md:grid md:hover:scale-105"
      >
        <ChevronLeft className="h-5 w-5 text-heading" />
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scrollBy(1)}
        className="absolute top-1/2 right-2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-border bg-card opacity-0 shadow-lg transition group-hover/carousel:opacity-100 md:grid md:hover:scale-105"
      >
        <ChevronRight className="h-5 w-5 text-heading" />
      </button>

      <motion.div
        ref={ref}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*]:snap-start"
        style={{ cursor: "grab" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
