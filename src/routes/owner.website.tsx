import { createFileRoute } from "@tanstack/react-router";
import { WebsiteEditorPage } from "@/pages/owner/WebsiteEditorPage";

export const Route = createFileRoute("/owner/website")({
  validateSearch: (search: Record<string, unknown>) => ({
    live: search.live === "1" || search.live === 1 || search.live === true ? 1 : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Website Management — Nexora Owner" },
      { name: "description", content: "Customize your booking website: branding, SEO, domain, sections and socials." },
    ],
  }),
  component: WebsiteEditorPage,
});
