import { useMemo, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Flame,
  Star,
  MapPin,
  BadgeCheck,
  Crown,
  Trophy,
  Medal,
  QrCode,
  CalendarCheck,
  MessageSquare,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import type { Enriched } from "./DiscoveryHome";

/* ============================================================
 * NEXORA — TRENDING THIS WEEK
 * Weighted leaderboard: 40% QR • 35% Bookings • 25% Reviews
 * Top 3 = premium podium cards (Gold / Silver / Bronze)
 * Rank 4–10 = compact scrollable cards
 * ============================================================ */

type ScoredShop = Enriched & {
  qrPaymentsWeek: number;
  bookingsWeek: number;
  reviewsWeek: number;
  weeklyScore: number;
  rank: number;
};

function nextMondayLabel(): string {
  const d = new Date();
  const day = d.getDay(); // 0=Sun
  const daysUntilMon = (8 - day) % 7 || 7;
  const next = new Date(d);
  next.setDate(d.getDate() + daysUntilMon);
  return next.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function useCountUp(target: number, durationMs = 1200): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return val;
}

function scoreShops(shops: Enriched[]): ScoredShop[] {
  // Derive weekly signals from existing enriched fields (mock but stable)
  const enriched = shops.map((s) => {
    const bookingsWeek = s.weeklyBookings ?? 0;
    // QR = 60–140% of bookings, biased by popularity
    const qrPaymentsWeek = Math.round(
      bookingsWeek * (0.6 + ((s.popularityScore ?? 50) / 100) * 0.8),
    );
    const reviewsWeek = Math.max(
      1,
      Math.round((s.verifiedReviews ?? s.review_count ?? 10) * 0.08),
    );
    return { ...s, qrPaymentsWeek, bookingsWeek, reviewsWeek };
  });

  const maxQR = Math.max(1, ...enriched.map((s) => s.qrPaymentsWeek));
  const maxBk = Math.max(1, ...enriched.map((s) => s.bookingsWeek));
  const maxRv = Math.max(1, ...enriched.map((s) => s.reviewsWeek));

  const scored = enriched.map((s) => ({
    ...s,
    weeklyScore:
      (s.qrPaymentsWeek / maxQR) * 40 +
      (s.bookingsWeek / maxBk) * 35 +
      (s.reviewsWeek / maxRv) * 25,
  }));

  scored.sort((a, b) => b.weeklyScore - a.weeklyScore);
  return scored.slice(0, 10).map((s, i) => ({ ...s, rank: i + 1 }));
}

const PODIUM = {
  1: {
    label: "Weekly Champion",
    emoji: "👑",
    ring: "ring-2 ring-amber-400/70",
    badge: "bg-gradient-to-r from-amber-400 to-yellow-500 text-white",
    glow: "shadow-[0_20px_60px_-20px_rgba(245,158,11,0.55)]",
    icon: Crown,
  },
  2: {
    label: "Rising Star",
    emoji: "🥈",
    ring: "ring-2 ring-slate-300",
    badge: "bg-gradient-to-r from-slate-300 to-slate-500 text-white",
    glow: "shadow-[0_20px_60px_-20px_rgba(100,116,139,0.45)]",
    icon: Trophy,
  },
  3: {
    label: "Customer Favorite",
    emoji: "🥉",
    ring: "ring-2 ring-orange-300",
    badge: "bg-gradient-to-r from-orange-400 to-amber-700 text-white",
    glow: "shadow-[0_20px_60px_-20px_rgba(234,88,12,0.45)]",
    icon: Medal,
  },
} as const;

export function TrendingThisWeek({ shops }: { shops: Enriched[] }) {
  const ranked = useMemo(() => scoreShops(shops), [shops]);
  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  const totalBookings = ranked.reduce((a, s) => a + s.bookingsWeek, 0);
  const totalQR = ranked.reduce((a, s) => a + s.qrPaymentsWeek, 0);
  const totalReviews = ranked.reduce((a, s) => a + s.reviewsWeek, 0);

  const cBookings = useCountUp(totalBookings);
  const cQR = useCountUp(totalQR);
  const cReviews = useCountUp(totalReviews);

  if (ranked.length === 0) return null;

  return (
    <section
      id="trending-this-week"
      className="scroll-mt-24 rounded-3xl border border-slate-200/70 bg-white p-5 sm:p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_60px_-30px_rgba(15,23,42,0.15)]"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-200">
            <Flame className="h-3.5 w-3.5" />
            Live Leaderboard
          </div>
          <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
            🔥 Trending This Week
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            The most booked, reviewed & QR-active beauty businesses on Nexora this week.
          </p>
        </div>
        <div className="text-right text-xs text-slate-500">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 ring-1 ring-slate-200">
            <RefreshCw className="h-3 w-3" />
            Updated weekly · next refresh {nextMondayLabel()}
          </div>
        </div>
      </div>

      {/* Live counters */}
      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-4">
        <Counter icon={<CalendarCheck className="h-4 w-4" />} label="Bookings" value={cBookings} tone="indigo" />
        <Counter icon={<QrCode className="h-4 w-4" />} label="QR Payments" value={cQR} tone="emerald" />
        <Counter icon={<MessageSquare className="h-4 w-4" />} label="New Reviews" value={cReviews} tone="rose" />
      </div>

      {/* Top 3 podium — desktop grid, mobile stacked */}
      <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {top3.map((s) => (
          <PodiumCard key={s.slug} s={s} />
        ))}
      </div>

      {/* Rank 4–10 */}
      {rest.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">
              Rank 4 – {3 + rest.length}
            </h3>
            <Link
              to="/search"
              search={{ sort: "popular" }}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              See full leaderboard <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="-mx-2 flex snap-x snap-mandatory gap-3 overflow-x-auto px-2 pb-2 [scrollbar-width:thin]">
            {rest.map((s) => (
              <CompactCard key={s.slug} s={s} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------- Sub-components ---------- */

function Counter({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "indigo" | "emerald" | "rose";
}) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
  } as const;
  return (
    <div className={`rounded-2xl px-3 py-3 sm:px-4 sm:py-4 ring-1 ${tones[tone]}`}>
      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium opacity-90">
        {icon}
        {label} this week
      </div>
      <div className="mt-1 text-xl sm:text-2xl font-semibold tabular-nums text-slate-900">
        {value.toLocaleString("en-IN")}
      </div>
    </div>
  );
}

function PodiumCard({ s }: { s: ScoredShop }) {
  const style = PODIUM[s.rank as 1 | 2 | 3];
  const RankIcon = style.icon;
  return (
    <Link
      to="/site/$slug"
      params={{ slug: s.slug }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl bg-white ${style.ring} ${style.glow} transition-transform hover:-translate-y-0.5`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {s.cover_image ? (
          <img
            src={s.cover_image}
            alt={s.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-200 to-slate-100" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />

        {/* Rank badge */}
        <div className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm ${style.badge}`}>
          <RankIcon className="h-3.5 w-3.5" />#{s.rank} · {style.label}
        </div>
        {s.is_verified && (
          <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 ring-1 ring-indigo-100">
            <BadgeCheck className="h-3 w-3" /> Verified
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
          <div className="min-w-0">
            <div className="truncate text-base font-semibold">{s.name}</div>
            <div className="mt-0.5 flex items-center gap-2 text-[11px] opacity-90">
              <span className="inline-flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {(s.rating ?? 0).toFixed(1)}
              </span>
              {typeof s.distance_km === "number" && (
                <span className="inline-flex items-center gap-0.5">
                  <MapPin className="h-3 w-3" />
                  {s.distance_km.toFixed(1)} km
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="text-[11px] text-slate-600">
          <span className="font-semibold text-slate-900 tabular-nums">
            {s.bookingsWeek}
          </span>{" "}
          bookings this week
        </div>
        <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition group-hover:bg-indigo-600">
          Book Now
        </span>
      </div>
    </Link>
  );
}

function CompactCard({ s }: { s: ScoredShop }) {
  return (
    <Link
      to="/site/$slug"
      params={{ slug: s.slug }}
      className="group relative flex w-[260px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {s.cover_image ? (
          <img
            src={s.cover_image}
            alt={s.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-200 to-slate-100" />
        )}
        <div className="absolute left-2 top-2 inline-flex items-center rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-bold text-slate-800 ring-1 ring-slate-200">
          #{s.rank}
        </div>
        {s.is_verified && (
          <div className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            <BadgeCheck className="h-3 w-3" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div className="truncate text-sm font-semibold text-slate-900">{s.name}</div>
        <div className="flex items-center gap-2 text-[11px] text-slate-600">
          <span className="inline-flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {(s.rating ?? 0).toFixed(1)}
          </span>
          {typeof s.distance_km === "number" && (
            <>
              <span className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-0.5">
                <MapPin className="h-3 w-3" />
                {s.distance_km.toFixed(1)} km
              </span>
            </>
          )}
        </div>
        <div className="mt-1 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            <span className="font-semibold tabular-nums text-slate-800">
              {s.bookingsWeek}
            </span>{" "}
            bookings
          </div>
          <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white transition group-hover:bg-indigo-600">
            Book
          </span>
        </div>
      </div>
    </Link>
  );
}
