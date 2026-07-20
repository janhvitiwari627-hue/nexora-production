import { createFileRoute } from "@tanstack/react-router";
import { sendLovableEmail } from "@lovable.dev/email-js";
import { z } from "zod";
import { buildPasswordRecoveryUrl } from "@/lib/public-app-url";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
});

const GENERIC_OK = {
  ok: true,
  message: "If this email is registered, a reset link has been sent.",
};

const DELIVERY_UNAVAILABLE = {
  ok: false,
  message: "Password reset email is temporarily unavailable. Please try again shortly.",
};

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
          const lovableApiKey = process.env.LOVABLE_API_KEY;
          if (!lovableApiKey) {
            console.error("[forgot-password] LOVABLE_API_KEY missing");
            return Response.json(DELIVERY_UNAVAILABLE, { status: 503 });
          }

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin.auth.admin.generateLink({
            type: "recovery",
            email,
          });
          if (error) {
            console.error("[forgot-password] recovery link status", error.status ?? "failed");
            return Response.json(DELIVERY_UNAVAILABLE, { status: 503 });
          }

          const tokenHash = data.properties?.hashed_token;
          if (!tokenHash) {
            console.error("[forgot-password] recovery link missing");
            return Response.json(DELIVERY_UNAVAILABLE, { status: 503 });
          }
          const actionLink = buildPasswordRecoveryUrl(tokenHash);

          await sendLovableEmail(
            {
              to: email,
              from: "Nexora SalonOS <noreply@notify.meripahalfasthelp.online>",
              sender_domain: "notify.meripahalfasthelp.online",
              subject: "Reset your Nexora SalonOS password",
              html: resetEmailHtml(actionLink),
              text: "Use the password reset link in this email to set a new Nexora SalonOS password.",
              purpose: "transactional",
              idempotency_key: crypto.randomUUID(),
            },
            { apiKey: lovableApiKey, sendUrl: process.env.LOVABLE_SEND_URL },
          );
        } catch (err) {
          console.error("[forgot-password] handler error", (err as Error)?.message);
          return Response.json(DELIVERY_UNAVAILABLE, { status: 503 });
        }

        return Response.json(GENERIC_OK);
      },
    },
  },
});
