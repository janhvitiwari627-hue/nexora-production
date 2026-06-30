import { createFileRoute } from "@tanstack/react-router";
import { CreateWebsitePage } from "@/pages/owner/CreateWebsitePage";

export const Route = createFileRoute("/owner/templates")({
  head: () => ({
    meta: [
      { title: "Choose Your Website Template — Nexora" },
      {
        name: "description",
        content:
          "Pick one of three Nexora templates — Luxury Salon, Modern Professional, or Spa & Wellness — and launch your booking website in minutes.",
      },
    ],
  }),
  component: CreateWebsitePage,
});
