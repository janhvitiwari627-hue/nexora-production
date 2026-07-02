import { createFileRoute } from "@tanstack/react-router";
import CustomerAppPage from "@/pages/public/CustomerAppPage";

export const Route = createFileRoute("/customer-app")({
  head: () => ({
    meta: [
      { title: "Nexora Customer App — 60-Second Salon Booking & QR Rewards" },
      { name: "description", content: "Nearby verified salons, transparent prices, 60-second booking and QR rewards. Install the Nexora Customer App on Android, iOS or desktop." },
      { property: "og:title", content: "Nexora Customer App" },
      { property: "og:description", content: "Nearby verified salons, transparent prices, 60-second booking and QR rewards." },
      { property: "og:url", content: "https://meripahalfasthelp.online/customer-app" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://meripahalfasthelp.online/customer-app" }],
  }),
  component: CustomerAppPage,
});
