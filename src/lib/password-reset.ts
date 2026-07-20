import { supabase } from "@/integrations/supabase/client";
import { buildPasswordResetRedirectUrl } from "@/lib/public-app-url";

/** Requests a Supabase Auth reset email with a production-only callback URL. */
export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: buildPasswordResetRedirectUrl(),
  });

  if (error) throw error;
}
