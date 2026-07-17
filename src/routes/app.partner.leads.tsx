import { createFileRoute } from "@tanstack/react-router";
import { PartnerLeadsPage } from "@/pages/partner/PartnerLeadsPage";
export const Route = createFileRoute("/app/partner/leads")({ component: PartnerLeadsPage });
