import { createFileRoute, notFound } from "@tanstack/react-router";
import { BrandProfilePage } from "@/pages/portal/BrandProfilePage";
import { getBrandBySlug } from "@/pages/portal/lib";

const BASE = "https://meripahalfasthelp.online";

export const Route = createFileRoute("/portal/brands/$slug")({
  loader: async ({ params }) => {
    const brand = await getBrandBySlug(params.slug);
    if (!brand) throw notFound();
    return { brand };
  },
  head: ({ params, loaderData }) => {
    const b = loaderData?.brand;
    const title = b ? `${b.name} — Beauty Brand on Nexora` : "Brand — Nexora Portal";
    const desc =
      b?.tagline ||
      b?.description?.slice(0, 155) ||
      `Discover ${b?.name ?? "this brand"} products, distributors and contacts on Nexora.`;
    const url = `${BASE}/portal/brands/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "product" },
        ...(b?.cover_url || b?.logo_url
          ? [{ property: "og:image", content: (b.cover_url || b.logo_url) as string }]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: b
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Brand",
                name: b.name,
                description: b.description ?? b.tagline ?? undefined,
                logo: b.logo_url ?? undefined,
                url,
              }),
            },
          ]
        : [],
    };
  },
  component: BrandProfilePage,
  errorComponent: ({ error }) => <div className="p-8 text-center text-sm">{error.message}</div>,
  notFoundComponent: () => <div className="p-8 text-center text-sm">Brand not found.</div>,
});
