import { createFileRoute } from "@tanstack/react-router";
import { TemplateGalleryPage } from "@/pages/owner/TemplateGalleryPage";

export const Route = createFileRoute("/owner/templates")({
  head: () => ({
    meta: [
      { title: "Template Gallery — Nexora Owner" },
      { name: "description", content: "Browse and switch your booking website template." },
    ],
  }),
  component: TemplateGalleryPage,
});
