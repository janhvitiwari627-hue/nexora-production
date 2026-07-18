import { useState } from "react";
import { Link, getRouteApi } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgeCheck,
  Calendar,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Star,
  X,
} from "lucide-react";
import { salonBySlugQueryOptions } from "@/lib/salons.queries";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PublicPageHeader } from "@/components/shared/PublicPageHeader";

const route = getRouteApi("/s/$slug");

export function SalonProfileRealPage() {
  const { slug } = route.useParams();
  const { data } = useSuspenseQuery(salonBySlugQueryOptions(slug));
  const [lightbox, setLightbox] = useState<number | null>(null);
  if (!data) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-heading text-2xl font-black">Salon not found</h1>
      </div>
    );
  }
  const { salon, services, staff, reviews } = data;

  const gallery = Array.from(
    new Set(
      [
        ...(salon.cover_image_url ? [salon.cover_image_url] : []),
        ...(salon.image_url ? [salon.image_url] : []),
        ...((salon.gallery_images as string[] | null) ?? []),
      ].filter(Boolean),
    ),
  );
  const heroImage = salon.cover_image_url || salon.image_url;
  const hours = (salon.hours ?? {}) as Record<
    string,
    { open?: string; close?: string; closed?: boolean }
  >;
  const mapUrl =
    salon.latitude && salon.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${salon.latitude},${salon.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(salon.address || salon.location || salon.name || "")}`;
  const close = () => setLightbox(null);
  const next = () => setLightbox((i) => (i === null ? null : (i + 1) % gallery.length));
  const prev = () =>
    setLightbox((i) => (i === null ? null : (i - 1 + gallery.length) % gallery.length));

  return (
    <div className="min-h-screen bg-background pb-24">
      <PublicPageHeader />
      {/* Hero */}
      <div className="relative h-72 w-full overflow-hidden md:h-96">
        {heroImage ? (
          <img
            src={heroImage}
            alt={salon.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-primary/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl items-end px-4 pb-8 md:px-6">
          <div>
            <div className="mb-2 flex items-center gap-2">
              {salon.category && (
                <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                  {salon.category}
                </span>
              )}
              {salon.is_verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified
                </span>
              )}
            </div>
            <h1 className="text-heading text-3xl font-black md:text-5xl">{salon.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <b className="text-heading">{(salon.rating ?? 0).toFixed(1)}</b>
                <span>({salon.reviews_count ?? 0} reviews)</span>
              </span>
              {salon.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {salon.location}
                </span>
              )}
              {salon.price_range && (
                <span className="font-semibold text-heading">{salon.price_range}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:px-6 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0 space-y-10">
          {/* About */}
          {(salon.about_us || salon.description) && (
            <section>
              <h2 className="text-heading mb-3 text-xl font-black">About</h2>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {salon.about_us || salon.description}
              </p>
            </section>
          )}

          {salon.video_url && (
            <section>
              <h2 className="text-heading mb-3 text-xl font-black">Visit Our Salon</h2>
              <video
                controls
                src={salon.video_url}
                className="max-h-[480px] w-full rounded-[var(--radius-card-lg)] border border-border bg-black"
              />
            </section>
          )}

          {/* Gallery */}
          {gallery.length > 0 && (
            <section>
              <h2 className="text-heading mb-3 text-xl font-black">Gallery</h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {gallery.map((src, i) => (
                  <button
                    key={src + i}
                    type="button"
                    onClick={() => setLightbox(i)}
                    className="group relative aspect-square overflow-hidden rounded-[var(--radius-card)] bg-muted"
                  >
                    <img
                      src={src}
                      alt={`${salon.name} ${i + 1}`}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Services */}
          <section>
            <h2 className="text-heading mb-3 text-xl font-black">Services</h2>
            {services.length === 0 ? (
              <p className="text-sm text-muted-foreground">No services listed yet.</p>
            ) : (
              <ul className="divide-y divide-border overflow-hidden rounded-[var(--radius-card-lg)] border border-border bg-card">
                {services.map((s) => (
                  <li key={s.id} className="flex items-start gap-4 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="text-heading font-bold">{s.name}</div>
                      {s.description && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {s.description}
                        </p>
                      )}
                      <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                        {s.duration_minutes} min
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-heading font-black">
                        ₹{Number(s.price).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Staff */}
          {staff.length > 0 && (
            <section>
              <h2 className="text-heading mb-3 text-xl font-black">Our Team</h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {staff.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-[var(--radius-card)] border border-border bg-card p-4 text-center"
                  >
                    <div className="mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full bg-muted">
                      {m.avatar_url ? (
                        <img
                          src={m.avatar_url}
                          alt={m.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-lg font-black text-muted-foreground">
                          {m.name?.[0] ?? "?"}
                        </div>
                      )}
                    </div>
                    <div className="text-heading text-sm font-bold">{m.name}</div>
                    {m.role && (
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{m.role}</div>
                    )}
                    {m.rating != null && (
                      <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-warning">
                        <Star className="h-3 w-3 fill-warning" /> {Number(m.rating).toFixed(1)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          <section>
            <h2 className="text-heading mb-3 text-xl font-black">Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews yet — be the first!</p>
            ) : (
              <ul className="space-y-3">
                {reviews.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-[var(--radius-card)] border border-border bg-card p-4"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3.5 w-3.5",
                              i < (r.rating ?? 0)
                                ? "fill-warning text-warning"
                                : "text-muted-foreground/30",
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(r.created_at as string).toLocaleDateString()}
                      </span>
                    </div>
                    {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>

        {/* Sticky CTA sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[var(--radius-card-lg)] border border-border bg-card p-5 shadow-sm">
            <div className="text-heading text-lg font-black">Book at {salon.name}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Pay 25% advance, rest at the salon.
            </p>
            {salon.is_home_service && (
              <div className="mt-3 rounded-lg bg-primary/10 p-3 text-sm text-heading">
                <div className="font-bold">Home service available</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  Within {salon.home_service_radius_km ?? 0} km · Extra ₹
                  {Number(salon.home_service_charge ?? 0).toLocaleString("en-IN")}
                </div>
              </div>
            )}
            <Button asChild size="lg" className="mt-4 w-full">
              <Link to="/book/$slug" params={{ slug: salon.slug }}>
                <Calendar className="mr-2 h-4 w-4" /> Book Now
              </Link>
            </Button>
            {salon.phone && (
              <a
                href={`tel:${salon.phone}`}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-border px-4 py-2 text-sm font-bold text-heading hover:bg-muted"
              >
                <Phone className="h-4 w-4" /> {salon.phone}
              </a>
            )}
          </div>
          <div className="mt-4 rounded-[var(--radius-card-lg)] border border-border bg-card p-5">
            <h2 className="text-heading flex items-center gap-2 font-black">
              <Clock className="h-4 w-4" /> Working Hours
            </h2>
            <div className="mt-3 space-y-1.5 text-xs">
              {Object.entries(hours).map(([day, value]) => (
                <div key={day} className="flex justify-between gap-3">
                  <span className="capitalize text-muted-foreground">{day}</span>
                  <span className="font-medium">
                    {value.closed ? "Closed" : `${value.open ?? "—"} – ${value.close ?? "—"}`}
                  </span>
                </div>
              ))}
              {Object.keys(hours).length === 0 && (
                <p className="text-muted-foreground">Hours will be updated soon.</p>
              )}
            </div>
            {(salon.address || salon.location) && (
              <p className="mt-4 text-sm text-muted-foreground">
                <MapPin className="mr-1 inline h-4 w-4" />
                {salon.address || salon.location}
              </p>
            )}
            <a
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-primary"
            >
              View on Google Maps <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </aside>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <img
              src={gallery[lightbox]}
              alt=""
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
