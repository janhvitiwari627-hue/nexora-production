import { createFileRoute, useParams } from "@tanstack/react-router";
import { WhiteLabelWebsitePage } from "@/pages/whiteLabelWebsite/WhiteLabelWebsitePage";

export const Route = createFileRoute("/site/$businessSlug")({
  validateSearch: (search: Record<string, unknown>) => ({
    t: typeof search.t === "string" ? (search.t as string) : undefined,
    preview: search.preview === "1" || search.preview === 1 || search.preview === true ? 1 : undefined,
  }),
  head: ({ params }) => {
    const url = `https://meripahalfasthelp.online/site/${params.businessSlug}`;
    const title = "Nexora SalonOS — Salon website";
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
  return <WhiteLabelWebsitePage slug={businessSlug} routeSearch={search} />;
}
