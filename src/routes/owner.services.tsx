import { createFileRoute } from "@tanstack/react-router";
import { OwnerServicesPage } from "@/pages/owner/OwnerServicesPage";

export const Route = createFileRoute("/owner/services")({
  head: () => ({
    meta: [
      { title: "Owner · Services — Nexora" },
      {
        name: "description",
        content: "Manage your salon's service catalog: categories, pricing, durations, and offers.",
      },
    ],
  }),
  component: OwnerServicesPage,
});
