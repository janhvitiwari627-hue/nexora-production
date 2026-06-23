import { createFileRoute } from "@tanstack/react-router";
import { LeadOpportunitiesPage } from "@/pages/portal/SimplePages";

export const Route = createFileRoute("/portal/leads")({
  head: () => ({ meta: [{ title: "Lead Opportunities — Nexora Portal" }] }),
  component: LeadOpportunitiesPage,
});
