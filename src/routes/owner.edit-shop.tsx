import { createFileRoute } from "@tanstack/react-router";
import { EditShopPage } from "@/pages/owner/EditShopPage";

export const Route = createFileRoute("/owner/edit-shop")({
  head: () => ({
    meta: [
      { title: "Edit Shop — Nexora Owner" },
      { name: "description", content: "Update your shop details, category, and contact info." },
    ],
  }),
  component: EditShopPage,
});
