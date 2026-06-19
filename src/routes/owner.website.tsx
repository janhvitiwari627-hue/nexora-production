import { createFileRoute } from "@tanstack/react-router";
import { OwnerWebsitePage } from "@/pages/owner/OwnerWebsitePage";

export const Route = createFileRoute("/owner/website")({
  head: () => ({
    meta: [
      { title: "Website Management — Nexora Owner" },
      { name: "description", content: "Customize your booking website: branding, SEO, domain, sections and socials." },
    ],
  }),
  component: OwnerWebsitePage,
});
