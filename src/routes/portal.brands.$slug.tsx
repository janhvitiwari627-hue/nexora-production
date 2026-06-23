import { createFileRoute } from "@tanstack/react-router";
import { BrandProfilePage } from "@/pages/portal/BrandProfilePage";

export const Route = createFileRoute("/portal/brands/$slug")({
  head: () => ({ meta: [{ title: "Brand — Nexora Portal" }] }),
  component: BrandProfilePage,
});
