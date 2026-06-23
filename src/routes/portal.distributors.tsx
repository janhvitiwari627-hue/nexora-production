import { createFileRoute } from "@tanstack/react-router";
import { DistributorDirectoryPage } from "@/pages/portal/DistributorDirectoryPage";

export const Route = createFileRoute("/portal/distributors")({
  head: () => ({ meta: [{ title: "Distributor Directory — Nexora Portal" }] }),
  component: DistributorDirectoryPage,
});
