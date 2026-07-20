import { createFileRoute } from "@tanstack/react-router";
import { WebsiteEditorPage } from "@/pages/owner/WebsiteEditorPage";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/owner/website")({
  beforeLoad: ({ location }) => requireRole(["owner", "shop_owner", "admin"], location.pathname),
  validateSearch: (search: Record<string, unknown>): { live?: 1 } => ({
    live: search.live === "1" || search.live === 1 || search.live === true ? 1 : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Website Management — Nexora Owner" },
      {
        name: "description",
        content: "Customize your booking website: branding, SEO, domain, sections and socials.",
      },
    ],
  }),
  component: WebsiteEditorPage,
});
