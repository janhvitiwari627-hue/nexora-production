import { supabase } from "@/integrations/supabase/client";

/** Requests a reset link through the project's standard Supabase Auth flow. */
export async function requestPasswordReset(email: string) {
  const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) throw error;
}
