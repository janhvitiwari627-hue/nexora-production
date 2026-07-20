import { createFileRoute } from "@tanstack/react-router";
import CustomerAppPage from "@/pages/public/CustomerAppPage";

export const Route = createFileRoute("/customer-app")({
  head: () => ({
    meta: [
      { title: "Nexora Customer App — Coming Soon" },
      {
        name: "description",
        content:
          "The Nexora Customer App is launching separately. Join the waitlist to book salons, scan-and-pay and earn rewards on Android, iOS and web.",
      },
      { property: "og:title", content: "Nexora Customer App — Coming Soon" },
      {
        property: "og:description",
        content: "The Nexora Customer App is launching separately. Join the waitlist.",
      },
      { property: "og:url", content: "https://meripahalfasthelp.online/customer-app" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://meripahalfasthelp.online/customer-app" }],
  }),
  component: CustomerAppPage,
});
