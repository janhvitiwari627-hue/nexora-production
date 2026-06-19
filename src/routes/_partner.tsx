import { Outlet, createFileRoute } from "@tanstack/react-router";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/_partner")({
  ssr: false,
  beforeLoad: ({ location }) =>
    requireRole(["growth_partner", "district_partner", "distributor"], location.href),
  component: () => <Outlet />,
});
