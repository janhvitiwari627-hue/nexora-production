import { createFileRoute } from "@tanstack/react-router";
import { PartnerDashboardPage } from "@/pages/partner/PartnerDashboardPage";
export const Route = createFileRoute("/app/partner/")({ component: PartnerDashboardPage });
