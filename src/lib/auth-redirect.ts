import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type UserRole = Database["public"]["Enums"]["app_role"];

const ROLE_PRIORITY: UserRole[] = [
  "super_admin",
  "admin",
  "shop_owner",
  "owner",
  "shop_manager",
  "staff",
  "brand",
  "distributor",
  "district_partner",
  "growth_partner",
  "customer",
];

const ROLE_ROUTES: Record<UserRole, string> = {
  super_admin: "/admin/dashboard",
  admin: "/admin/dashboard",
  shop_owner: "/owner/dashboard",
  owner: "/owner/dashboard",
  shop_manager: "/owner/dashboard",
  staff: "/owner/dashboard",
  brand: "/portal/brands",
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
  if (role === "super_admin") return "/admin/dashboard";
  if (role === "shop_owner" || role === "shop_manager") return "/owner/dashboard";
  if (role === "staff") return "/owner/dashboard";
  return ROLE_ROUTES[role as UserRole] ?? "/";
}

async function hasApprovedOwnerLink(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("salon_owners")
    .select("salon_id")
    .eq("user_id", userId)
    .eq("is_approved", true)
    .limit(1);
  return !!data?.length;
}

export async function resolvePostLoginRedirect(userId: string): Promise<string> {
  // 1. Restore booking/post-login flow if it was interrupted
  if (typeof window !== "undefined") {
    const pending = sessionStorage.getItem("nexora:postLoginRedirect");
    if (pending) {
      sessionStorage.removeItem("nexora:postLoginRedirect");
      return pending;
    }
  }
  // 2. Role-based default
  const roles = await fetchUserRoles(userId);
  const primary = pickPrimaryRole(roles);

  // Shop owners: route based on whether they already own a shop
  if (primary === "shop_owner" || primary === "owner" || primary === "shop_manager") {
    if (!(await hasApprovedOwnerLink(userId))) return "/owner/register-business";
    return "/owner/templates";
  }

  // Some existing shop owners may have a salon link but no role row yet.
  // Send them to the owner flow instead of the customer dashboard.
  if (await hasApprovedOwnerLink(userId)) return "/owner/templates";

  return routeForRole(primary);
}
