import { createFileRoute } from "@tanstack/react-router";
import { GrowthPartnerPage } from "@/pages/public/GrowthPartnerPage";

export const Route = createFileRoute("/growth-partner")({
  head: () => ({
    meta: [
      { title: "Nexora SalonOS — District Business Partner Program" },
      {
        name: "description",
        content:
          "Become a Nexora Growth Partner. Own your district, onboard salons, earn recurring income with India's Beauty Industry Operating System.",
      },
      { property: "og:title", content: "Nexora Growth Partner Program" },
      {
        property: "og:description",
        content:
          "Own your district. Onboard salons. Earn recurring income with Nexora SalonOS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GrowthPartnerPage,
});
