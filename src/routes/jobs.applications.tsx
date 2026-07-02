import { createFileRoute } from "@tanstack/react-router";
import { MyApplicationsPage } from "@/pages/jobs/MyApplicationsPage";

export const Route = createFileRoute("/jobs/applications")({
  head: () => ({ meta: [{ title: "My Applications — Nexora" }] }),
  component: MyApplicationsPage,
});
