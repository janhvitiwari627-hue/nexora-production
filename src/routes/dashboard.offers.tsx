import { createFileRoute } from "@tanstack/react-router";
import { OffersPage } from "@/pages/customer/OffersPage";

export const Route = createFileRoute("/dashboard/offers")({
  head: () => ({
    meta: [
      { title: "Offers & Coupons — Nexora" },
      {
        name: "description",
        content:
          "Browse available coupons, festival offers, membership perks and partner discounts on Nexora.",
      },
      { property: "og:title", content: "Nexora Offers & Coupons" },
    ],
  }),
  component: OffersPage,
});
