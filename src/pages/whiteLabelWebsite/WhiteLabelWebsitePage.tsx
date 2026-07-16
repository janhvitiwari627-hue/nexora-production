import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WebsiteRenderer } from "@/components/whiteLabelWebsite/WebsiteRenderer";
import { WhiteLabelHeader } from "@/components/whiteLabelWebsite/WhiteLabelHeader";
import { WhiteLabelFooter } from "@/components/whiteLabelWebsite/WhiteLabelFooter";
import { ViralGrowthWidget } from "@/components/whiteLabelWebsite/ViralGrowthWidget";
import {
  DEFAULT_SECTIONS,
  type ShopData,
  type WebsiteConfig,
} from "@/components/whiteLabelWebsite/types";
import {
  getTemplate,
  normalizeTemplateKey,
  TEMPLATE_KEYS,
  TEMPLATES,
  type TemplateKey,
} from "@/components/whiteLabelWebsite/templates";
import { getSalonBySlug } from "@/lib/salons.functions";
import { expandMockBusiness, getMockBusinesses, getMockBusinessBySlug } from "@/lib/mock-businesses";
import { Check, Loader2, Paintbrush } from "lucide-react";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1600&q=80";

export function WhiteLabelWebsitePage({
  slug: _slug,
  routeSearch,
}: {
  slug?: string;
  routeSearch?: { t?: string; preview?: 1 };
}) {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["white-label-site", _slug],
    queryFn: () => (_slug ? getSalonBySlug({ data: { slug: _slug } }) : Promise.resolve(null)),
    enabled: !!_slug,
  });
  const queryClient = useQueryClient();
  const salonId = data?.salon?.id;
  const [liveState, setLiveState] = useState<"idle" | "updating" | "updated">("idle");

  // Live refresh: when the salon row (or its services) changes in the DB,
  // re-fetch so /site/<slug> reflects owner edits from /owner/settings instantly.
  useEffect(() => {
    if (!_slug || !salonId) return;
    const onChange = () => {
      setLiveState("updating");
      queryClient.invalidateQueries({ queryKey: ["white-label-site", _slug] });
    };
    const channel = supabase
      .channel(`site-${salonId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "salons", filter: `id=eq.${salonId}` }, onChange)
      .on("postgres_changes", { event: "*", schema: "public", table: "services", filter: `salon_id=eq.${salonId}` }, onChange)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [_slug, salonId, queryClient]);

  // Flip the pill to "Updated" briefly once the refetch settles.
  useEffect(() => {
    if (liveState !== "updating" || isFetching) return;
    setLiveState("updated");
    const t = setTimeout(() => setLiveState("idle"), 1500);
    return () => clearTimeout(t);
  }, [liveState, isFetching]);

  const navigate = useNavigateSafe();

  const browserSearch =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const isPreview = routeSearch?.preview === 1 || browserSearch?.get("preview") === "1";

  if (isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">
        Loading salon website…
      </div>
    );
  }

  // Template previews and demo slugs use mock businesses that don't exist in
  // the DB. When the DB has no salon but we recognise the slug as a mock
  // business (or we're explicitly in preview mode), render the template with
  // the mock ShopData so the "Book Now" flow stays inside the owner's
  // website design instead of dead-ending on a "not available" screen.
  const mockBusiness = _slug ? getMockBusinessBySlug(_slug) : null;
  const useMock = !data?.salon && (!!mockBusiness || isPreview);

  if (!data?.salon && !useMock) {
    return (
      <div className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-6 text-center">
        <div className="space-y-4">
          <div className="text-5xl">🌿</div>
          <h1 className="text-2xl font-semibold">This salon website is not available.</h1>
          <p className="text-muted-foreground">
            The link you followed may be incorrect or the owner has not published their site yet.
          </p>
          <Link
            to="/"
            className="inline-flex rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    );
  }

  const shop: ShopData = data?.salon
    ? toShopData(data)
    : expandMockBusiness(mockBusiness ?? getMockBusinesses()[0]);
  const savedTemplateKey = data?.salon?.selected_template_key ?? "modern-salon";
  const templateKey = normalizeTemplateKey(
    routeSearch?.t ?? browserSearch?.get("t") ?? savedTemplateKey,
  );
  const baseTemplate = getTemplate(templateKey);

  const config: WebsiteConfig = {
    template: templateKey,
    branding: {
      logo: data?.salon?.owner_profile_image_url ?? undefined,
      primaryColor: data?.salon?.brand_primary ?? baseTemplate.colors.primary,
      secondaryColor: data?.salon?.brand_secondary ?? baseTemplate.colors.secondary,
      font: baseTemplate.font,
    },
    sections: DEFAULT_SECTIONS,
    seoMeta: {
      title: shop.name,
      description: shop.tagline ?? shop.about ?? "",
      keywords: [],
    },
    socialLinks: {},
  };
  const template = {
    ...baseTemplate,
    colors: {
      ...baseTemplate.colors,
      primary: config.branding.primaryColor,
      secondary: config.branding.secondaryColor,
    },
  };

  const setTemplate = (key: TemplateKey) => {
    if (navigate)
      navigate({
        to: ".",
        search: (prev: Record<string, unknown>) => ({ ...prev, t: key }),
        replace: true,
      } as never);
  };

  const wrapperClass =
    templateKey === "royal-luxe"
      ? "tpl-royal"
      : templateKey === "professional-beauty"
        ? "tpl-blossom"
        : "tpl-modern";

  const bgColor =
    templateKey === "royal-luxe"
      ? "#0B0B0B"
      : templateKey === "professional-beauty"
        ? "#FFFDFD"
        : template.colors.bg;

  return (
    <div
      className={wrapperClass}
      style={{ fontFamily: template.font, backgroundColor: bgColor, color: template.colors.text }}
    >
      {isPreview && (
        <div className="sticky top-0 z-40 w-full bg-amber-500 text-amber-950 shadow-md">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-2 text-sm font-medium sm:flex-row">
            <span className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-900" />
              Preview mode — {TEMPLATES[templateKey].name}. Not published yet.
            </span>
            <a
              href="/owner/templates"
              className="rounded-full bg-amber-950 px-3 py-1 text-xs font-semibold text-amber-50 hover:bg-amber-900"
            >
              Back to gallery
            </a>
          </div>
        </div>
      )}
      <WhiteLabelHeader shop={shop} template={template} />
      <main className="pb-20 md:pb-0">
        {isPreview && <TemplateSwitcher current={templateKey} onChange={setTemplate} />}
        <WebsiteRenderer shop={shop} config={config} />
      </main>
      <WhiteLabelFooter shop={shop} config={config} template={template} />
      <ViralGrowthWidget />
      {liveState !== "idle" && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-4 left-1/2 z-50 -translate-x-1/2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-lg backdrop-blur transition-all ${
            liveState === "updating"
              ? "bg-slate-900/90 text-white"
              : "bg-emerald-600/95 text-white"
          }`}
        >
          {liveState === "updating" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating website…
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Website updated
            </>
          )}
        </div>
      )}
    </div>
  );
}

