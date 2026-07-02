import { useState } from "react";
import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { LocationPermissionModal } from "@/components/auth/LocationPermissionModal";
import { BackButton } from "@/components/shared/BackButton";
import { ViewSwitcher } from "@/components/layout/ViewSwitcher";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { fetchUserRoles, type UserRole } from "@/lib/auth-redirect";
import { logAnalyticsEvent } from "@/lib/analytics-events.functions";
import { LayoutDashboard, LogOut } from "lucide-react";



const BROWSE_AS_CUSTOMER_KEY = "nexora:browseAsCustomer";

/**
 * /customer/* is a signed-in surface for end customers.
 *
 * Owner "browse as customer" mode:
 * - A user who is ONLY a customer always renders normally.
 * - An owner (shop_owner / shop_manager / approved salon_owners row) is
 *   redirected to /owner/dashboard by default. They can opt into browsing
 *   as a customer by visiting any /customer/* URL with `?as=customer`,
 *   which sets a session flag (`nexora:browseAsCustomer`). While the flag
 *   is set an "Exit customer mode" banner is shown. Signing out or
 *   clearing the flag returns them to /owner/dashboard on next visit.
 * - Admins can visit freely (they aren't auto-redirected off the surface).
 */
export const Route = createFileRoute("/customer")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    as: search.as === "customer" ? ("customer" as const) : undefined,
  }),
  beforeLoad: async ({ location, search }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("nexora:postLoginRedirect", location.pathname);
      }
      throw redirect({ to: "/login" });
    }

    // Roles + owner-linkage (approved salon_owner row also counts as owner).
    const [roles, ownerLink] = await Promise.all([
      fetchUserRoles(data.user.id),
      supabase
        .from("salon_owners")
        .select("id")
        .eq("user_id", data.user.id)
        .eq("is_approved", true)
        .limit(1),
    ]);
    const roleSet = new Set<string>(roles as UserRole[]);
    const isOwner =
      roleSet.has("owner") ||
      roleSet.has("shop_owner") ||
      roleSet.has("shop_manager") ||
      (!ownerLink.error && (ownerLink.data?.length ?? 0) > 0);

    if (!isOwner) return; // pure customer / admin → allow

    // Owner path: honor explicit opt-in.
    if (typeof window !== "undefined") {
      if (search?.as === "customer") {
        sessionStorage.setItem(BROWSE_AS_CUSTOMER_KEY, "1");
        return;
      }
      if (sessionStorage.getItem(BROWSE_AS_CUSTOMER_KEY) === "1") return;
    }
    throw redirect({ to: "/owner/dashboard" });
  },
  component: CustomerLayout,
});

function CustomerLayout() {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isBrowsingAsCustomer =
    typeof window !== "undefined" &&
    sessionStorage.getItem(BROWSE_AS_CUSTOMER_KEY) === "1";

  const exitCustomerMode = () => {
    try {
      sessionStorage.removeItem(BROWSE_AS_CUSTOMER_KEY);
    } catch {
      /* ignore */
    }
    setConfirmOpen(false);
    navigate({ to: "/owner/dashboard" });
  };

  return (
    <>
      <div className="pb-20 md:pb-0">
        {isBrowsingAsCustomer && (
          <div className="border-b border-primary/30 bg-primary/10 text-primary">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs sm:text-sm">
              <span>
                You're browsing as a customer. Owner tools stay in your dashboard.
              </span>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 font-semibold text-primary-foreground hover:opacity-90"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Back to owner dashboard
              </button>
            </div>
          </div>
        )}
        <div className="sticky top-0 z-30 border-b border-border/60 bg-card/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">
            <BackButton size="icon" className="shrink-0" />
            <span className="text-sm font-semibold text-heading">Nexora</span>
            <div className="ml-auto flex items-center gap-2">
              {isBrowsingAsCustomer && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => setConfirmOpen(true)}
                  aria-label="Exit customer mode and return to owner dashboard"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Exit customer mode</span>
                  <span className="sm:hidden">Exit</span>
                </Button>
              )}
              <ViewSwitcher mode="customer" />
            </div>
          </div>
        </div>
        <Outlet />
      </div>
      <MobileBottomNav />
      <LocationPermissionModal />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit customer mode?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll return to your owner dashboard. You can switch back to
              customer view anytime from the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay in customer mode</AlertDialogCancel>
            <AlertDialogAction onClick={exitCustomerMode}>
              Exit to owner dashboard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


