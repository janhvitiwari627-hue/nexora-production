import { createFileRoute } from "@tanstack/react-router";
import DistrictPartnerProfilePage from "@/pages/public/DistrictPartnerProfilePage";

export const Route = createFileRoute("/district-business-partner/$slug")({
  head: ({ params }) => {
    const name = params.slug
      .split("-")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
    const title = `${name} — District Business Partner · Nexora`;
    const description = `${name} is a verified Nexora District Business Partner — district coverage, achievements, hall of fame status and performance summary.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: DistrictPartnerProfilePage,
});
