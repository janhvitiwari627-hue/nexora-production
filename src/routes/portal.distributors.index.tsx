import { createFileRoute } from "@tanstack/react-router";
import { DistributorDirectoryPage } from "@/pages/portal/DistributorDirectoryPage";

const URL = "https://meripahalfasthelp.online/portal/distributors";

export const Route = createFileRoute("/portal/distributors/")({
  head: () => ({
    meta: [
      { title: "Beauty Distributor Directory — Nexora Portal" },
      {
        name: "description",
        content:
          "Find verified beauty product distributors, wholesalers and super stockists across Indian states and districts on Nexora.",
      },
      { property: "og:title", content: "Beauty Distributors — Nexora" },
      {
        property: "og:description",
        content: "Verified distributors and wholesalers across India.",
      },
      { property: "og:url", content: URL },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: DistributorDirectoryPage,
});
