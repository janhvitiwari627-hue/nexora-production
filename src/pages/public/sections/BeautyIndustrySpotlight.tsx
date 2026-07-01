import { useEffect, useRef, useState } from "react";
import { Play, Sparkles, ChevronLeft, ChevronRight, ExternalLink, Bookmark, Share2, X } from "lucide-react";

/**
 * Beauty Industry Spotlight — premium sponsored video showcase.
 * Netflix × Apple TV × Stripe partner-showcase aesthetic.
 * Not YouTube, not social reels. Muted hover-preview, click to open full viewer.
 */

type Tier = "Diamond" | "Platinum" | "Gold" | "Silver";

type SpotlightVideo = {
  id: string;
  youtubeId: string;
  title: string;
  brand: string;
  brandLogo?: string;
  category: string;
  duration: string;
  tier: Tier;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

const VIDEOS: SpotlightVideo[] = [
  {
    id: "sv1",
    youtubeId: "GIQn0quNk68",
    title: "The Bridal Glow Ritual",
    brand: "Lakmé Salon",
    category: "Bridal Beauty",
    duration: "0:45",
    tier: "Diamond",
    description: "A 4-step professional bridal ritual crafted by Lakmé's master artists — trusted by 8,000+ salons across India.",
    ctaLabel: "Explore Lakmé Pro",
    ctaHref: "/portal/brands",
  },
  {
    id: "sv2",
    youtubeId: "uelHwf8o7_U",
    title: "Precision Fade Masterclass",
    brand: "Wahl Professional",
    category: "Salon Equipment",
    duration: "1:12",
    tier: "Platinum",
    description: "The new Wahl Cordless Magic Clip — engineered for the perfect fade in under 8 minutes.",
    ctaLabel: "Shop Wahl",
    ctaHref: "/portal/brands",
  },
  {
    id: "sv3",
    youtubeId: "vS0Hku4SkQ8",
    title: "Colour Mastery, Redefined",
    brand: "L'Oréal Professionnel",
    category: "Hair Care",
    duration: "1:00",
    tier: "Diamond",
    description: "Majirel Glow — the industry-first light-reflecting colour system used in premium salons worldwide.",
    ctaLabel: "Discover Majirel",
    ctaHref: "/portal/brands",
  },
  {
    id: "sv4",
    youtubeId: "0E00Zuayv9Q",
    title: "Forest Spa Rituals",
    brand: "Forest Essentials",
    category: "Spa & Wellness",
    duration: "0:58",
    tier: "Gold",
    description: "Ayurvedic-inspired spa rituals crafted with pure botanicals for India's luxury wellness destinations.",
    ctaLabel: "Partner With Us",
    ctaHref: "/portal/brands",
  },
  {
    id: "sv5",
    youtubeId: "OPf0YbXqDm0",
    title: "Nail Art Trends 2026",
    brand: "OPI Professional",
    category: "Nail Studio",
    duration: "1:30",
    tier: "Platinum",
    description: "The season's most-booked nail looks — from chrome mirror finishes to sculpted 3D art.",
    ctaLabel: "View OPI Range",
    ctaHref: "/portal/brands",
  },
  {
    id: "sv6",
    youtubeId: "fLexgOxsZu0",
    title: "Bond Repair, Explained",
    brand: "Olaplex",
    category: "Hair Care",
    duration: "0:52",
    tier: "Gold",
    description: "The science of patented bond-building — now available at Olaplex partner salons.",
    ctaLabel: "Find A Salon",
    ctaHref: "/portal/brands",
  },
];

const TIER_STYLE: Record<Tier, string> = {
  Diamond: "bg-gradient-to-r from-cyan-400 to-blue-500 text-white",
  Platinum: "bg-gradient-to-r from-slate-300 to-slate-500 text-white",
  Gold: "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900",
  Silver: "bg-gradient-to-r from-slate-200 to-slate-400 text-slate-900",
};

export function BeautyIndustrySpotlight() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<SpotlightVideo | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  const toggleSave = (id: string) =>
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <section className="relative mx-auto mt-6 max-w-[1400px] px-5 sm:px-8">
      {/* Section chrome */}
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600 shadow-sm">
            <Sparkles className="h-3 w-3 text-amber-500" />
            Sponsored · Beauty Industry Spotlight
          </span>
          <h2 className="text-[26px] font-bold tracking-tight text-slate-900 sm:text-[32px]">
            Beauty Industry Spotlight
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 sm:text-[15px]">
            Discover products, brands and innovations trusted by beauty professionals.
          </p>
        </div>
        <div className="hidden gap-2 md:flex">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollBy(-1)}
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollBy(1)}
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {VIDEOS.map((v) => (
          <SpotlightCard
            key={v.id}
            video={v}
            saved={saved.has(v.id)}
            onSave={() => toggleSave(v.id)}
            onOpen={() => setActive(v)}
          />
        ))}
      </div>

      {active && (
        <FullViewer video={active} onClose={() => setActive(null)} />
      )}
    </section>
  );
}

