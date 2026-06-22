import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/hooks/process-settlements")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey =
          request.headers.get("apikey") ?? request.headers.get("x-api-key");
        if (!apiKey || apiKey !== process.env.SUPABASE_PUBLISHABLE_KEY) {
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
