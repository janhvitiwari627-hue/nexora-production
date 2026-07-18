import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/distributor-brand-portal")({
  beforeLoad: () => {
    // Public entry point for the distributor + brand portal.
    throw redirect({ to: "/portal" });
  },
});
