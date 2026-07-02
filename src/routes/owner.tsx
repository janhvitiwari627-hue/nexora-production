import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { BackButton } from "@/components/shared/BackButton";
import { ViewSwitcher } from "@/components/layout/ViewSwitcher";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/owner")({
  ssr: false,
  beforeLoad: ({ location }) => {
    const publicPaths = ["/owner/register-business", "/owner/templates", "/owner/create-website"];
    if (publicPaths.some((p) => location.pathname.startsWith(p))) return;
    return requireRole(["owner", "admin"], location.pathname);
  },
  component: OwnerLayout,
});

function OwnerLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 border-b border-border/60 bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">
          <BackButton size="icon" className="shrink-0" />
          <span className="text-sm font-semibold text-heading">Nexora</span>
          <div className="ml-auto">
            <ViewSwitcher mode="owner" />
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
}

