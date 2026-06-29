import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  redirectTo: z.string().url().max(500).optional(),
});

const GENERIC_OK = {
  ok: true,
  message: "If this email is registered, a reset link has been sent.",
};

const PRODUCTION_ORIGIN = "https://meripahalfasthelp.online";

export const Route = createFileRoute("/api/public/auth/forgot-password")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return Response.json(GENERIC_OK);
        }
        const parsed = bodySchema.safeParse(payload);
        if (!parsed.success) return Response.json(GENERIC_OK);

        const { email } = parsed.data;
        // Always send users to the production domain — never a Lovable preview URL.
        const redirectTo = `${PRODUCTION_ORIGIN}/auth/callback?next=/reset-password`;

        try {
          const supabaseUrl = process.env.SUPABASE_URL;
          const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
          if (!supabaseUrl || !publishableKey) {
            console.warn("[forgot-password] auth environment missing");
            return Response.json(GENERIC_OK);
          }

          const supabaseAuth = createClient<Database>(supabaseUrl, publishableKey, {
            auth: {
              storage: undefined,
              persistSession: false,
              autoRefreshToken: false,
              detectSessionInUrl: false,
            },
          });

          const { error } = await supabaseAuth.auth.resetPasswordForEmail(email, { redirectTo });
          if (error) {
            // Don't reveal whether the email exists or expose token details.
            console.error("[forgot-password] reset email status", error.status ?? "failed");
          }
        } catch (err) {
          console.error("[forgot-password] handler error", (err as Error)?.message);
        }

        return Response.json(GENERIC_OK);
      },
    },
  },
});
