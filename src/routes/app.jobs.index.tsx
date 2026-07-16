import { createFileRoute } from "@tanstack/react-router";
import { JobsAppHomePage } from "@/pages/jobs/app/JobsAppHomePage";

export const Route = createFileRoute("/app/jobs/")({
  head: () => ({ meta: [{ title: "Nexora Beauty Jobs App" }] }),
  component: JobsAppHomePage,
});
