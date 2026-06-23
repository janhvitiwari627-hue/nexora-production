import { createFileRoute, useParams } from "@tanstack/react-router";
import { WhiteLabelWebsitePage } from "@/pages/whiteLabelWebsite/WhiteLabelWebsitePage";
import { MOCK_SHOP, MOCK_CONFIG } from "@/components/whiteLabelWebsite/types";

export const Route = createFileRoute("/site/$businessSlug")({
  validateSearch: (search: Record<string, unknown>) => ({
    t: typeof search.t === "string" ? (search.t as string) : undefined,
  }),
  head: ({ params }) => {
    const shop = MOCK_SHOP;
    const url = `https://meripahalfasthelp.online/site/${params.businessSlug}`;
    return {
      meta: [
        { title: MOCK_CONFIG.seoMeta.title },
        { name: "description", content: MOCK_CONFIG.seoMeta.description },
        { name: "keywords", content: MOCK_CONFIG.seoMeta.keywords.join(", ") },
        { property: "og:title", content: MOCK_CONFIG.seoMeta.title },
        { property: "og:description", content: MOCK_CONFIG.seoMeta.description },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { property: "og:image", content: shop.coverImage },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: MOCK_CONFIG.seoMeta.title },
        { name: "twitter:description", content: MOCK_CONFIG.seoMeta.description },
        { name: "twitter:image", content: shop.coverImage },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HealthAndBeautyBusiness",
            name: shop.name,
            description: shop.about,
            image: shop.coverImage,
            telephone: shop.phone,
            email: shop.email,
            address: { "@type": "PostalAddress", streetAddress: shop.address, addressLocality: shop.city, addressCountry: "IN" },
            geo: { "@type": "GeoCoordinates", latitude: shop.location.lat, longitude: shop.location.lng },
            aggregateRating: { "@type": "AggregateRating", ratingValue: shop.rating, reviewCount: shop.reviewCount },
            url,
          }),
        },
      ],
    };
  },
  component: WhiteLabelRouteComponent,
});

function WhiteLabelRouteComponent() {
  const { businessSlug } = useParams({ from: "/site/$businessSlug" });
  return <WhiteLabelWebsitePage slug={businessSlug} />;
}
