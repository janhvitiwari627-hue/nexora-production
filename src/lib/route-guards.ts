import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { UserRole } from "@/lib/auth-redirect";
import { fetchUserRoles } from "@/lib/auth-redirect";

/**
 * Client-side route guard. Use inside `beforeLoad` on a pathless layout
 * route declared with `ssr: false`. Redirects to /login (and remembers
 * the originating URL in sessionStorage so booking flows can resume).
 */
export async function requireRole(allowed: UserRole[], currentPath: string) {
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
  const ok = allowed.some((r) => roles.includes(r));
  if (!ok) {
    throw redirect({ to: "/" });
  }
  return { user: data.user, roles };
}
