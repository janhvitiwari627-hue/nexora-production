import { createFileRoute } from "@tanstack/react-router";
import { PortalLandingPage } from "@/pages/portal/PortalLandingPage";

const URL = "https://meripahalfasthelp.online/portal";

export const Route = createFileRoute("/portal/")({
  head: () => ({
    meta: [
      { title: "Distributor & Brand Portal — Nexora" },
      { name: "description", content: "Promote your beauty brand, products and distribution network across thousands of salons and beauty businesses on Nexora." },
      { property: "og:title", content: "Distributor & Brand Portal — Nexora" },
      { property: "og:description", content: "Grow your beauty brand across India — connect with salons, spas and beauty retailers." },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: PortalLandingPage,
});

