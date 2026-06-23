import { createFileRoute } from "@tanstack/react-router";
import { BrandDirectoryPage } from "@/pages/portal/BrandDirectoryPage";

export const Route = createFileRoute("/portal/brands/")({
  head: () => ({ meta: [{ title: "Brand Directory — Nexora Portal" }] }),
  component: BrandDirectoryPage,
});
