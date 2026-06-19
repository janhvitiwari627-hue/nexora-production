import { createFileRoute } from "@tanstack/react-router";
import { AccountSettingsPage } from "@/pages/customer/AccountSettingsPage";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({
    meta: [
      { title: "Account Settings — Nexora" },
      {
        name: "description",
        content:
          "Manage your Nexora profile, security, payment methods, notifications and privacy preferences.",
      },
      { property: "og:title", content: "Nexora Account Settings" },
    ],
  }),
  component: AccountSettingsPage,
});
