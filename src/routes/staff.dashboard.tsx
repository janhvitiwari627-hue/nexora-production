import { createFileRoute } from "@tanstack/react-router";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/staff/dashboard")({
  ssr: false,
  beforeLoad: () => requireRole(["staff", "shop_manager", "shop_owner"], "/staff/dashboard"),
  head: () => ({ meta: [{ title: "Staff Dashboard — Nexora" }] }),
  component: StaffDashboard,
});

function StaffDashboard() {
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold">Staff Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Today's bookings and assigned tasks will appear here.
      </p>
    </div>
  );
}
