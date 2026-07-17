import { createFileRoute, useParams } from "@tanstack/react-router";
import { WhiteLabelWebsitePage } from "@/pages/whiteLabelWebsite/WhiteLabelWebsitePage";
import { SalonNotFound } from "@/pages/public/site/SalonNotFound";

export const Route = createFileRoute("/site/$businessSlug")({
  validateSearch: (search: Record<string, unknown>) => ({
    t: typeof search.t === "string" ? (search.t as string) : undefined,
    preview: search.preview === "1" || search.preview === 1 || search.preview === true ? 1 : undefined,
    live: search.live === "1" || search.live === 1 || search.live === true ? 1 : undefined,
  }),
  head: ({ params }) => {
    const isValid =
      params.businessSlug &&
      params.businessSlug !== "undefined" &&
      params.businessSlug !== "null";
    const url = isValid
      ? `https://meripahalfasthelp.online/site/${params.businessSlug}`
      : "https://meripahalfasthelp.online";
    const title = isValid
      ? "Nexora SalonOS — Salon website"
      : "Salon not found · Nexora";
    const description = "Discover services, stylists and book appointments online.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: WhiteLabelRouteComponent,
});

function WhiteLabelRouteComponent() {
  const { businessSlug } = useParams({ from: "/site/$businessSlug" });
  const search = Route.useSearch();
  if (!businessSlug || businessSlug === "undefined" || businessSlug === "null") {
    return <SalonNotFound />;
  }
  return <WhiteLabelWebsitePage slug={businessSlug} routeSearch={search} />;
}
