import { useEffect, useRef, useState } from "react";
import { Play, ChevronLeft, ChevronRight, X, ExternalLink, Bookmark, Share2 } from "lucide-react";
import FadeIn from "../FadeIn";

type SponsoredVideo = {
  id: string;
  brand: string;
  initials: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  youtubeId: string;
  stats: { views: string; ctr: string; avgWatch: string; completion: string };
};

const VIDEOS: SponsoredVideo[] = [
  {
    id: "v1",
    brand: "LuxeLocks Pro",
    initials: "LP",
    title: "The Art of Salon Blowouts",
    description: "Watch master stylists create volume, shine and movement using LuxeLocks Pro formulas.",
    duration: "0:30",
    thumbnail: "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=900",
    youtubeId: "GIQn0quNk68",
    stats: { views: "84.5K", ctr: "4.64%", avgWatch: "18s", completion: "62%" },
  },
  {
    id: "v2",
    brand: "DermaElite",
    initials: "D",
    title: "Morning Skin Ritual",
    description: "A 60-second routine designed by dermatologists for radiant skin.",
    duration: "0:15",
    thumbnail: "https://images.pexels.com/photos/3997385/pexels-photo-3997385.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=900",
    youtubeId: "uelHwf8o7_U",
    stats: { views: "62.1K", ctr: "3.92%", avgWatch: "11s", completion: "71%" },
  },
  {
    id: "v3",
    brand: "StyleCraft Tools",
    initials: "ST",
    title: "Tools That Transform",
    description: "Inside the workshop where StyleCraft's precision shears are made.",
    duration: "0:45",
    thumbnail: "https://images.pexels.com/photos/3993459/pexels-photo-3993459.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=900",
    youtubeId: "vS0Hku4SkQ8",
    stats: { views: "41.8K", ctr: "5.10%", avgWatch: "27s", completion: "58%" },
  },
  {
    id: "v4",
    brand: "SereneSpa Organics",
    initials: "SO",
    title: "Spa at Home Experience",
    description: "Recreate a five-star spa ritual with botanical oils from SereneSpa.",
    duration: "0:30",
    thumbnail: "https://images.pexels.com/photos/3865711/pexels-photo-3865711.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=900",
    youtubeId: "0E00Zuayv9Q",
    stats: { views: "53.2K", ctr: "4.21%", avgWatch: "19s", completion: "65%" },
  },
  {
    id: "v5",
    brand: "ColorPop Nails",
    initials: "CN",
    title: "Nail Art Masterclass",
    description: "Learn signature nail art looks from ColorPop's lead artist.",
    duration: "1:00",
    thumbnail: "https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=900",
    youtubeId: "OPf0YbXqDm0",
    stats: { views: "29.4K", ctr: "6.02%", avgWatch: "33s", completion: "54%" },
  },
  {
    id: "v6",
    brand: "Nexora Collective",
    initials: "NC",
    title: "Beauty Brand Story",
    description: "Meet the independent makers powering the next chapter of premium beauty.",
    duration: "0:30",
    thumbnail: "https://images.pexels.com/photos/3997387/pexels-photo-3997387.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=900",
    youtubeId: "fLexgOxsZu0",
    stats: { views: "37.6K", ctr: "4.85%", avgWatch: "21s", completion: "60%" },
  },
];

export default function SponsoredVideos() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<SponsoredVideo | null>(null);

  const scroll = (dir: "l" | "r") => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "l" ? -el.clientWidth * 0.8 : el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <FadeIn>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Beauty Industry Spotlight
          </h2>
          <p className="mt-3 max-w-2xl text-slate-500">
            Discover products, brands and innovations trusted by beauty professionals.
          </p>
        </FadeIn>

        <div className="relative mt-8">
          <div
            ref={scrollerRef}
            className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4"
          >
            {VIDEOS.map((v, i) => (
              <FadeIn key={v.id} delay={i * 0.04}>
                <VideoCard video={v} onOpen={() => setActive(v)} />
              </FadeIn>
            ))}
          </div>

          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => scroll("l")}
              className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("r")}
              className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <VideoViewer
        video={active}
        all={VIDEOS}
        onClose={() => setActive(null)}
        onSelect={(v) => setActive(v)}
      />
    </section>
  );
}

function VideoCard({ video, onOpen }: { video: SponsoredVideo; onOpen: () => void }) {
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
    <div ref={ref} className="w-[200px] shrink-0 snap-start md:w-[230px]">
      <button
        type="button"
        onClick={onOpen}
        className="group relative block aspect-square w-full overflow-hidden rounded-2xl bg-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(15,23,42,0.06),0_24px_48px_-20px_rgba(15,23,42,0.24)]"
      >
        <img
          src={video.thumbnail}
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/20" />
        <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-700 backdrop-blur">
          Sponsored
        </span>
        <span className="absolute bottom-3 right-3 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          {video.duration}
        </span>
        <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-slate-900 shadow-lg transition group-hover:scale-110">
          <Play className="h-5 w-5 translate-x-0.5 fill-current" />
        </span>
      </button>
      <div className="mt-3 flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
          {video.initials}
        </div>
        <div className="text-xs font-semibold text-slate-900">{video.brand}</div>
      </div>
      <div className="mt-1.5 line-clamp-2 text-sm font-medium text-slate-700">{video.title}</div>
    </div>
  );
}

function VideoViewer({
  video,
  all,
  onClose,
  onSelect,
}: {
  video: SponsoredVideo | null;
  all: SponsoredVideo[];
  onClose: () => void;
  onSelect: (v: SponsoredVideo) => void;
}) {
  if (!video) return null;
  const related = all.filter((v) => v.id !== video.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-[1fr_320px]"
      >
        <div className="relative bg-black">
          <div className="aspect-video w-full">
            <iframe
              key={video.id}
              src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>

          <div className="bg-slate-900 px-6 py-5 text-white">
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-white text-[10px] font-bold text-slate-900">
                {video.initials}
              </div>
              <span className="text-sm font-medium">{video.brand}</span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/80">
                Sponsored
              </span>
            </div>
            <h3 className="mt-3 text-xl font-semibold">{video.title}</h3>
            <p className="mt-1 text-sm text-white/70">{video.description}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                <ExternalLink className="h-4 w-4" /> Visit Brand
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
              >
                <Bookmark className="h-4 w-4" /> Save
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full px-3 py-2.5 text-sm font-medium text-white/80 transition hover:text-white"
              >
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>
          </div>
        </div>

        <div className="relative max-h-[80vh] overflow-y-auto bg-white p-5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900">Related Videos</h4>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {related.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelect(v)}
                className="group flex w-full items-start gap-3 rounded-xl p-1 text-left transition hover:bg-slate-50"
              >
                <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg bg-slate-900">
                  <img src={v.thumbnail} alt="" className="h-full w-full object-cover" />
                  <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 text-[9px] font-semibold text-white">
                    {v.duration}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[11px] font-semibold text-indigo-600">{v.brand}</div>
                  <div className="line-clamp-2 text-sm font-medium text-slate-800 group-hover:text-slate-900">
                    {v.title}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Campaign Insights
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-500">Views</div>
                <div className="font-semibold text-slate-900">{video.stats.views}</div>
              </div>
              <div>
                <div className="text-slate-500">CTR</div>
                <div className="font-semibold text-slate-900">{video.stats.ctr}</div>
              </div>
              <div>
                <div className="text-slate-500">Avg watch</div>
                <div className="font-semibold text-slate-900">{video.stats.avgWatch}</div>
              </div>
              <div>
                <div className="text-slate-500">Completion</div>
                <div className="font-semibold text-slate-900">{video.stats.completion}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
