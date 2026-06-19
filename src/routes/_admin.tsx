import { Outlet, createFileRoute } from "@tanstack/react-router";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/_admin")({
  ssr: false,
  beforeLoad: ({ location }) => requireRole(["admin"], location.href),
  component: () => <Outlet />,
});
