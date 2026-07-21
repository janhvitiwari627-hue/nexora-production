import { createFileRoute, redirect } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Smart entry for the "Shop Owner" header item.
 *
 * Branching (production behaviour, no hardcoded user ids):
 *   1. Logged-out  -> friendly auth-notice, then login (redirects back here).
 *   2. Logged-in, no approved shop -> onboarding / business registration.
 *   3. Logged-in, with an approved shop -> the Shop Owner PWA dashboard.
 *
 * This reuses the existing auth + salon_owners + onboarding infrastructure
 * instead of duplicating it. It never opens a customer PWA route.
 */
export const Route = createFileRoute("/shop-owner")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Shop Owner — Nexora" },
      {
        name: "description",
        content:
          "Open the Nexora Shop Owner app: manage your shop, services, bookings, staff, customers and earnings.",
      },
    ],
  }),
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    // 1. Not signed in -> ask to sign in / create an account.
    if (!user) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("nexora:postLoginRedirect", location.pathname);
      }
      throw redirect({
        to: "/auth-notice",
        search: { to: "/login", reason: "owner-auth", delay: 1400 },
      });
    }

    // 2. Check whether this user owns/manages an APPROVED shop.
    //    RLS lets a user read only their own salon_owners rows.
    const { data: links } = await supabase
      .from("salon_owners")
      .select("salon_id, is_approved, role")
      .eq("user_id", user.id)
      .eq("is_approved", true)
      .limit(1);

    const hasApprovedShop = Array.isArray(links) && links.length > 0;

    // 3. Route accordingly.
    if (hasApprovedShop) {
      // Approved / active shop -> Shop Owner PWA dashboard.
      throw redirect({ to: "/app/owner" });
    }
    // Logged in but no shop yet -> onboarding (public registration entry).
    throw redirect({ to: "/owner/register-business" });
  },
  component: ShopOwnerEntry,
});

function ShopOwnerEntry() {
  // beforeLoad always redirects; this only renders during the brief guard.
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3 text-slate-600">
        <Loader2 className="h-7 w-7 animate-spin text-violet-700" aria-hidden />
        <p className="text-sm font-medium">Opening Shop Owner…</p>
      </div>
    </div>
  );
}
