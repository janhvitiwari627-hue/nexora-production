import { createFileRoute } from "@tanstack/react-router";
import { requireRole } from "@/lib/route-guards";
import { BackButton } from "@/components/shared/BackButton";
import { Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/staff/dashboard")({
  ssr: false,
  beforeLoad: () => requireRole(["staff", "shop_manager", "shop_owner"], "/staff/dashboard"),
  head: () => ({ meta: [{ title: "Staff Dashboard — Nexora" }] }),
  component: StaffDashboard,
});

function StaffDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 border-b border-border/60 bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">
          <BackButton size="icon" className="shrink-0" aria-label="Go back" />
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-gradient-cta grid h-8 w-8 place-items-center rounded-lg text-primary-foreground shadow-[var(--shadow-glow)]">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-gradient-brand text-lg font-extrabold tracking-tight">
              Nexora
            </span>
          </Link>
        </div>
      </div>
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold">Staff Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Today's bookings and assigned tasks will appear here.
        </p>
      </div>
    </div>
  );
}
