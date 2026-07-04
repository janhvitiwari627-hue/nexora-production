import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/owner/profile")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/settings", replace: true });
  },
});
