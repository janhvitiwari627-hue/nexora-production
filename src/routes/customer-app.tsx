import { createFileRoute } from "@tanstack/react-router";
import CustomerAppPage from "@/pages/public/CustomerAppPage";

export const Route = createFileRoute("/customer-app")({
  head: () => ({
    meta: [
      { title: "Nexora Customer App — Search, book and earn rewards" },
      {
        name: "description",
        content:
          "Install or open the Nexora Customer App to discover published salons, manage bookings and access rewards with your existing Nexora login.",
      },
      {
        property: "og:title",
        content: "Nexora Customer App — Search, book and earn rewards",
      },
      {
        property: "og:description",
        content: "Install or continue in the browser with your existing Nexora account.",
      },
      { property: "og:url", content: "https://meripahalfasthelp.online/customer-app" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://meripahalfasthelp.online/customer-app" }],
  }),
  component: CustomerAppPage,
});
