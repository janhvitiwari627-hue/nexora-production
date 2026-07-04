import { createFileRoute } from "@tanstack/react-router";
import { OwnerWelcomePage } from "@/pages/owner/OwnerWelcomePage";

export const Route = createFileRoute("/owner/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome — Nexora SalonOS for Owners" },
      {
        name: "description",
        content:
          "Shop owner welcome hub: pick a booking website template and manage everything from your dashboard.",
      },
    ],
  }),
  component: OwnerWelcomePage,
});
