import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { BackButton } from "@/components/shared/BackButton";
import { ViewSwitcher } from "@/components/layout/ViewSwitcher";
import { requireRole } from "@/lib/route-guards";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/owner")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const publicPaths = [
      "/owner/register-business",
      "/owner/templates",
      "/owner/create-website",
      "/owner/website",
    ];
    if (publicPaths.some((p) => location.pathname.startsWith(p))) return;

    // Friendly interstitial for unauthenticated visitors before the login redirect.
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("nexora:postLoginRedirect", location.pathname);
      }
      throw redirect({
        to: "/auth-notice",
        search: { to: "/login", reason: "owner-auth", delay: 1400 },
      });
    }

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
