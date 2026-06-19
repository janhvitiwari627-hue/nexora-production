import { Outlet, createFileRoute } from "@tanstack/react-router";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/_owner")({
  ssr: false,
  beforeLoad: ({ location }) => requireRole(["owner"], location.href),
  component: () => <Outlet />,
});
