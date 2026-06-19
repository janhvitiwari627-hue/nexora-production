import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Clock, Sparkles, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { FavoriteShopCard } from "./favorites/FavoriteShopCard";
import { mockSaved, mockVisited, mockRecommended } from "./favorites/mockFavorites";

type TabId = "saved" | "visited" | "recommended";

const TABS: { id: TabId; label: string; Icon: LucideIcon; count: number }[] = [
  { id: "saved", label: "Saved Shops", Icon: Heart, count: mockSaved.length },
  { id: "visited", label: "Recently Visited", Icon: Clock, count: mockVisited.length },
  { id: "recommended", label: "Recommended", Icon: Sparkles, count: mockRecommended.length },
];

export function FavoriteShopsPage() {
  const [tab, setTab] = useState<TabId>("saved");

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:py-10">
        <header>
          <h1 className="text-2xl font-black sm:text-3xl">Your Shops</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Saved favourites, recent visits and personalised picks — all in one place.
          </p>
        </header>

        <div className="flex gap-1 overflow-x-auto rounded-full border bg-card p-1 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                  active
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:bg-muted hover:text-heading",
                )}
              >
                <t.Icon className="h-4 w-4" />
                {t.label}
                <span
                  className={cn(
                    "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold",
                    active ? "bg-white/20 text-white" : "bg-muted text-heading",
                  )}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {tab === "recommended" && (
          <div className="flex items-start gap-3 rounded-2xl border border-fuchsia-200/60 bg-gradient-to-br from-fuchsia-50 to-indigo-50 p-4 dark:from-fuchsia-950/30 dark:to-indigo-950/30">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="text-sm">
              <p className="font-bold">AI-curated for you</p>
              <p className="text-xs text-muted-foreground">
                Recommendations are based on your booking history, favourites and shops loved
                by members in your tier and area.
              </p>
            </div>
          </div>
        )}

        {tab === "saved" && (
          mockSaved.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {mockSaved.map((s) => (
                <FavoriteShopCard key={s.id} shop={s} saved />
              ))}
            </div>
          ) : (
            <Empty
              title="No saved shops yet"
              subtitle="Tap the heart icon on any shop to save it for quick rebooking."
              cta="Discover Shops"
            />
          )
        )}

        {tab === "visited" && (
          mockVisited.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {mockVisited.map((s) => (
                <FavoriteShopCard key={s.id} shop={s} visitedISO={s.lastVisitedISO} />
              ))}
            </div>
          ) : (
            <Empty
              title="No visits in the last 30 days"
              subtitle="Once you book and complete a service, it will appear here."
              cta="Book Something"
            />
          )
        )}

        {tab === "recommended" && (
          mockRecommended.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {mockRecommended.map((s) => (
                <FavoriteShopCard
                  key={s.id}
                  shop={s}
                  saved={false}
                  showAiBadge
                  reason={s.reason}
                />
              ))}
            </div>
          ) : (
            <Empty
              title="Building your picks"
              subtitle="Complete a few bookings and we'll surface tailored recommendations."
              cta="Explore Shops"
            />
          )
        )}
      </main>
      <PublicFooter />
    </div>
  );
}

function Empty({
  title,
  subtitle,
  cta,
}: {
  title: string;
  subtitle: string;
  cta: string;
}) {
  return (
    <div className="grid place-items-center rounded-3xl border border-dashed bg-card/60 px-6 py-16 text-center">
      <Heart className="h-10 w-10 text-rose-400" />
      <h3 className="mt-3 text-lg font-bold">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{subtitle}</p>
      <Link
        to="/search"
        className="mt-5 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition hover:opacity-90"
      >
        {cta}
      </Link>
    </div>
  );
}
