import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/jobs/my-applications")({
  beforeLoad: () => {
    throw redirect({ to: "/jobs/applications" });
  },
});
