import { createFileRoute, redirect } from "@tanstack/react-router";
import CustomerAppPage from "@/pages/public/CustomerAppPage";
import { isStandaloneDisplay } from "@/lib/pwa-standalone-guard";

export const Route = createFileRoute("/customer-app")({
  // Installed-state guard: when the user opens /customer-app from the
  // installed PWA (standalone display-mode / iOS navigator.standalone),
  // skip the marketing/install landing entirely and jump into the app.
  // This ensures PublicHeader / PublicFooter / PublicPageHeader and any
  // owner/distributor/growth navigation can never mount in the installed
  // experience.
  beforeLoad: () => {
    if (typeof window !== "undefined" && isStandaloneDisplay()) {
      throw redirect({ to: "/customer/home" });
    }
  },
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

