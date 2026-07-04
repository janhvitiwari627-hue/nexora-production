import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/partner/profile")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/settings", replace: true });
  },
});
