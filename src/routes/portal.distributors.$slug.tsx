import { createFileRoute, notFound } from "@tanstack/react-router";
import { DistributorProfilePage } from "@/pages/portal/DistributorProfilePage";
import { getDistributorBySlug } from "@/pages/portal/lib";

const BASE = "https://meripahalfasthelp.online";

export const Route = createFileRoute("/portal/distributors/$slug")({
  loader: async ({ params }) => {
    const distributor = await getDistributorBySlug(params.slug);
    if (!distributor) throw notFound();
    return { distributor };
  },
  head: ({ params, loaderData }) => {
    const d = loaderData?.distributor;
    const title = d ? `${d.company_name} — Beauty Distributor on Nexora` : "Distributor — Nexora Portal";
    const region = d ? [d.city, d.state].filter(Boolean).join(", ") : "";
    const desc =
      d?.description?.slice(0, 155) ||
      `Connect with ${d?.company_name ?? "this distributor"}${region ? ` in ${region}` : ""} on Nexora.`;
    const url = `${BASE}/portal/distributors/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "profile" },
        ...(d?.cover_url || d?.logo_url
          ? [{ property: "og:image", content: (d.cover_url || d.logo_url) as string }]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: d
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "LocalBusiness",
                name: d.company_name,
                description: d.description ?? undefined,
                image: d.logo_url ?? undefined,
                address: region
                  ? { "@type": "PostalAddress", addressLocality: d.city, addressRegion: d.state }
                  : undefined,
                url,
              }),
            },
          ]
        : [],
    };
  },
  component: DistributorProfilePage,
  errorComponent: ({ error }) => <div className="p-8 text-center text-sm">{error.message}</div>,
  notFoundComponent: () => <div className="p-8 text-center text-sm">Distributor not found.</div>,
});
