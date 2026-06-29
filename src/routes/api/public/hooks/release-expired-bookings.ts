import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "crypto";

/**
 * Auto-release expired (unpaid 15-min window) bookings.
 * Called every minute by pg_cron. Bypasses edge auth (/api/public/*),
 * so we verify a server-only CRON_WEBHOOK_SECRET via x-cron-secret header.
 * Never authenticate with the publishable/anon key — it ships in the
 * browser bundle.
 */
export const Route = createFileRoute("/api/public/hooks/release-expired-bookings")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const provided = request.headers.get("x-cron-secret") ?? "";
        const expected = process.env.CRON_WEBHOOK_SECRET ?? "";
        const a = Buffer.from(provided);
        const b = Buffer.from(expected);
        if (!expected || a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false, autoRefreshToken: false } },
        );

        const { data, error } = await supabase.rpc("release_expired_bookings");
        if (error) {
          console.error("[release-expired-bookings]", error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
        return Response.json({ ok: true, released: Number(data ?? 0) });
      },
    },
  },
});
