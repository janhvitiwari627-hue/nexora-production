import { Outlet, createFileRoute } from "@tanstack/react-router";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/_customer")({
  ssr: false,
  beforeLoad: ({ location }) => requireRole(["customer"], location.href),
  component: () => <Outlet />,
});
