import { useEffect, useState } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef } from "react";
import { Crown, Trophy } from "lucide-react";

type Entry = {
  rank: number;
  name: string;
  area: string;
  bookings: number;
  growth: number;
  image: string;
};

const TOP: Entry[] = [
  {
    rank: 1,
    name: "Looks Unisex Salon",
    area: "Malviya Nagar",
    bookings: 482,
    growth: 38,
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80",
  },
  {
    rank: 2,
    name: "Bliss Spa & Wellness",
    area: "C-Scheme",
    bookings: 421,
    growth: 24,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80",
  },
  {
    rank: 3,
    name: "The Barber Co.",
    area: "Vaishali Nagar",
    bookings: 376,
    growth: 19,
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80",
  },
];

const REST: Entry[] = [
  { rank: 4, name: "Nail Boutique", area: "Raja Park", bookings: 312, growth: 12, image: "" },
  { rank: 5, name: "Bridal by Aanya", area: "C-Scheme", bookings: 288, growth: 15, image: "" },
  { rank: 6, name: "Studio Noir", area: "Mansarovar", bookings: 264, growth: 9, image: "" },
  {
    rank: 7,
    name: "Halo Hair Lounge",
    area: "Vaishali Nagar",
    bookings: 241,
    growth: 7,
    image: "",
  },
  { rank: 8, name: "Pure Skin Clinic", area: "Malviya Nagar", bookings: 218, growth: 5, image: "" },
  { rank: 9, name: "Urban Cuts", area: "Jagatpura", bookings: 199, growth: 4, image: "" },
  { rank: 10, name: "Glamour Studio", area: "Tonk Road", bookings: 184, growth: 3, image: "" },
];

const MEDAL_COLOR: Record<number, string> = {
  1: "#D4AF37",
  2: "#C0C0C0",
  3: "#CD7F32",
};

function nextMondayMs() {
  const now = new Date();
  const next = new Date(now);
  const day = now.getDay(); // 0 Sun .. 1 Mon
  const daysUntilMon = (8 - day) % 7 || 7;
  next.setDate(now.getDate() + daysUntilMon);
  next.setHours(0, 0, 0, 0);
  return next.getTime() - now.getTime();
}

function useCountdown() {
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    setMs(nextMondayMs());
    const id = setInterval(() => setMs(nextMondayMs()), 1000);
    return () => clearInterval(id);
  }, []);
  if (ms === null) return "—";
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms / 3600000) % 24);
  const m = Math.floor((ms / 60000) % 60);
  const s = Math.floor((ms / 1000) % 60);
  return `${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

function Counter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toLocaleString("en-IN"));
  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, value, { duration: 1.4, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [inView, value, mv]);
  return <motion.span ref={ref}>{rounded}</motion.span>;
}

export function TrendingSection() {
  const countdown = useCountdown();

  return (
    <section className="mx-auto max-w-7xl px-4 pt-20 md:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFB36B] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0A2540]">
            <Trophy className="h-3 w-3" /> Leaderboard
          </div>
          <h2 className="text-3xl font-black tracking-tight text-heading md:text-4xl">
            Trending this week
          </h2>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div>Resets every Monday</div>
          <div className="mt-1 font-mono font-bold text-heading">{countdown}</div>
        </div>
      </div>

      {/* Top 3 */}
      <div className="grid gap-4 md:grid-cols-3">
        {TOP.map((e) => (
          <article
            key={e.rank}
            className="relative overflow-hidden rounded-[var(--radius-card-lg)] border border-border bg-card p-5 shadow-[var(--shadow-card)]"
          >
            <span
              className="absolute -top-8 -right-8 grid h-28 w-28 place-items-center rounded-full text-3xl font-black text-white shadow-xl"
              style={{ background: MEDAL_COLOR[e.rank] }}
            >
              <span className="translate-y-2 translate-x-[-12px]">#{e.rank}</span>
            </span>
            {e.rank === 1 && (
              <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-[#0A2540] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">
                <Crown className="h-3 w-3" /> Weekly Champion
              </span>
            )}
            <img
              src={e.image}
              alt={e.name}
              className="mt-6 h-32 w-full rounded-xl object-cover"
              loading="lazy"
            />
            <h3 className="mt-3 text-lg font-bold text-heading">{e.name}</h3>
            <p className="text-xs text-muted-foreground">{e.area}</p>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Bookings
                </div>
                <div className="text-2xl font-black text-heading">
                  <Counter value={e.bookings} />
                </div>
              </div>
              <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-bold text-success">
                +{e.growth}%
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* 4-10 */}
      <ul className="mt-6 divide-y divide-border overflow-hidden rounded-[var(--radius-card-lg)] border border-border bg-card shadow-[var(--shadow-card)]">
        {REST.map((e) => (
          <li
            key={e.rank}
            className="flex items-center gap-4 px-5 py-3 transition hover:bg-muted/50"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-sm font-black text-heading">
              {e.rank}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-heading">{e.name}</div>
              <div className="text-xs text-muted-foreground">{e.area}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-heading">
                <Counter value={e.bookings} />
              </div>
              <div className="text-[10px] text-muted-foreground">weekly bookings</div>
            </div>
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-bold text-success">
              +{e.growth}%
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
