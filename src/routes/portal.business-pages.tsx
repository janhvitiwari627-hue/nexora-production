import { createFileRoute } from "@tanstack/react-router";
import { BusinessPagesPage } from "@/pages/portal/SimplePages";

export const Route = createFileRoute("/portal/business-pages")({
  head: () => ({ meta: [{ title: "Business Pages — Nexora Portal" }] }),
  component: BusinessPagesPage,
});
