import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ROLE_LABELS: Record<string, string> = {
  customer: "Customer",
  owner: "Salon Owner",
  salon_owner: "Salon Owner",
  district_partner: "District Partner",
  growth_partner: "Growth Partner",
  distributor: "Distributor",
  admin: "Admin",
};

export type EmailRoleCheck = {
  exists: boolean;
  role: string | null;
  roleLabel: string | null;
};

/**
 * Look up whether an email is already registered, and if so, return its role.
 * Used to enforce "one email = one role" at signup time and produce a clear
 * role-specific error message.
 */
export const getEmailRole = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string }) =>
    z.object({ email: z.string().trim().toLowerCase().email() }).parse(d),
  )
  .handler(async ({ data }): Promise<EmailRoleCheck> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("email", data.email)
      .maybeSingle();

    if (!prof) return { exists: false, role: null, roleLabel: null };

    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", prof.id);

    const role = (roles ?? [])[0]?.role ?? null;
    return {
      exists: true,
      role,
      roleLabel: role ? (ROLE_LABELS[role] ?? role) : null,
    };
  });

export function roleConflictMessage(
  existingRoleLabel: string | null,
  attemptedRoleLabel: string,
): string {
  const label = existingRoleLabel ?? "another role";
  return `This email is already registered as ${label}. Please sign in with this account or use a different email for ${attemptedRoleLabel} account.`;
}