function toShopData(data: NonNullable<Awaited<ReturnType<typeof getSalonBySlug>>>): ShopData {
  const salon = data.salon!;
  const cover = salon.cover_image_url ?? salon.image_url ?? DEFAULT_COVER;
  const services: ShopData["services"] = (data.services ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    price: Number(s.price ?? 0),
    duration: s.duration_minutes ?? 30,
    desc: s.description ?? "Professional beauty service.",
    image: s.image_url ?? undefined,
    category: s.category ?? undefined,
    popular: false,
  }));
  const staff: ShopData["staff"] = (data.staff ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    designation: s.role ?? "Beauty Specialist",
    image: s.avatar_url ?? cover,
    experience: 5,
    specialization: s.bio ?? undefined,
    rating: s.rating ?? undefined,
    available: true,
  }));
  const gallery: ShopData["gallery"] = (salon.gallery_images ?? []).map(
    (url: string, i: number) => ({
      url,
      type: "photo" as const,
      category: i % 2 ? "Work" : "Interior",
    }),
  );
  if (salon.video_url) {
    gallery.push({ url: salon.video_url, type: "video", category: "Salon Video" });
  }
  const reviews = (data.reviews ?? []).map((r) => ({
    id: r.id,
    author: "Guest",
    rating: r.rating,
    text: r.comment ?? "Great service.",
    date: new Date(r.created_at).toLocaleDateString("en-IN"),
    source: "site" as const,
  }));
  return {
    slug: salon.slug,
    name: salon.name,
    tagline: salon.tagline ?? salon.description ?? "",
    category: salon.category ?? "Salon",
    city: salon.location ?? "",
    address: salon.address ?? salon.location ?? "",
    whatsapp: salon.whatsapp ?? salon.phone ?? "",
    phone: salon.phone ?? "",
    email: "",
    coverImage: cover,
    rating: salon.rating ?? 0,
    reviewCount: salon.reviews_count ?? 0,
    about: salon.about_us ?? salon.description ?? "",
    services,
    staff,
    gallery,
    reviews,
    faqs: [],
    offers: [],
    packages: [],
    memberships: [],
    loyalty: { pointsPerVisit: 0, referralPoints: 0, birthdayReward: "", festivalReward: "" },
    blog: [],
    coupons: [],
    awards: [],
    brands: [],
    beforeAfter: [],
    testimonials: [],
    socialLinks: {},
    hours: toWebsiteHours(salon.hours),
    location: { lat: salon.latitude ?? 0, lng: salon.longitude ?? 0 },
  };
}

function toWebsiteHours(value: unknown): ShopData["hours"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value as Record<string, unknown>).flatMap(([day, raw]) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
    const row = raw as { open?: unknown; close?: unknown; closed?: unknown };
    if (row.closed === true || typeof row.open !== "string" || typeof row.close !== "string") {
      return [];
    }
    return [{ day, open: row.open, close: row.close }];
  });
}

function useNavigateSafe() {
  try {
    return useNavigate();
  } catch {
    return undefined;
  }
}

function TemplateSwitcher({
  current,
  onChange,
}: {
  current: TemplateKey;
  onChange: (k: TemplateKey) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="sticky top-[60px] z-20 mx-auto flex max-w-7xl items-center justify-end px-6 py-2 md:px-10">
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-muted"
        >
          <Paintbrush className="h-3.5 w-3.5" />
          Template: {TEMPLATES[current].name}
        </button>
        {open && (
          <div className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-lg border bg-white shadow-lg">
            {TEMPLATE_KEYS.map((k) => {
              const t = TEMPLATES[k];
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    onChange(k);
                    setOpen(false);
                  }}
                  className={`flex w-full items-start gap-3 px-3 py-2 text-left hover:bg-muted ${current === k ? "bg-muted" : ""}`}
                >
                  <span
                    className="mt-1 inline-flex h-5 w-5 shrink-0 rounded-full border"
                    style={{ backgroundColor: t.colors.primary, borderColor: t.colors.secondary }}
                  />
                  <span>
                    <span className="block text-sm font-semibold">{t.name}</span>
                    <span className="text-muted-foreground block text-[11px]">{t.tagline}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
