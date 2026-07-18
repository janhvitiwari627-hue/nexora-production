import { supabase } from "@/integrations/supabase/client";

/** Starts Supabase's configured password-recovery email flow. */
export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
  });

  if (error) throw error;
}
