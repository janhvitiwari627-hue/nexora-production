import { createFileRoute } from "@tanstack/react-router";
import { DistributorRegistrationPage } from "@/pages/portal/DistributorRegistrationPage";

export const Route = createFileRoute("/portal/distributors/register")({
  head: () => ({ meta: [{ title: "Register Distributor — Nexora Portal" }] }),
  component: DistributorRegistrationPage,
});
