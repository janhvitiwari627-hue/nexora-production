import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/owner-signup")({
  beforeLoad: () => {
    throw redirect({ to: "/owner/register-business", replace: true });
  },
});
