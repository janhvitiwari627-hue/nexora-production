import { createFileRoute } from "@tanstack/react-router";
import { BrandDirectoryPage } from "@/pages/portal/BrandDirectoryPage";

const URL = "https://meripahalfasthelp.online/portal/brands";

export const Route = createFileRoute("/portal/brands/")({
  head: () => ({
    meta: [
      { title: "Beauty Brand Directory — Nexora Portal" },
      {
        name: "description",
        content:
          "Browse verified beauty brands, manufacturers and importers across India. Discover products, distributors and contacts on Nexora.",
      },
      { property: "og:title", content: "Beauty Brand Directory — Nexora" },
      {
        property: "og:description",
        content: "Verified beauty brands and manufacturers across India.",
      },
      { property: "og:url", content: URL },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: BrandDirectoryPage,
});
