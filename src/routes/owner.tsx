import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { BackButton } from "@/components/shared/BackButton";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/owner")({
  ssr: false,
  beforeLoad: () => requireRole(["owner", "admin"], "/owner"),
  component: OwnerLayout,
});

function OwnerLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 border-b border-border/60 bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">
          <BackButton size="icon" className="shrink-0" />
          <span className="text-sm font-semibold text-heading">Nexora</span>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
