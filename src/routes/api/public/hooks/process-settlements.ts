import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";

/**
 * V1 NOTE: Settlement/escrow are V2 features. This endpoint is locked
 * (returns 503) until V2 is shipped. When re-enabling, leave the
 * CRON_WEBHOOK_SECRET check in place — never authenticate cron with the
 * publishable/anon key.
 */
const V1_LOCKED = true;

export const Route = createFileRoute("/api/public/hooks/process-settlements")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (V1_LOCKED) {
          return new Response(
            JSON.stringify({ error: "Disabled in V1" }),
            { status: 503, headers: { "Content-Type": "application/json" } },
          );
        }
        const provided = request.headers.get("x-cron-secret") ?? "";
        const expected = process.env.CRON_WEBHOOK_SECRET ?? "";
        const a = Buffer.from(provided);
        const b = Buffer.from(expected);
        if (!expected || a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );
        const { data: released, error: e1 } = await supabaseAdmin.rpc(
          "auto_release_escrow",
        );
        const { data: settled, error: e2 } = await supabaseAdmin.rpc(
          "process_pending_settlements",
        );
        return Response.json({
          ok: !e1 && !e2,
          released,
          settled,
          error: e1?.message ?? e2?.message ?? null,
          at: new Date().toISOString(),
        });
      },
    },
  },
});
