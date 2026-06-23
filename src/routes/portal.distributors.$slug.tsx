import { createFileRoute } from "@tanstack/react-router";
import { DistributorProfilePage } from "@/pages/portal/DistributorProfilePage";

export const Route = createFileRoute("/portal/distributors/$slug")({
  head: () => ({ meta: [{ title: "Distributor — Nexora Portal" }] }),
  component: DistributorProfilePage,
});
