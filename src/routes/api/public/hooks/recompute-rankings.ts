import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/hooks/recompute-rankings")({
  server: {
    handlers: {
      POST: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.rpc("recompute_nexora_scores");
        if (error) {
          return new Response(JSON.stringify({ ok: false, error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
        return Response.json({ ok: true, updated: data, at: new Date().toISOString() });
      },
    },
  },
});
