import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  redirectTo: z.string().url().max(500).optional(),
});

const GENERIC_OK = {
  ok: true,
  message: "If this email is registered, a reset link has been sent.",
};

const PRODUCTION_ORIGIN = "https://meripahalfasthelp.online";
const RESET_REDIRECT_TO = `${PRODUCTION_ORIGIN}/auth/callback?next=/reset-password`;
const RESEND_ENDPOINT = "https://connector-gateway.lovable.dev/resend/emails";

function resetEmailHtml(actionLink: string) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Reset your Nexora SalonOS password</title>
  </head>
  <body style="margin:0;background:#f6f8f5;font-family:Arial,Helvetica,sans-serif;color:#15382d;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f8f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e7dc;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px;text-align:center;background:#063b2a;">
                <div style="font-size:22px;font-weight:800;color:#d4af37;">Nexora SalonOS</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:#063b2a;">Reset your password</h1>
                <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#3f504a;">We received a request to reset your Nexora SalonOS account password.</p>
                <p style="margin:0 0 26px;font-size:15px;line-height:1.6;color:#3f504a;">Click the button below to set a new password. This link will expire shortly.</p>
                <p style="margin:0 0 28px;text-align:center;">
                  <a href="${actionLink}" style="display:inline-block;background:#063b2a;color:#ffffff;text-decoration:none;border-radius:999px;padding:14px 26px;font-size:15px;font-weight:700;">Reset Password</a>
                </p>
                <p style="margin:0 0 24px;font-size:13px;line-height:1.6;color:#66736e;">If you did not request this, you can safely ignore this email.</p>
                <p style="margin:0;font-size:13px;font-weight:700;color:#063b2a;">Nexora SalonOS</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

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

        try {
          const resendApiKey = process.env.RESEND_API_KEY;
          const lovableApiKey = process.env.LOVABLE_API_KEY;
          if (!resendApiKey || !lovableApiKey) {
            console.warn("[forgot-password] email environment missing");
            return Response.json(GENERIC_OK);
          }

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin.auth.admin.generateLink({
            type: "recovery",
            email,
            options: {
              redirectTo: RESET_REDIRECT_TO,
            },
          });
          if (error) {
            console.error("[forgot-password] recovery link status", error.status ?? "failed");
            return Response.json(GENERIC_OK);
          }

          const actionLink = data.properties?.action_link;
          if (!actionLink) {
            console.error("[forgot-password] recovery link missing");
            return Response.json(GENERIC_OK);
          }

          const emailResponse = await fetch(RESEND_ENDPOINT, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${lovableApiKey}`,
              "X-Connection-Api-Key": resendApiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Nexora SalonOS <no-reply@meripahalfasthelp.online>",
              to: [email],
              subject: "Reset your Nexora SalonOS password",
              html: resetEmailHtml(actionLink),
            }),
          });

          if (!emailResponse.ok) {
            console.error("[forgot-password] resend status", emailResponse.status);
          }
        } catch (err) {
          console.error("[forgot-password] handler error", (err as Error)?.message);
        }

        return Response.json(GENERIC_OK);
      },
    },
  },
});
