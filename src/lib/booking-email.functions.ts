import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  email: z.string().email().max(320),
  customerName: z.string().trim().min(1).max(200),
  bookingReference: z.string().trim().min(1).max(64),
  salonName: z.string().trim().min(1).max(200),
  serviceName: z.string().trim().min(1).max(200),
  date: z.string().trim().min(1).max(30),
  time: z.string().trim().min(1).max(20),
  total: z.number().nonnegative(),
  advance: z.number().nonnegative(),
  remaining: z.number().nonnegative(),
});

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

export const sendBookingConfirmationEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.RESEND_API_KEY;
    if (!key) return { sent: false, reason: "no_api_key" as const };

    const money = (n: number) =>
      `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const html = `<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
<div style="max-width:560px;margin:0 auto;padding:24px">
  <div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:28px">
    <p style="color:#6d28d9;font-weight:700;margin:0;font-size:13px;letter-spacing:0.04em">APPOINTMENT CONFIRMED</p>
    <h1 style="font-size:22px;margin:8px 0 4px">Hi ${escapeHtml(data.customerName)},</h1>
    <p style="margin:0 0 16px;color:#475569;font-size:14px">Your booking at <b>${escapeHtml(data.salonName)}</b> has been created. The advance payment is still pending — your slot is held until it is completed.</p>
    <div style="background:#f8fafc;border-radius:12px;padding:16px;margin:16px 0">
      <div style="font-weight:700">${escapeHtml(data.serviceName)}</div>
      <div style="color:#475569;font-size:14px;margin-top:6px">${escapeHtml(data.date)} · ${escapeHtml(data.time)}</div>
    </div>
    <table style="width:100%;font-size:14px;border-collapse:collapse">
      <tr><td style="padding:6px 0;color:#475569">Booking reference</td><td style="text-align:right;font-family:monospace;font-weight:700">${escapeHtml(data.bookingReference)}</td></tr>
      <tr><td style="padding:6px 0;color:#475569">Total</td><td style="text-align:right;font-weight:700">${money(data.total)}</td></tr>
      <tr><td style="padding:6px 0;color:#475569">Advance (25%)</td><td style="text-align:right">${money(data.advance)}</td></tr>
      <tr><td style="padding:6px 0;color:#475569;border-top:1px solid #e2e8f0">Remaining (75%)</td><td style="text-align:right;border-top:1px solid #e2e8f0">${money(data.remaining)}</td></tr>
    </table>
    <p style="color:#64748b;font-size:12px;margin-top:20px">If you did not create this booking, you can safely ignore this email.</p>
  </div>
</div></body></html>`;

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          from: "Nexora Bookings <onboarding@resend.dev>",
          to: [data.email],
          subject: `Booking confirmed · ${data.bookingReference}`,
          html,
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        console.error("Resend send failed", res.status, body);
        return { sent: false, reason: `resend_${res.status}` as const };
      }
      return { sent: true as const };
    } catch (err) {
      console.error("Resend request error", err);
      return { sent: false, reason: "network_error" as const };
    }
  });
