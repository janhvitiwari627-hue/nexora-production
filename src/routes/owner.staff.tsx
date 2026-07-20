import { createFileRoute } from "@tanstack/react-router";
import { OwnerStaffPage } from "@/pages/owner/OwnerStaffPage";

export const Route = createFileRoute("/owner/staff")({
  head: () => ({
    meta: [
      { title: "Owner · Staff — Nexora" },
      {
        name: "description",
        content:
          "Manage your salon team: stylists, therapists, specializations, and weekly availability.",
      },
    ],
  }),
  component: OwnerStaffPage,
});
