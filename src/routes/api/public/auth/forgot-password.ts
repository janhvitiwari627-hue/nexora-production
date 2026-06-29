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
          <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#0f172a">Reset your password</h1>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#334155">We received a request to reset your Nexora SalonOS account password. Click the button below to set a new password. This link will expire shortly.</p>
          <p style="margin:28px 0;text-align:center">
            <a href="${resetUrl}" style="display:inline-block;background:#047857;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px">Reset Password</a>
          </p>
          <p style="margin:0 0 8px;font-size:13px;color:#64748b">If the button does not work, copy and paste this link into your browser:</p>
          <p style="margin:0 0 24px;font-size:12px;color:#475569;word-break:break-all">${resetUrl}</p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
          <p style="margin:0;font-size:12px;color:#94a3b8">If you did not request this, you can safely ignore this email.</p>
        </td></tr>
        <tr><td style="background:#f8fafc;padding:16px 32px;font-size:11px;color:#94a3b8;text-align:center">&copy; ${new Date().getFullYear()} Nexora SalonOS</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
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
