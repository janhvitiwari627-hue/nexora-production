import { createFileRoute } from "@tanstack/react-router";
import { PlatformSettingsPage } from "@/pages/admin/PlatformSettingsPage";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Platform Settings — Nexora Admin" }] }),
  component: PlatformSettingsPage,
});
