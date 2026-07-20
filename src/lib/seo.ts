/**
 * SEO helpers for TanStack Start routes.
 *
 * Usage in a route file:
 *
 *   import { buildSeoHead, generateLocalBusinessSchema } from "@/lib/seo";
 *
 *   export const Route = createFileRoute("/shop/$slug")({
 *     head: ({ params }) =>
 *       buildSeoHead({
 *         title: "Glow Studio — Nexora",
 *         description: "Premium hair & spa services in Jaipur.",
 *         path: `/shop/${params.slug}`,
 *         schema: generateLocalBusinessSchema({ ... }),
 *       }),
 *     component: ShopPage,
 *   });
 */

export const SITE_BASE_URL = "https://radiant-hub-os.lovable.app";
export const SITE_NAME = "Nexora SalonOS";
export const DEFAULT_OG_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/232256ad-c4f3-4f72-84f1-0c97aa408c63/id-preview-d451d0e4--822fe342-2aa4-466c-8092-9280657c85a5.lovable.app-1781852479510.png";

export interface SeoHeadInput {
  title: string;
  description: string;
  /** Route path including leading slash, e.g. "/shop/glow-studio". */
  path: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: "website" | "article" | "product" | "profile";
  /** A single JSON-LD object or an array of them. */
  schema?: Record<string, unknown> | Array<Record<string, unknown>>;
  noindex?: boolean;
}

type HeadMeta = Array<Record<string, string>>;
type HeadLinks = Array<Record<string, string>>;
type HeadScripts = Array<{ type: string; children: string }>;

export interface SeoHeadResult {
  meta: HeadMeta;
  links: HeadLinks;
  scripts: HeadScripts;
}

/**
 * Build TanStack `head()` return object with title, description, OG/Twitter
 * tags, canonical, optional robots noindex, and optional JSON-LD schema.
 */
export function buildSeoHead(input: SeoHeadInput): SeoHeadResult {
  const {
    title,
    description,
    path,
    keywords,
    ogImage = DEFAULT_OG_IMAGE,
    ogType = "website",
    schema,
    noindex,
  } = input;

  const url = `${SITE_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const meta: HeadMeta = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: ogType },
    { property: "og:url", content: url },
    { property: "og:image", content: ogImage },
    { property: "og:site_name", content: SITE_NAME },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
  ];

  if (keywords && keywords.length > 0) {
    meta.push({ name: "keywords", content: keywords.join(", ") });
  }

  if (noindex) {
    meta.push({ name: "robots", content: "noindex, nofollow" });
  }

  const links: HeadLinks = [{ rel: "canonical", href: url }];

  const scripts: HeadScripts = [];
  if (schema) {
    const all = Array.isArray(schema) ? schema : [schema];
    for (const s of all) {
      scripts.push({
        type: "application/ld+json",
        children: JSON.stringify(s),
      });
    }
  }

  return { meta, links, scripts };
}

// ---------------------------------------------------------------------------
// JSON-LD generators
// ---------------------------------------------------------------------------

export interface LocalBusinessInput {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  telephone?: string;
  priceRange?: string;
  address?: {
    street?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
  geo?: { lat: number; lng: number };
  rating?: { value: number; count: number };
  openingHours?: string[]; // e.g. ["Mo-Sa 10:00-21:00"]
}

export function generateLocalBusinessSchema(shop: LocalBusinessInput) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    name: shop.name,
    url: `${SITE_BASE_URL}/shop/${shop.slug}`,
  };
  if (shop.description) schema.description = shop.description;
  if (shop.image) schema.image = shop.image;
  if (shop.telephone) schema.telephone = shop.telephone;
  if (shop.priceRange) schema.priceRange = shop.priceRange;
  if (shop.address) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: shop.address.street,
      addressLocality: shop.address.city,
      addressRegion: shop.address.region,
      postalCode: shop.address.postalCode,
      addressCountry: shop.address.country ?? "IN",
    };
  }
  if (shop.geo) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: shop.geo.lat,
      longitude: shop.geo.lng,
    };
  }
  if (shop.rating) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: shop.rating.value,
      reviewCount: shop.rating.count,
    };
  }
  if (shop.openingHours) schema.openingHoursSpecification = shop.openingHours;
  return schema;
}

export interface ServiceInput {
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  durationMinutes?: number;
  image?: string;
}

export function generateServiceSchema(service: ServiceInput, shop: { name: string; slug: string }) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    provider: {
      "@type": "HealthAndBeautyBusiness",
      name: shop.name,
      url: `${SITE_BASE_URL}/shop/${shop.slug}`,
    },
  };
  if (service.description) schema.description = service.description;
  if (service.image) schema.image = service.image;
  if (typeof service.price === "number") {
    schema.offers = {
      "@type": "Offer",
      price: service.price,
      priceCurrency: service.currency ?? "INR",
    };
  }
  return schema;
}

export interface WebPageInput {
  name: string;
  description: string;
  path: string;
  breadcrumbs?: Array<{ name: string; path: string }>;
}

export function generateWebPageSchema(page: WebPageInput) {
  const url = `${SITE_BASE_URL}${page.path}`;
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.name,
    description: page.description,
    url,
  };
  if (page.breadcrumbs && page.breadcrumbs.length > 0) {
    schema.breadcrumb = {
      "@type": "BreadcrumbList",
      itemListElement: page.breadcrumbs.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.name,
        item: `${SITE_BASE_URL}${b.path}`,
      })),
    };
  }
  return schema;
}
