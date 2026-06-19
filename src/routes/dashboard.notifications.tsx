import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/pages/customer/NotificationsPage";

export const Route = createFileRoute("/dashboard/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Nexora" },
      {
        name: "description",
        content:
          "Stay updated with booking confirmations, rewards, offers and account activity on Nexora.",
      },
      { property: "og:title", content: "Nexora Notifications" },
    ],
  }),
  component: NotificationsPage,
});
