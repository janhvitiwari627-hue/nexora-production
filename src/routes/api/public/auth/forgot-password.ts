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

function buildEmailHtml(resetUrl: string) {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f5f6fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(15,23,42,.08)">
        <tr><td style="background:linear-gradient(135deg,#064e3b 0%,#047857 100%);padding:28px 32px;color:#fff;font-size:20px;font-weight:700;letter-spacing:.2px">Nexora SalonOS</td></tr>
        <tr><td style="padding:32px">
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a">Reset your password</h1>
          <p style="margin:0 0 12px;color:#334155;font-size:15px;line-height:1.7">We received a request to reset your Nexora SalonOS account password.</p>
          <p style="margin:0 0 28px;color:#334155;font-size:15px;line-height:1.7">Click the button below to set a new password. This link will expire shortly.</p>
          <p style="margin:0;text-align:center">
            <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:12px;font-weight:700;font-size:15px">Reset Password</a>
          </p>
          <div style="height:1px;background:#e2e8f0;margin:32px 0"></div>
          <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6">If you did not request this, you can safely ignore this email.</p>
          <p style="margin:18px 0 0;color:#94a3b8;font-size:12px">Nexora SalonOS</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

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
        const origin =
          parsed.data.redirectTo ||
          request.headers.get("origin") ||
          process.env.SITE_URL ||
          "";
        const redirectTo = `${origin.replace(/\/$/, "")}/auth/callback?next=/reset-password`;

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin.auth.admin.generateLink({
            type: "recovery",
            email,
            options: { redirectTo },
          });

          // Don't reveal whether the email exists.
          if (error || !data?.properties?.action_link) {
            return Response.json(GENERIC_OK);
          }

          const resetUrl = data.properties.action_link;
          const resendKey = process.env.RESEND_API_KEY;

          if (resendKey) {
            const res = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${resendKey}`,
              },
              body: JSON.stringify({
                from: "Nexora SalonOS <onboarding@resend.dev>",
                to: [email],
                subject: "Reset your Nexora SalonOS password",
                html: buildEmailHtml(resetUrl),
              }),
            });
            if (!res.ok) {
              // Log status only — never log the reset link/token.
              console.error("[forgot-password] resend status", res.status);
            }
          } else {
            console.warn("[forgot-password] RESEND_API_KEY not set — email not delivered");
          }
        } catch (err) {
          console.error("[forgot-password] handler error", (err as Error)?.message);
        }

        return Response.json(GENERIC_OK);
      },
    },
  },
});
