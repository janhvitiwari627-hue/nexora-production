import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, Share2, X, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Lightbox({
  images,
  startIndex = 0,
  onClose,
}: {
  images: string[];
  startIndex?: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const [zoom, setZoom] = useState(1);

  const prev = useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );
  const next = useCallback(() => setIndex((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, prev, next]);

  useEffect(() => setZoom(1), [index]);

  if (!images.length) return null;
  const src = images[index];

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ url: src });
      } catch {
        /* cancelled */
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(src);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex flex-col bg-black/90"
      >
        <header className="flex items-center justify-between p-3 text-white">
          <span className="text-sm font-semibold">
            {index + 1} / {images.length}
          </span>
          <div className="flex items-center gap-1">
            <IconBtn onClick={() => setZoom((z) => Math.max(1, z - 0.25))} label="Zoom out">
              <ZoomOut className="h-4 w-4" />
            </IconBtn>
            <IconBtn onClick={() => setZoom((z) => Math.min(3, z + 0.25))} label="Zoom in">
              <ZoomIn className="h-4 w-4" />
            </IconBtn>
            <IconBtn onClick={share} label="Share">
              <Share2 className="h-4 w-4" />
            </IconBtn>
            <IconBtn label="Download" asChild>
              <a href={src} download target="_blank" rel="noreferrer">
                <Download className="h-4 w-4" />
              </a>
            </IconBtn>
            <IconBtn onClick={onClose} label="Close">
              <X className="h-5 w-5" />
            </IconBtn>
          </div>
        </header>

        <div className="relative flex flex-1 items-center justify-center overflow-hidden">
          {images.length > 1 && (
            <button
              type="button"
              aria-label="Previous"
              onClick={prev}
              className="absolute left-4 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <motion.img
            key={src}
            src={src}
            alt={`Image ${index + 1}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: zoom, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="max-h-full max-w-full object-contain"
            draggable={false}
          />
          {images.length > 1 && (
            <button
              type="button"
              aria-label="Next"
              onClick={next}
              className="absolute right-4 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto p-3">
            {images.map((thumb, i) => (
              <button
                key={thumb + i}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition",
                  i === index
                    ? "border-primary"
                    : "border-transparent opacity-60 hover:opacity-100",
                )}
              >
                <img src={thumb} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function IconBtn({
  children,
  onClick,
  label,
  asChild,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  label: string;
  asChild?: boolean;
}) {
  const cls =
    "grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition";
  if (asChild) {
    return (
      <span aria-label={label} className={cls}>
        {children}
      </span>
    );
  }
  return (
    <button type="button" aria-label={label} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
