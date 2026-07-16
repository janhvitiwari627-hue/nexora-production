import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/owner/welcome")({
  beforeLoad: () => {
    throw redirect({ to: "/for-owners", replace: true });
  },
});
