import { createFileRoute } from "@tanstack/react-router";
import { OwnerGalleryPage } from "@/pages/owner/OwnerGalleryPage";

export const Route = createFileRoute("/owner/gallery")({
  head: () => ({
    meta: [
      { title: "Owner · Gallery — Nexora" },
      { name: "description", content: "Manage your salon photo and video gallery." },
    ],
  }),
  component: OwnerGalleryPage,
});
