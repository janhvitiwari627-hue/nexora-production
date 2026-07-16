import { createFileRoute } from "@tanstack/react-router";
import { JobsAppShell } from "@/pages/jobs/app/JobsAppShell";

export const Route = createFileRoute("/app/jobs")({
  ssr: false,
  component: JobsAppShell,
});
