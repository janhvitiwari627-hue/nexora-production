import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { UserRole } from "@/lib/auth-redirect";
import { fetchUserRoles } from "@/lib/auth-redirect";

/**
 * Spec role names map to existing app_role enum values. The `app_role`
 * enum has no `staff`, `shop_owner`, `shop_manager`, or `super_admin`
 * values yet, so we translate spec names to the closest existing enum
 * value when evaluating guards.
 */
export type AllowedRole =
  | UserRole
  | "super_admin"
  | "shop_owner"
  | "shop_manager"
  | "staff";

function normalizeRole(role: AllowedRole): UserRole {
  if (role === "super_admin") return "admin";
  if (role === "shop_owner" || role === "shop_manager") return "owner";
  if (role === "staff") return "owner"; // no `staff` enum yet — owners cover staff dashboard access
  return role;
}

/**
 * Client-side route guard. Use inside `beforeLoad` on a pathless layout
 * route declared with `ssr: false`. Redirects to /login (and remembers
 * the originating URL in sessionStorage so booking flows can resume).
 */
export async function requireRole(allowed: AllowedRole[], currentPath: string) {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("nexora:postLoginRedirect", currentPath);
      if (currentPath.startsWith("/book") || currentPath.startsWith("/shop")) {
        sessionStorage.setItem("bookingContext", currentPath);
      }
    }
    throw redirect({ to: "/login" });
  }

  const roles = await fetchUserRoles(data.user.id);
  const normalized = Array.from(new Set(allowed.map(normalizeRole)));
  const ok = normalized.some((r) => roles.includes(r));
  if (!ok) {
    throw redirect({ to: "/" });
  }
  return { user: data.user, roles };
}
