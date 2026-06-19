import { createFileRoute, useParams } from "@tanstack/react-router";
import { JobDetailPage } from "@/pages/jobs/JobDetailPage";

export const Route = createFileRoute("/jobs/$jobId")({
  head: () => ({ meta: [{ title: "Job — Nexora Careers" }] }),
  component: JobDetailRoute,
});

function JobDetailRoute() {
  const { jobId } = useParams({ from: "/jobs/$jobId" });
  return <JobDetailPage jobId={jobId} />;
}
