import { createFileRoute } from "@tanstack/react-router";
import { PortalLandingPage } from "@/pages/portal/PortalLandingPage";

export const Route = createFileRoute("/portal/")({
  head: () => ({ meta: [
    { title: "Distributor & Brand Portal — Nexora" },
    { name: "description", content: "Promote your brand, products and distribution network across thousands of beauty businesses on Nexora." },
  ]}),
  component: PortalLandingPage,
});
