import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, MapPin, Navigation, Star, Loader2 } from "lucide-react";
import { useUserLocation } from "@/hooks/use-user-location";
import { Button } from "@/components/ui/button";
import { nearbySalons } from "@/lib/location.functions";

type NearbyRow = {
  id: string;
  name: string;
  category: string | null;
  rating: number | null;
  reviews_count: number | null;
  image_url: string | null;
  location: string | null;
  distance_km: number;
};

const RADII = [1, 3, 5, 10, 20] as const;
const FALLBACK_IMG = "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80";

export function NearbyShopsSection() {
  const { location, status, requestGps } = useUserLocation();
  const [radius, setRadius] = useState<number>(5);
  const fetchNearby = useServerFn(nearbySalons);

  const { data, isFetching } = useQuery({
    queryKey: ["nearby-salons", location?.lat, location?.lng, radius],
    enabled: !!location,
    queryFn: async () => {
      if (!location) return [] as NearbyRow[];
      const rows = await fetchNearby({
        data: { lat: location.lat, lng: location.lng, radius_km: radius, limit: 8 },
      });
      return rows as unknown as NearbyRow[];
    },
  });

  const shops = useMemo(() => data ?? [], [data]);

  return (
    <section className="mx-auto max-w-7xl px-4 pt-20 md:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-heading md:text-4xl">
            Nearby Salons
          </h2>
          <p className="mt-2 text-muted-foreground">
            {location
              ? `Within ${radius} km of your ${location.source === "gps" ? "current location" : "saved location"}.`
              : "Enable location to see salons sorted by distance from you."}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {!location ? (
            <Button
              size="sm"
              variant="outline"
              onClick={requestGps}
              disabled={status === "loading"}
              className="gap-1.5"
            >
              <Navigation className="h-3.5 w-3.5" />
              {status === "loading" ? "Locating…" : "Use my location"}
            </Button>
          ) : null}
          <Link
            to="/search"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Radius selector */}
      {location ? (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Radius:</span>
          {RADII.map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                radius === r
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary"
              }`}
            >
              {r} km
            </button>
          ))}
        </div>
      ) : null}

      {!location ? (
        <div className="rounded-[var(--radius-card-lg)] border border-dashed border-border bg-muted/30 p-10 text-center">
          <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Allow location to discover salons near you.
          </p>
        </div>
      ) : isFetching ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : shops.length === 0 ? (
        <div className="rounded-[var(--radius-card-lg)] border border-dashed border-border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
          No salons within {radius} km. Try a larger radius.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {shops.map((s) => (
            <li
              key={s.id}
              className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]"
            >
              <img
                src={s.image_url || FALLBACK_IMG}
                alt={s.name}
                loading="lazy"
                className="h-32 w-full object-cover"
              />
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate text-sm font-bold text-heading">{s.name}</h3>
                  <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-heading">
                    <Star className="h-3 w-3 fill-warning text-warning" />
                    {(s.rating ?? 0).toFixed(1)}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {s.location ?? "—"} · {s.distance_km.toFixed(1)} km
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {s.reviews_count ?? 0} reviews
                </p>
                <Link
                  to="/shop/$slug"
                  params={{ slug: s.id }}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-[var(--radius-button)] bg-gradient-cta px-3 py-1.5 text-xs font-bold text-primary-foreground transition hover:brightness-110"
                >
                  View
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
