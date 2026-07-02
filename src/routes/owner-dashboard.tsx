import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/owner-dashboard")({
  // Legacy hyphenated URL — canonical path is /owner/dashboard.
  beforeLoad: () => {
    throw redirect({ to: "/owner/dashboard", replace: true });
  },
});
