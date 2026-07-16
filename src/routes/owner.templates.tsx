import { createFileRoute } from "@tanstack/react-router";
import { CreateWebsitePage } from "@/pages/owner/CreateWebsitePage";

export const Route = createFileRoute("/owner/templates")({
  head: () => ({
    meta: [
      { title: "Choose or Change Shop Template — Nexora" },
      {
        name: "description",
        content:
          "Choose or change your salon shop template without losing services, photos, content or bookings.",
      },
    ],
  }),
  component: CreateWebsitePage,
});
