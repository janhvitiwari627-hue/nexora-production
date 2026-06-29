import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { WebsiteRenderer } from "@/components/whiteLabelWebsite/WebsiteRenderer";
import { WhiteLabelHeader } from "@/components/whiteLabelWebsite/WhiteLabelHeader";
import { WhiteLabelFooter } from "@/components/whiteLabelWebsite/WhiteLabelFooter";
import { ViralGrowthWidget } from "@/components/whiteLabelWebsite/ViralGrowthWidget";
import { MOCK_CONFIG, type ShopData, type WebsiteConfig } from "@/components/whiteLabelWebsite/types";
import { getTemplate, normalizeTemplateKey, TEMPLATE_KEYS, TEMPLATES, type TemplateKey } from "@/components/whiteLabelWebsite/templates";
import { getSalonBySlug } from "@/lib/salons.functions";
import { Paintbrush } from "lucide-react";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1600&q=80";

export function WhiteLabelWebsitePage({ slug: _slug, routeSearch }: { slug?: string; routeSearch?: { t?: string; preview?: 1 } }) {
  const { data, isLoading } = useQuery({
    queryKey: ["white-label-site", _slug],
    queryFn: () => (_slug ? getSalonBySlug({ data: { slug: _slug } }) : Promise.resolve(null)),
    enabled: !!_slug,
  });
  const navigate = useNavigateSafe();

  const browserSearch = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const isPreview = routeSearch?.preview === 1 || browserSearch?.get("preview") === "1";

  if (isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">
        Loading salon website…
      </div>
    );
  }

  if (!data?.salon) {
    return (
      <div className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-6 text-center">
        <div className="space-y-4">
          <div className="text-5xl">🌿</div>
          <h1 className="text-2xl font-semibold">This salon website is not available.</h1>
          <p className="text-muted-foreground">
            The link you followed may be incorrect or the owner has not published their site yet.
          </p>
          <Link to="/" className="inline-flex rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
            Go to homepage
          </Link>
        </div>
      </div>
    );
  }

  const shop = toShopData(data);
  const savedTemplateKey = data.salon.selected_template_key ?? "modern-salon";
  const templateKey = normalizeTemplateKey(routeSearch?.t ?? browserSearch?.get("t") ?? savedTemplateKey);

  const config: WebsiteConfig = { ...MOCK_CONFIG, template: templateKey };
  const template = getTemplate(templateKey);

  const setTemplate = (key: TemplateKey) => {
    if (navigate) navigate({ to: ".", search: (prev: Record<string, unknown>) => ({ ...prev, t: key }), replace: true } as never);
  };

  const wrapperClass =
    templateKey === "royal-luxe" ? "tpl-royal" :
    templateKey === "professional-beauty" ? "tpl-blossom" : "tpl-modern";

  const bgColor =
    templateKey === "royal-luxe" ? "#0B0B0B" :
    templateKey === "professional-beauty" ? "#FFFDFD" :
    template.colors.bg;

  return (
    <div className={wrapperClass} style={{ fontFamily: template.font, backgroundColor: bgColor, color: template.colors.text }}>
      {isPreview && (
        <div className="sticky top-0 z-40 w-full bg-amber-500 text-amber-950 shadow-md">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-2 text-sm font-medium sm:flex-row">
            <span className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-900" />
              Preview mode — {TEMPLATES[templateKey].name}. Not published yet.
            </span>
            <a
              href="/owner/create-website"
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
  const gallery = (salon.gallery_images ?? []).map((url: string, i: number) => ({
    url,
    type: "photo" as const,
    category: i % 2 ? "Work" : "Interior",
  }));
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
    about: salon.description ?? "",
    services,
    staff,
    gallery,
    reviews,
    location: { lat: salon.latitude ?? 0, lng: salon.longitude ?? 0 },
  };
}


function useNavigateSafe() {
  try { return useNavigate(); } catch { return undefined; }
}

function TemplateSwitcher({
  current, onChange,
}: { current: TemplateKey; onChange: (k: TemplateKey) => void }) {
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
                  onClick={() => { onChange(k); setOpen(false); }}
                  className={`flex w-full items-start gap-3 px-3 py-2 text-left hover:bg-muted ${current === k ? "bg-muted" : ""}`}
                >
                  <span className="mt-1 inline-flex h-5 w-5 shrink-0 rounded-full border" style={{ backgroundColor: t.colors.primary, borderColor: t.colors.secondary }} />
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
