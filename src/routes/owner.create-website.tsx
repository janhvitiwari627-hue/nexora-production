import { createFileRoute } from "@tanstack/react-router";
import { CreateWebsitePage } from "@/pages/owner/CreateWebsitePage";

export const Route = createFileRoute("/owner/create-website")({
  head: () => ({
    meta: [
      { title: "Create Your Website — Nexora Owner" },
      {
        name: "description",
        content:
          "Choose a design for your booking website. Switch anytime — your content stays intact.",
      },
    ],
  }),
  component: CreateWebsitePage,
});
