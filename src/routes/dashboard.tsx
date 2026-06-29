import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { LocationPermissionModal } from "@/components/auth/LocationPermissionModal";
import { BackButton } from "@/components/shared/BackButton";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("nexora:postLoginRedirect", location.pathname);
      }
      throw redirect({ to: "/login" });
    }
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <>
      <div className="pb-20 md:pb-0">
        <Outlet />
      </div>
      <MobileBottomNav />
      <LocationPermissionModal />
    </>
  );
}
