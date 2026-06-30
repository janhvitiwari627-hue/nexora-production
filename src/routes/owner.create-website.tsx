import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy route — single source of truth is now /owner/templates.
export const Route = createFileRoute("/owner/create-website")({
  beforeLoad: () => {
    throw redirect({ to: "/owner/templates", replace: true });
  },
});
