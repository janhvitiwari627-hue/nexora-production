import { createFileRoute } from "@tanstack/react-router";
import { OwnerSettingsPage } from "@/pages/owner/OwnerSettingsPage";

export const Route = createFileRoute("/owner/settings")({
  head: () => ({
    meta: [
      { title: "Shop Settings — Nexora Owner" },
      {
        name: "description",
        content:
          "Manage all your shop details in one place — business basics, contact, branding. Changes update your booking website instantly.",
      },
    ],
  }),
  component: OwnerSettingsPage,
});
