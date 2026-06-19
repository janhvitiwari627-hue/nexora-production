import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Lightbox } from "@/components/shared/Lightbox";
import { Modal } from "@/components/shared/Modal";
import { ReviewCard } from "@/components/shared/ReviewCard";
import { ServiceCard } from "@/components/shared/ServiceCard";
import { StaffCard } from "@/components/shared/StaffCard";
import { MembershipCard } from "@/components/shared/MembershipCard";
import { StarRating } from "@/components/shared/StarRating";
import {
  Award,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Copy,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MockShop } from "./mockShop";

/* ===================== Overview ===================== */
export function OverviewTab({ shop, go }: { shop: MockShop; go: (t: string) => void }) {
  const featuredServices = shop.service_categories.flatMap((c) => c.items).slice(0, 4);
  const featuredStaff = shop.staff.slice(0, 4);
  const activeOffer = shop.offers[0];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Bookings", value: shop.stats.bookings, icon: Calendar },
          { label: "Experience", value: shop.stats.experience, icon: Award },
          { label: "Staff", value: `${shop.stats.staff}`, icon: Users },
          { label: "Services", value: `${shop.stats.services}`, icon: Sparkles },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="border-border bg-card flex items-center gap-3 rounded-[var(--radius-card)] border p-4"
          >
            <div className="bg-gradient-cta text-primary-foreground grid h-10 w-10 place-items-center rounded-xl">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-heading text-lg font-black">{value}</div>
              <div className="text-muted-foreground text-[11px] uppercase tracking-wider">
                {label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Section title="Top services" onMore={() => go("Services")}>
        <div className="grid gap-3 md:grid-cols-2">
          {featuredServices.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </Section>

      <Section title="Featured staff" onMore={() => go("Staff")}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {featuredStaff.map((s) => (
            <StaffCard key={s.id} staff={s} />
          ))}
        </div>
      </Section>

      {activeOffer && (
        <Section title="Active offers" onMore={() => go("Offers")}>
          <div className="from-primary/10 to-accent/10 border-primary/20 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border bg-gradient-to-r p-5">
            <div>
              <div className="text-heading text-lg font-bold">{activeOffer.title}</div>
              <div className="text-muted-foreground text-sm">{activeOffer.description}</div>
            </div>
            <span className="bg-primary text-primary-foreground rounded-full px-3 py-1 font-mono text-sm font-bold">
              {activeOffer.code}
            </span>
          </div>
        </Section>
      )}

      <Section title="Find us" onMore={() => go("Location")}>
        <MiniMap lat={shop.lat} lng={shop.lng} address={shop.address} />
      </Section>
    </div>
  );
}

function Section({
  title,
  onMore,
  children,
}: {
  title: string;
  onMore?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-end justify-between">
        <h3 className="text-heading text-xl font-bold">{title}</h3>
        {onMore && (
          <button
            type="button"
            onClick={onMore}
            className="text-primary inline-flex items-center text-sm font-semibold hover:underline"
          >
            See all <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function MiniMap({ lat, lng, address }: { lat: number; lng: number; address: string }) {
  return (
    <div className="border-border bg-card overflow-hidden rounded-[var(--radius-card)] border">
      <div
        className="relative h-48 w-full"
        style={{
          background:
            "linear-gradient(135deg,#dbeafe 0%,#e0e7ff 50%,#fce7f3 100%)",
        }}
      >
        <svg viewBox="0 0 400 200" className="absolute inset-0 h-full w-full opacity-30">
          <path d="M0 100 Q100 60 200 100 T400 100" stroke="#0A2540" strokeWidth="1.5" fill="none" />
          <path d="M0 140 Q100 100 200 140 T400 140" stroke="#0A2540" strokeWidth="1" fill="none" />
          <path d="M50 0 L50 200 M150 0 L150 200 M250 0 L250 200 M350 0 L350 200" stroke="#0A2540" strokeWidth="0.5" />
        </svg>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
          <div className="bg-primary text-primary-foreground grid h-9 w-9 place-items-center rounded-full shadow-lg ring-4 ring-white">
            <MapPin className="h-4 w-4" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 p-4">
        <p className="text-muted-foreground text-sm">{address}</p>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
          target="_blank"
          rel="noreferrer"
          className="bg-gradient-cta text-primary-foreground shrink-0 rounded-[var(--radius-button)] px-4 py-2 text-sm font-bold"
        >
          Directions
        </a>
      </div>
    </div>
  );
}

/* ===================== Services ===================== */
export function ServicesTab({ shop }: { shop: MockShop }) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return shop.service_categories
      .map((c) => ({
        ...c,
        items: term
          ? c.items.filter((i) => i.name.toLowerCase().includes(term))
          : c.items,
      }))
      .filter((c) => c.items.length > 0);
  }, [q, shop.service_categories]);

  return (
    <div>
      <div className="border-border bg-card mb-5 flex items-center gap-2 rounded-[var(--radius-button)] border px-3 py-2">
        <Search className="text-muted-foreground h-4 w-4" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search services"
          className="placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
        />
      </div>
      <Accordion type="multiple" defaultValue={filtered.map((c) => c.name)}>
        {filtered.map((c) => (
          <AccordionItem key={c.name} value={c.name}>
            <AccordionTrigger className="text-heading text-base font-bold">
              {c.name}{" "}
              <span className="text-muted-foreground ml-2 text-xs font-medium">
                ({c.items.length})
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-3 pt-2 md:grid-cols-2">
                {c.items.map((s) => (
                  <ServiceCard
                    key={s.id}
                    service={s}
                    selected={selected.has(s.id)}
                    onToggle={(id, next) => {
                      setSelected((prev) => {
                        const n = new Set(prev);
                        next ? n.add(id) : n.delete(id);
                        return n;
                      });
                    }}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

/* ===================== Staff ===================== */
export function StaffTab({ shop }: { shop: MockShop }) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {shop.staff.map((s) => (
        <StaffCard
          key={s.id}
          staff={s}
          selected={selected === s.id}
          onSelect={(id) => setSelected((prev) => (prev === id ? null : id))}
        />
      ))}
    </div>
  );
}

/* ===================== Gallery ===================== */
export function GalleryTab({ shop }: { shop: MockShop }) {
  const [mode, setMode] = useState<"photos" | "videos">("photos");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);

  return (
    <div>
      <div className="bg-muted mb-5 inline-flex rounded-full p-1">
        {(["photos", "videos"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-semibold capitalize transition",
              mode === m ? "bg-card text-heading shadow" : "text-muted-foreground",
            )}
          >
            {m}
          </button>
        ))}
      </div>

      {mode === "photos" ? (
        <div className="columns-2 gap-3 md:columns-3 lg:columns-4">
          {shop.gallery_photos.map((p, i) => (
            <button
              key={p}
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="mb-3 block w-full overflow-hidden rounded-2xl"
            >
              <img
                src={p}
                alt=""
                loading="lazy"
                className="w-full transition hover:scale-105"
              />
            </button>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          {shop.gallery_videos.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setVideoId(v.youtubeId)}
              className="group border-border bg-card relative overflow-hidden rounded-2xl border"
            >
              <img src={v.thumb} alt={v.title} className="aspect-video w-full object-cover" />
              <div className="absolute inset-0 grid place-items-center bg-black/30 transition group-hover:bg-black/45">
                <div className="bg-gradient-cta text-primary-foreground grid h-14 w-14 place-items-center rounded-full shadow-xl">
                  <Play className="h-5 w-5 fill-current" />
                </div>
              </div>
              <div className="text-heading p-3 text-left text-sm font-semibold">{v.title}</div>
            </button>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          images={shop.gallery_photos}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
      <Modal open={!!videoId} onClose={() => setVideoId(null)} size="xl">
        {videoId && (
          <div className="aspect-video w-full bg-black">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title="Video"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ===================== Reviews ===================== */
export function ReviewsTab({ shop }: { shop: MockShop }) {
  const [filter, setFilter] = useState<number | null>(null);
  const breakdown = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    shop.reviews.forEach((r) => {
      const idx = Math.max(1, Math.min(5, Math.round(r.rating))) - 1;
      counts[idx]++;
    });
    return counts;
  }, [shop.reviews]);
  const total = shop.reviews.length || 1;
  const visible = filter ? shop.reviews.filter((r) => Math.round(r.rating) === filter) : shop.reviews;

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="border-border bg-card h-fit rounded-[var(--radius-card-lg)] border p-6">
        <div className="text-center">
          <div className="text-heading text-5xl font-black">{shop.rating.toFixed(1)}</div>
          <StarRating value={shop.rating} showNumber={false} />
          <div className="text-muted-foreground mt-1 text-xs">
            {shop.review_count.toLocaleString("en-IN")} reviews
          </div>
        </div>
        <div className="mt-5 space-y-2">
          {[5, 4, 3, 2, 1].map((r) => {
            const pct = (breakdown[r - 1] / total) * 100;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setFilter((p) => (p === r ? null : r))}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg p-1 text-xs transition",
                  filter === r ? "bg-primary/10" : "hover:bg-muted",
                )}
              >
                <span className="w-3 font-semibold text-heading">{r}</span>
                <Star className="h-3 w-3 fill-warning text-warning" />
                <div className="bg-muted relative h-2 flex-1 overflow-hidden rounded-full">
                  <div className="bg-gradient-cta absolute inset-y-0 left-0" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-muted-foreground w-6 text-right">{breakdown[r - 1]}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="bg-gradient-cta text-primary-foreground mt-5 inline-flex w-full items-center justify-center rounded-[var(--radius-button)] px-4 py-2.5 text-sm font-bold shadow-[var(--shadow-glow)]"
        >
          Write a review
        </button>
      </aside>

      <div className="space-y-4">
        {visible.map((r) => (
          <ReviewCard key={r.id} review={r} />
        ))}
        {visible.length === 0 && (
          <div className="border-border text-muted-foreground rounded-[var(--radius-card)] border border-dashed p-10 text-center text-sm">
            No reviews match this rating.
          </div>
        )}
      </div>
    </div>
  );
}

/* ===================== Offers ===================== */
export function OffersTab({ shop }: { shop: MockShop }) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (code: string) => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(null), 1800);
    });
  };
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {shop.offers.map((o) => (
        <motion.article
          key={o.id}
          whileHover={{ y: -2 }}
          className="from-primary/5 via-card to-accent/10 border-primary/20 relative overflow-hidden rounded-[var(--radius-card)] border bg-gradient-to-br p-5"
        >
          <span className="bg-gradient-cta text-primary-foreground absolute -right-10 top-5 rotate-45 px-12 py-1 text-[10px] font-black uppercase tracking-wider">
            {o.discount}
          </span>
          <div className="text-primary mb-1 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
            <Tag className="h-3 w-3" /> Offer
          </div>
          <h4 className="text-heading text-lg font-bold">{o.title}</h4>
          <p className="text-muted-foreground mt-1 text-sm">{o.description}</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="border-primary/40 text-heading flex-1 rounded-[var(--radius-button)] border-2 border-dashed px-4 py-2 text-center font-mono font-bold tracking-widest">
              {o.code}
            </div>
            <button
              type="button"
              onClick={() => copy(o.code)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-[var(--radius-button)] px-4 py-2 text-sm font-bold transition",
                copied === o.code
                  ? "bg-success text-white"
                  : "bg-gradient-cta text-primary-foreground hover:brightness-110",
              )}
            >
              {copied === o.code ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied === o.code ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="text-muted-foreground mt-3 text-xs">Expires {o.expiry}</div>
        </motion.article>
      ))}
    </div>
  );
}

/* ===================== Membership ===================== */
export function MembershipTab({ shop }: { shop: MockShop }) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {(["Silver", "Gold", "Platinum"] as const).map((tier) => (
        <MembershipCard
          key={tier}
          membership={{
            member_name: "Member",
            nexora_id: "NX-•••• ••••",
            tier,
            expires_on: "Dec 2026",
            savings_inr: tier === "Platinum" ? 18000 : tier === "Gold" ? 9000 : 3500,
            benefits:
              tier === "Platinum"
                ? ["25% off all services", "Priority booking", "Free monthly facial", "Birthday gift"]
                : tier === "Gold"
                ? ["15% off all services", "Priority booking", "Birthday gift"]
                : ["10% off all services", "Member events"],
            is_active: true,
          }}
        />
      ))}
      <div className="border-border text-muted-foreground md:col-span-3 rounded-[var(--radius-card)] border border-dashed p-5 text-center text-sm">
        Active across all {shop.name} locations.
      </div>
    </div>
  );
}

/* ===================== About ===================== */
export function AboutTab({ shop }: { shop: MockShop }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <h3 className="text-heading text-xl font-bold">Our story</h3>
        <p className="text-muted-foreground mt-3 leading-relaxed">{shop.story}</p>

        <h4 className="text-heading mt-8 mb-3 text-base font-bold">Certifications</h4>
        <div className="flex flex-wrap gap-2">
          {shop.certifications.map((c) => (
            <span
              key={c}
              className="border-border bg-card text-heading inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold"
            >
              <ShieldCheck className="text-primary h-3.5 w-3.5" /> {c}
            </span>
          ))}
        </div>
      </div>

      <aside>
        <h4 className="text-heading mb-3 text-base font-bold">Awards</h4>
        <ul className="space-y-3">
          {shop.awards.map((a) => (
            <li
              key={a.title}
              className="border-border bg-card flex items-start gap-3 rounded-[var(--radius-card)] border p-4"
            >
              <div className="bg-gradient-gold grid h-10 w-10 shrink-0 place-items-center rounded-full text-heading">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <div className="text-heading text-sm font-bold">{a.title}</div>
                <div className="text-muted-foreground text-xs">{a.year}</div>
              </div>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

/* ===================== Location ===================== */
export function LocationTab({ shop }: { shop: MockShop }) {
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`;
  const embedUrl = `https://www.google.com/maps?q=${shop.lat},${shop.lng}&z=15&output=embed`;
  return (
    <div className="space-y-5">
      <div className="border-border overflow-hidden rounded-[var(--radius-card-lg)] border">
        <iframe
          title={`${shop.name} location`}
          src={embedUrl}
          className="h-[420px] w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <MapPin className="text-primary mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <div className="text-heading font-semibold">{shop.name}</div>
            <div className="text-muted-foreground text-sm">{shop.address}</div>
          </div>
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="bg-gradient-cta text-primary-foreground inline-flex items-center gap-2 rounded-[var(--radius-button)] px-5 py-2.5 text-sm font-bold shadow-[var(--shadow-glow)]"
        >
          <Navigation className="h-4 w-4" /> Get Directions
        </a>
      </div>
    </div>
  );
}

/* ===================== Policies ===================== */
export function PoliciesTab({ shop }: { shop: MockShop }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {shop.policies.map((p) => (
        <article
          key={p.title}
          className="border-border bg-card rounded-[var(--radius-card)] border p-5"
        >
          <h4 className="text-heading mb-2 text-base font-bold">{p.title}</h4>
          <p className="text-muted-foreground text-sm leading-relaxed">{p.body}</p>
        </article>
      ))}
    </div>
  );
}

/* ===================== FAQs ===================== */
export function FAQsTab({ shop }: { shop: MockShop }) {
  return (
    <div className="border-border bg-card rounded-[var(--radius-card-lg)] border px-5">
      <Accordion type="single" collapsible>
        {shop.faqs.map((f, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-heading text-left text-sm font-semibold">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

/* ===================== Contact ===================== */
export function ContactTab({ shop }: { shop: MockShop }) {
  const waNum = shop.whatsapp.replace(/\D/g, "");
  const items = [
    { icon: Phone, label: "Phone", value: shop.phone, href: `tel:${shop.phone.replace(/\s/g, "")}`, cta: "Call" },
    { icon: MessageCircle, label: "WhatsApp", value: shop.whatsapp, href: `https://wa.me/${waNum}`, cta: "Chat" },
    { icon: Mail, label: "Email", value: shop.email, href: `mailto:${shop.email}`, cta: "Mail" },
    { icon: Globe, label: "Website", value: shop.website.replace(/^https?:\/\//, ""), href: shop.website, cta: "Visit" },
    { icon: Clock, label: "Hours", value: shop.open_hours },
    { icon: MapPin, label: "Address", value: shop.address },
  ];
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map(({ icon: Icon, label, value, href, cta }) => (
        <div
          key={label}
          className="border-border bg-card flex items-center justify-between gap-4 rounded-[var(--radius-card)] border p-4"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="bg-primary/10 text-primary grid h-10 w-10 shrink-0 place-items-center rounded-xl">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-muted-foreground text-[11px] uppercase tracking-wider">{label}</div>
              <div className="text-heading truncate text-sm font-semibold">{value}</div>
            </div>
          </div>
          {href && cta && (
            <a
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="border-primary text-primary hover:bg-primary/5 shrink-0 rounded-[var(--radius-button)] border px-3 py-1.5 text-xs font-bold"
            >
              {cta}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
