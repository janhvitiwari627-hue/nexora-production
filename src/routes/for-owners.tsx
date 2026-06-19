import { createFileRoute } from "@tanstack/react-router";
import { ForOwnersPage } from "@/pages/public/ForOwnersPage";

export const Route = createFileRoute("/for-owners")({
  head: () => ({
    meta: [
      { title: "Nexora SalonOS — Software for salon owners" },
      { name: "description", content: "Bookings, payments, marketing & analytics — the operating system for modern salons." },
      { property: "og:title", content: "Nexora SalonOS for Owners" },
    ],
  }),
  component: ForOwnersPage,
});
