import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { ScrollCarousel } from "./ScrollCarousel";

type VideoItem = {
  id: string;
  youtubeId: string;
  title: string;
  brand: string;
  brandColor: string;
};

const VIDEOS: VideoItem[] = [
  { id: "v1", youtubeId: "GIQn0quNk68", title: "Bridal Glow Routine", brand: "Lakmé", brandColor: "#FF4F8B" },
  { id: "v2", youtubeId: "uelHwf8o7_U", title: "The Perfect Fade", brand: "Wahl", brandColor: "#111" },
  { id: "v3", youtubeId: "vS0Hku4SkQ8", title: "Salon Color Mastery", brand: "L'Oréal", brandColor: "#0A2540" },
  { id: "v4", youtubeId: "0E00Zuayv9Q", title: "Spa Day Rituals", brand: "Forest Essentials", brandColor: "#22D3A0" },
  { id: "v5", youtubeId: "OPf0YbXqDm0", title: "Nail Art Trends 2026", brand: "OPI", brandColor: "#635BFF" },
  { id: "v6", youtubeId: "fLexgOxsZu0", title: "Bond Repair, Explained", brand: "Olaplex", brandColor: "#FFB36B" },
];

export function SponsoredVideosSection() {
  const [active, setActive] = useState<VideoItem | null>(null);

  return (
    <section className="mt-20 bg-[#0A2540] py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <span className="mb-2 inline-block rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/70">
              Sponsored
            </span>
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">
              Watch & Get Inspired
            </h2>
            <p className="mt-2 text-sm text-white/70">
              Style stories, tutorials and salon-grade tips from our partner brands.
            </p>
          </div>
        </div>

        <ScrollCarousel>
          {VIDEOS.map((v) => (
            <VideoCard key={v.id} video={v} onPlay={() => setActive(v)} />
          ))}
        </ScrollCarousel>
      </div>

      <Modal open={!!active} onClose={() => setActive(null)} size="xl" title={active?.title}>
        {active && (
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
            <iframe
              key={active.id}
              src={`https://www.youtube.com/embed/${active.youtubeId}?autoplay=1&rel=0`}
              title={active.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        )}
      </Modal>
    </section>
  );
}

function VideoCard({ video, onPlay }: { video: VideoItem; onPlay: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting && e.intersectionRatio > 0.5),
      { threshold: [0, 0.5, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-[300px] shrink-0 md:w-[360px]">
      <button
        type="button"
        onClick={onPlay}
        className="group relative block aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)] transition hover:scale-[1.02]"
      >
        <img
          src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
          alt={video.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
        />
        {inView && (
          <iframe
            aria-hidden
            tabIndex={-1}
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${video.youtubeId}&modestbranding=1&playsinline=1`}
            className="pointer-events-none absolute inset-0 h-full w-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            allow="autoplay; encrypted-media"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />
        <span className="absolute top-3 right-3 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          Sponsored
        </span>
        <span
          className="absolute bottom-3 left-3 rounded-lg px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-white shadow"
          style={{ background: video.brandColor }}
        >
          {video.brand}
        </span>
        <span className="absolute top-1/2 left-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#0A2540] shadow-lg transition group-hover:scale-110">
          <Play className="h-6 w-6 translate-x-0.5 fill-current" />
        </span>
      </button>
      <div className="mt-3 text-sm font-bold text-white">{video.title}</div>
    </div>
  );
}
