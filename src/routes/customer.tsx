import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { LocationPermissionModal } from "@/components/auth/LocationPermissionModal";
import { BackButton } from "@/components/shared/BackButton";
import { supabase } from "@/integrations/supabase/client";

/**
 * /customer/* is a signed-in surface. Both customer and owner users are
 * allowed here so an owner can browse the app as a customer without a
 * role toggle. Admins can visit as well.
 */
export const Route = createFileRoute("/customer")({
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
  component: CustomerLayout,
});

function CustomerLayout() {
  return (
    <>
      <div className="pb-20 md:pb-0">
        <div className="sticky top-0 z-30 border-b border-border/60 bg-card/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">
            <BackButton size="icon" className="shrink-0" />
            <span className="text-sm font-semibold text-heading">Nexora</span>
          </div>
        </div>
        <Outlet />
      </div>
      <MobileBottomNav />
      <LocationPermissionModal />
    </>
  );
}
