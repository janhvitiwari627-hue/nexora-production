import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/growth-partner")({
  beforeLoad: () => {
    throw redirect({ to: "/partner/growth" });
  },
});
