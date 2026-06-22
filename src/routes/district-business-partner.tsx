import { createFileRoute } from "@tanstack/react-router";
import DistrictBusinessPartnerPage from "@/pages/public/DistrictBusinessPartnerPage";

export const Route = createFileRoute("/district-business-partner")({
  head: () => ({
    meta: [
      { title: "District Business Partner — Nexora SalonOS" },
      {
        name: "description",
        content:
          "Build your district. Grow the Nexora network. Earn through real business growth — no joining fee, no investment, transparent performance-based rewards.",
      },
      { property: "og:title", content: "District Business Partner — Nexora SalonOS" },
      {
        property: "og:description",
        content:
          "A District Growth Leadership Opportunity for beauty industry insiders. Activation reward + 7-day recurring growth share.",
      },
    ],
  }),
  component: DistrictBusinessPartnerPage,
});
