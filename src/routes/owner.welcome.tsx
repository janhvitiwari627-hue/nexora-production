import { createFileRoute } from "@tanstack/react-router";
import { OwnerWelcomePage } from "@/pages/owner/OwnerWelcomePage";

export const Route = createFileRoute("/owner/welcome")({
  head: () => ({
    meta: [
      { title: "Register Your Salon — Nexora SalonOS" },
      {
        name: "description",
        content:
          "Register your salon, get a free booking website and manage bookings with no monthly charge. Pay only 10% on completed bookings.",
      },
    ],
  }),
  component: OwnerWelcomePage,
});
