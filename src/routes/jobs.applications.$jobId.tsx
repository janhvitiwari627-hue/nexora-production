import { createFileRoute } from "@tanstack/react-router";
import { EmployerJobApplicationsPage } from "@/pages/jobs/EmployerJobApplicationsPage";

export const Route = createFileRoute("/jobs/applications/$jobId")({
  head: () => ({ meta: [{ title: "Applications Received — Nexora" }] }),
  component: EmployerJobApplicationsPage,
});
