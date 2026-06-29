import { Link, useParams } from "@tanstack/react-router";
import { PublicPageHeader } from "@/components/shared/PublicPageHeader";
import {
  Award,
  BadgeCheck,
  Building2,
  Crown,
  Handshake,
  IndianRupee,
  MapPin,
  Medal,
  Network,
  Rocket,
  Share2,
  Sparkles,
  Star,
  Store,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";

// Mock directory of DBPs by slug. Replace with backend fetch later.
const PARTNERS: Record<
  string,
  {
    name: string;
    district: string;
    state: string;
    photo?: string;
    tagline: string;
    joinedOn: string;
    activeShops: number;
    totalShops: number;
    revenueGenerated: number;
    partnerEarnings: number;
    rank: number;
    badge: string;
    story: string;
    achievements: { icon: typeof Trophy; label: string; sub: string }[];
    coverage: { area: string; shops: number }[];
    milestonesUnlocked: string[];
    recognition: { title: string; date: string }[];
  }
> = {
  "rahul-yadav-jaipur": {
    name: "Rahul Yadav",
    district: "Jaipur",
    state: "Rajasthan",
    tagline: "Connecting 200+ salons across Pink City",
    joinedOn: "Jan 2025",
    activeShops: 218,
    totalShops: 246,
    revenueGenerated: 1850000,
    partnerEarnings: 185000,
    rank: 3,
    badge: "Growth Builder",
    story:
      "Salon distribution se shuru karke aaj Jaipur ke 200+ salons ko Nexora se connect kiya. Har shop ki digital growth mera mission hai — bookings, customers aur reviews sab ek platform par.",
    achievements: [
      { icon: Trophy, label: "Top 5 District Partner", sub: "Q1 2025" },
      { icon: Medal, label: "100 Shops Milestone", sub: "Tablet Reward Unlocked" },
      { icon: BadgeCheck, label: "Growth Builder Badge", sub: "Verified Leadership" },
      { icon: Star, label: "Best Onboarding Streak", sub: "30 shops / month" },
    ],
    coverage: [
      { area: "Vaishali Nagar", shops: 62 },
      { area: "Malviya Nagar", shops: 48 },
      { area: "C-Scheme", shops: 41 },
      { area: "Mansarovar", shops: 37 },
      { area: "Jagatpura", shops: 30 },
    ],
    milestonesUnlocked: ["25 Shops", "50 Shops", "100 Shops"],
    recognition: [
      { title: "Featured in Hall of Fame", date: "Mar 2025" },
      { title: "District Authority Recognition", date: "Apr 2025" },
      { title: "Leadership Circle Invite", date: "May 2025" },
    ],
  },
};

const FALLBACK = PARTNERS["rahul-yadav-jaipur"];

function formatINR(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

export default function DistrictPartnerProfilePage() {
  const { slug } = useParams({ from: "/district-business-partner/$slug" });
  const partner = PARTNERS[slug] ?? FALLBACK;

  const publicUrl = `nexora.app/dbp/${slug}`;

  return (
  <div className="min-h-screen bg-background text-foreground">
    <PublicPageHeader />
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 px-6 py-20 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-rose-950/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.15),transparent_60%)]" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-6 text-center md:flex-row md:items-end md:text-left">
          <div className="relative">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-5xl font-extrabold text-white shadow-2xl ring-4 ring-white dark:ring-background">
              {partner.name
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)}
            </div>
            <span className="absolute -bottom-2 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
              <Crown className="h-3.5 w-3.5" /> DBP
            </span>
          </div>

          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm backdrop-blur dark:bg-white/10 dark:text-amber-200">
              <Trophy className="h-3.5 w-3.5" /> Hall of Fame · Rank #{partner.rank}
            </div>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">
              {partner.name}
            </h1>
            <p className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" /> {partner.district}, {partner.state} · Joined {partner.joinedOn}
            </p>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">{partner.tagline}</p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow">
                <BadgeCheck className="h-3.5 w-3.5" /> {partner.badge}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-white/70 px-3 py-1.5 text-xs font-semibold text-amber-800 backdrop-blur dark:border-amber-700 dark:bg-white/5 dark:text-amber-200">
                <Sparkles className="h-3.5 w-3.5" /> Leadership Circle
              </span>
              <button className="inline-flex items-center gap-1 rounded-full border border-border bg-white/70 px-3 py-1.5 text-xs font-semibold backdrop-blur dark:bg-white/5">
                <Share2 className="h-3.5 w-3.5" /> {publicUrl}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PERFORMANCE SUMMARY */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold md:text-3xl">Performance Summary</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Public metrics — revenue generated for company, shops activated and partner rewards. Salon internal financials are private.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Store, label: "Active Shops", value: partner.activeShops.toString(), sub: `of ${partner.totalShops} added` },
              { icon: TrendingUp, label: "Revenue Generated", value: formatINR(partner.revenueGenerated), sub: "Lifetime" },
              { icon: IndianRupee, label: "Partner Earnings", value: formatINR(partner.partnerEarnings), sub: "Rewards + Growth Share" },
              { icon: Trophy, label: "District Rank", value: `#${partner.rank}`, sub: "in state leaderboard" },
            ].map(({ icon: Icon, label, value, sub }) => (
              <div key={label} className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md">
                <Icon className="h-6 w-6 text-amber-600" />
                <div className="mt-3 text-2xl font-extrabold">{value}</div>
                <div className="text-sm font-semibold">{label}</div>
                <div className="text-xs text-muted-foreground">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUCCESS STORY */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-5xl rounded-3xl border border-border bg-gradient-to-br from-card to-muted/30 p-8 shadow-sm md:p-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
            <Rocket className="h-3.5 w-3.5" /> Success Story
          </div>
          <h2 className="mt-4 text-2xl font-bold md:text-3xl">How {partner.name.split(" ")[0]} Built {partner.district}</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{partner.story}</p>
        </div>
      </section>

      {/* ACHIEVEMENTS + DISTRICT COVERAGE */}
      <section className="px-6 pb-16">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <div className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-amber-600" />
              <h2 className="text-xl font-bold">Achievements</h2>
            </div>
            <ul className="mt-5 space-y-3">
              {partner.achievements.map(({ icon: Icon, label, sub }) => (
                <li key={label} className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">{label}</div>
                    <div className="text-xs text-muted-foreground">{sub}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-amber-600" />
              <h2 className="text-xl font-bold">District Coverage</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Active shops across {partner.district}</p>
            <ul className="mt-5 space-y-3">
              {partner.coverage.map(({ area, shops }) => {
                const max = Math.max(...partner.coverage.map((c) => c.shops));
                const pct = Math.round((shops / max) * 100);
                return (
                  <li key={area}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{area}</span>
                      <span className="text-muted-foreground">{shops} shops</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* HALL OF FAME STATUS + RECOGNITION SHOWCASE */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-8 dark:border-amber-900/40 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-rose-950/20 md:p-12">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-3 py-1 text-xs font-bold text-white shadow">
                <Trophy className="h-3.5 w-3.5" /> Hall of Fame Status
              </div>
              <h2 className="mt-4 text-3xl font-extrabold md:text-4xl">District Authority</h2>
              <p className="mt-3 text-muted-foreground">
                {partner.name} {partner.district} mein Nexora ke verified District Business Partner hain — Leadership Circle ke active member aur growth example.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {partner.milestonesUnlocked.map((m) => (
                  <span key={m} className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-white/70 px-3 py-1 text-xs font-semibold text-amber-800 dark:border-amber-700 dark:bg-white/5 dark:text-amber-200">
                    <Target className="h-3 w-3" /> {m}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-600" />
                <h3 className="font-bold">Recognition Showcase</h3>
              </div>
              <ul className="mt-4 space-y-3">
                {partner.recognition.map((r) => (
                  <li key={r.title} className="flex items-start gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <div>
                      <div className="text-sm font-semibold">{r.title}</div>
                      <div className="text-xs text-muted-foreground">{r.date}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-amber-600 via-orange-600 to-rose-600 p-10 text-center text-white shadow-2xl md:p-14">
          <h2 className="text-3xl font-extrabold md:text-5xl">Become The Growth Leader Of Your District</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg opacity-95">
            Connect Businesses. Build Network. Create Impact. Grow With Nexora.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-base font-bold text-amber-700 shadow-lg transition hover:scale-105">
              <Rocket className="h-4 w-4" /> Apply Now
            </Link>
            <Link to="/district-business-partner" className="inline-flex items-center gap-2 rounded-full border-2 border-white bg-white/10 px-7 py-3 text-base font-bold text-white transition hover:bg-white/20">
              <Building2 className="h-4 w-4" /> Become District Business Partner
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border-2 border-white bg-transparent px-7 py-3 text-base font-bold text-white transition hover:bg-white/10">
              <Handshake className="h-4 w-4" /> Talk To Team
            </Link>
          </div>
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs opacity-90">
            <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> No Joining Fee</span>
            <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3" /> No Investment</span>
            <span className="inline-flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Performance Based</span>
          </div>
        </div>
      </section>
    </div>
  );
}