/* ─────────────── Card ─────────────── */

function SpotlightCard({
  video,
  saved,
  onSave,
  onOpen,
}: {
  video: SpotlightVideo;
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio > 0.4),
      { threshold: [0, 0.4, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const showPreview = inView; // muted preview when visible

  return (
    <div
      ref={ref}
      className="w-[300px] shrink-0 snap-start sm:w-[380px] md:w-[420px]"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        type="button"
        onClick={onOpen}
        className="group relative block aspect-[16/10] w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-[0_18px_60px_-20px_rgba(15,23,42,0.35)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_28px_80px_-20px_rgba(37,99,235,0.35)]"
      >
        {/* Poster */}
        <img
          src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
          alt={video.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        />

        {/* Muted preview */}
        {showPreview && (
          <iframe
            aria-hidden
            tabIndex={-1}
            title=""
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${video.youtubeId}&modestbranding=1&playsinline=1&rel=0`}
            className={`pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-500 ${
              hover ? "opacity-100" : "opacity-0"
            }`}
            allow="autoplay; encrypted-media"
          />
        )}

        {/* Vignette */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/20 to-slate-900/40" />

        {/* Sponsored badge */}
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-800 shadow">
          <Sparkles className="h-3 w-3 text-amber-500" /> Sponsored
        </span>

        {/* Tier chip */}
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow ${TIER_STYLE[video.tier]}`}
        >
          {video.tier}
        </span>

        {/* Play glyph */}
        <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-slate-900 shadow-2xl transition duration-300 group-hover:scale-110">
          <Play className="h-7 w-7 translate-x-0.5 fill-current" />
        </span>

        {/* Bottom meta */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">
              {video.brand}
            </p>
            <p className="mt-0.5 truncate text-[15px] font-bold text-white">{video.title}</p>
          </div>
          <span className="shrink-0 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
            {video.duration}
          </span>
        </div>
      </button>

      {/* Card footer */}
      <div className="mt-3 flex items-center justify-between px-1">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-slate-900">{video.brand}</p>
          <p className="text-[11px] text-slate-500">{video.category}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={saved ? "Remove from saved" : "Save video"}
            onClick={onSave}
            className={`grid h-8 w-8 place-items-center rounded-full border transition ${
              saved
                ? "border-blue-200 bg-blue-50 text-blue-600"
                : "border-slate-200 bg-white text-slate-500 hover:text-slate-800"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
          </button>
          <button
            type="button"
            aria-label="Share"
            onClick={() =>
              typeof navigator !== "undefined" && navigator.share
                ? navigator.share({ title: video.title, url: window.location.href }).catch(() => {})
                : navigator.clipboard?.writeText(window.location.href)
            }
            className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:text-slate-800"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Full viewer ─────────────── */

function FullViewer({ video, onClose }: { video: SpotlightVideo; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const related = VIDEOS.filter((v) => v.id !== video.id).slice(0, 3);

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/85 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-slate-800 shadow-lg transition hover:scale-105"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="relative aspect-video w-full bg-black">
            <iframe
              title={video.title}
              src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
          <div className="flex flex-col gap-4 p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                Sponsored
              </span>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${TIER_STYLE[video.tier]}`}>
                {video.tier} Sponsor
              </span>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                {video.brand} · {video.category}
              </p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">{video.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{video.description}</p>
            </div>
            <a
              href={video.ctaHref}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              {video.ctaLabel} <ExternalLink className="h-4 w-4" />
            </a>

            <div className="mt-2 border-t border-slate-100 pt-4">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                Related videos
              </p>
              <div className="grid gap-3">
                {related.map((r) => (
                  <a
                    key={r.id}
                    href={`#${r.id}`}
                    onClick={(e) => e.preventDefault()}
                    className="group flex items-center gap-3 rounded-2xl border border-slate-100 p-2 transition hover:border-slate-200 hover:bg-slate-50"
                  >
                    <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-900">
                      <img
                        src={`https://img.youtube.com/vi/${r.youtubeId}/hqdefault.jpg`}
                        alt=""
                        className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
                      />
                      <Play className="absolute inset-0 m-auto h-4 w-4 fill-white text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-slate-900">{r.title}</p>
                      <p className="text-[11px] text-slate-500">{r.brand} · {r.duration}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
