import { createFileRoute } from "@tanstack/react-router";
import { PartnerSettingsPage } from "@/pages/partner/PartnerSettingsPage";

export const Route = createFileRoute("/partner/settings")({
  component: PartnerSettingsPage,
});
