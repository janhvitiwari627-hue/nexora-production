import { createFileRoute } from "@tanstack/react-router";
import { PartnerSettingsPage } from "@/pages/partner/PartnerSettingsPage";
export const Route = createFileRoute("/app/partner/profile")({ component: PartnerSettingsPage });
