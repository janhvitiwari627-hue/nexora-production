import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy route — single source of truth is now /owner/website/edit.
export const Route = createFileRoute("/owner/create-website")({
  beforeLoad: () => {
    throw redirect({ to: "/owner/website/edit", replace: true });
  },
});
