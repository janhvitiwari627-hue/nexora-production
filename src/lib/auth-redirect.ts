import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type UserRole = Database["public"]["Enums"]["app_role"];

const ROLE_PRIORITY: UserRole[] = [
  "admin",
  "owner",
  "distributor",
  "district_partner",
  "growth_partner",
  "customer",
];

const ROLE_ROUTES: Record<UserRole, string> = {
  admin: "/admin",
  owner: "/owner/dashboard",
  distributor: "/partner/dashboard",
  district_partner: "/partner/dashboard",
  growth_partner: "/partner/dashboard",
  customer: "/",
};

export async function fetchUserRoles(userId: string): Promise<UserRole[]> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) return [];
  return (data ?? []).map((r) => r.role as UserRole);
}

export function pickPrimaryRole(roles: UserRole[]): UserRole {
  for (const role of ROLE_PRIORITY) {
    if (roles.includes(role)) return role;
  }
  return "customer";
}

export function routeForRole(role: UserRole | "staff" | "shop_owner" | "shop_manager" | "super_admin"): string {
  // Map spec role names to existing app_role enum
  if (role === "super_admin") return "/admin";
  if (role === "shop_owner" || role === "shop_manager") return "/owner/dashboard";
  if (role === "staff") return "/staff/dashboard";
  return ROLE_ROUTES[role as UserRole] ?? "/";
}

export async function resolvePostLoginRedirect(userId: string): Promise<string> {
  // 1. Restore booking flow if it was interrupted
  if (typeof window !== "undefined") {
    const pending = sessionStorage.getItem("nexora:postLoginRedirect");
    if (pending) {
      sessionStorage.removeItem("nexora:postLoginRedirect");
      return pending;
    }
  }
  // 2. Role-based default
  const roles = await fetchUserRoles(userId);
  return routeForRole(pickPrimaryRole(roles));
}
