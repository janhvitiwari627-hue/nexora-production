import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

/**
 * Auto-release expired (unpaid 15-min window) bookings.
 * Called every minute by pg_cron. Bypasses edge auth (/api/public/*),
 * so we verify the Supabase publishable apikey header before doing anything.
 */
export const Route = createFileRoute("/api/public/hooks/release-expired-bookings")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = request.headers.get("apikey") ?? request.headers.get("x-api-key");
        const expected = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!expected || apiKey !== expected) {
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
