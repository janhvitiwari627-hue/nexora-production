import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/salons")({
  beforeLoad: () => {
    // Salon browsing surface currently lives on the home page (search + rails).
    throw redirect({ to: "/" });
  },
});
