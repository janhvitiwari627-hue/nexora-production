import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { resolvePostLoginRedirect } from "@/lib/auth-redirect";

/**
 * Client-side beforeLoad helper for auth pages (login/signup/register).
 *
 * If a user is already signed in, redirect them straight to their role's
 * dashboard — they've already signed up once and shouldn't be asked to
 * sign up or log in again. The role dashboard is where they edit their
 * profile.
 *
 * MUST be used only on routes declared with `ssr: false`, because
 * supabase.auth.getUser() reads the session from localStorage.
 */
export async function redirectIfSignedIn(): Promise<void> {
  if (typeof window === "undefined") return;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return;
  // resolvePostLoginRedirect honours the pending-redirect stash first,
  // then falls back to the role-based default.
  const to = await resolvePostLoginRedirect(data.user.id);
  throw redirect({ to, replace: true });
}
