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

  const shouldAllowOwnerMembership = allowed.some((role) => normalizeRole(role) === "owner");
  const [roles, ownerLink, adminRpc, superAdminRpc] = await Promise.all([
    fetchUserRoles(data.user.id),
    shouldAllowOwnerMembership
      ? supabase
        .from("salon_owners")
        .select("id")
        .eq("user_id", data.user.id)
        .eq("is_approved", true)
        .limit(1)
      : Promise.resolve({ data: null, error: null }),
    supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" }),
    supabase.rpc("has_role", { _user_id: data.user.id, _role: "super_admin" as UserRole }),
  ]);
  const normalized = new Set(allowed.map(normalizeRole));
  // Treat shop_owner/shop_manager DB roles as equivalent to "owner" guard.
  const effectiveRoles = new Set<string>(roles);
  if (roles.includes("shop_owner" as UserRole) || roles.includes("shop_manager" as UserRole)) {
    effectiveRoles.add("owner");
  }
  if (!ownerLink.error && (ownerLink.data?.length ?? 0) > 0) {
    effectiveRoles.add("owner");
  }
  if (roles.includes("super_admin" as UserRole)) effectiveRoles.add("admin");
  // RPC fallback — works even if direct SELECT on user_roles is blocked by grants/RLS timing.
  if (adminRpc.data === true) effectiveRoles.add("admin");
  if (superAdminRpc.data === true) effectiveRoles.add("admin");
  const ok = Array.from(normalized).some((r) => effectiveRoles.has(r));
  if (!ok) {
    // Redirect users to their own home surface when they hit the wrong dashboard.
    if (effectiveRoles.has("admin")) throw redirect({ to: "/admin/dashboard" });
    if (effectiveRoles.has("owner")) throw redirect({ to: "/owner/dashboard" });
    if (effectiveRoles.has("customer")) throw redirect({ to: "/" });
    throw redirect({ to: "/" });
  }
  return { user: data.user, roles };
}
