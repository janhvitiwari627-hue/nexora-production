import { createFileRoute } from "@tanstack/react-router";
import { AccountSettingsPage } from "@/pages/customer/AccountSettingsPage";

export const Route = createFileRoute("/customer/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Nexora" },
      { name: "description", content: "Manage your Nexora profile, security, and preferences." },
    ],
  }),
  component: AccountSettingsPage,
});
