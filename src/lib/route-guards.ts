import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { UserRole } from "@/lib/auth-redirect";
import { fetchUserRoles, pickPrimaryRole, routeForRole } from "@/lib/auth-redirect";

export type AllowedRole = UserRole;

function normalizeRole(role: AllowedRole): UserRole {
  return role === "super_admin" ? "admin" : role;
}

/**
 * Authenticated route guard backed by user_roles. A saved URL never grants
 * access: users who open another role's dashboard are returned to their own.
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

  const [roles, adminRpc, superAdminRpc] = await Promise.all([
    fetchUserRoles(data.user.id),
    supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" }),
    supabase.rpc("has_role", { _user_id: data.user.id, _role: "super_admin" }),
  ]);
  const allowedRoles = new Set(allowed.map(normalizeRole));
  const effectiveRoles = new Set<UserRole>(roles);
  if (roles.includes("super_admin") || superAdminRpc.data === true) effectiveRoles.add("admin");
  if (adminRpc.data === true) effectiveRoles.add("admin");

  const ok = Array.from(allowedRoles).some((role) => effectiveRoles.has(role));
  if (!ok) {
    throw redirect({ to: routeForRole(pickPrimaryRole(Array.from(effectiveRoles))) });
  }
  return { user: data.user, roles };
}
