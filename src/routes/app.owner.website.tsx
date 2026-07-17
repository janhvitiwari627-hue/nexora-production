import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/owner/website")({
  beforeLoad: () => {
    throw redirect({ to: "/owner/website", replace: true });
  },
});
