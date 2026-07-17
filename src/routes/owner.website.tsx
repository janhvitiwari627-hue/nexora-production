import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/owner/website")({
  beforeLoad: () => {
    throw redirect({ to: "/owner/website/edit", replace: true });
  },
  validateSearch: (search: Record<string, unknown>) => ({
    live: search.live === "1" || search.live === 1 || search.live === true ? 1 : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Website Management — Nexora Owner" },
      { name: "description", content: "Customize your booking website: branding, SEO, domain, sections and socials." },
    ],
  }),
});
