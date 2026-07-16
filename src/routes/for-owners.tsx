import { createFileRoute } from "@tanstack/react-router";
import { ForOwnersPage } from "@/pages/public/ForOwnersPage";

export const Route = createFileRoute("/for-owners")({
  head: () => ({
    meta: [
      { title: "Nexora SalonOS for Salon Owners" },
      {
        name: "description",
        content:
          "Register your salon, get a free booking website and manage bookings with no monthly charge. Pay only 10% on completed bookings.",
      },
      { property: "og:title", content: "Nexora SalonOS for Salon Owners" },
    ],
  }),
  component: ForOwnersPage,
});
