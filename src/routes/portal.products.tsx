import { createFileRoute } from "@tanstack/react-router";
import { ProductShowcasePage } from "@/pages/portal/ProductShowcasePage";

export const Route = createFileRoute("/portal/products")({
  head: () => ({ meta: [{ title: "Product Showcase — Nexora Portal" }] }),
  component: ProductShowcasePage,
});
