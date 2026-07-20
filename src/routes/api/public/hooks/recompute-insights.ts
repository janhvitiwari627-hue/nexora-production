import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/hooks/recompute-insights")({
  server: {
    handlers: {
      POST: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.rpc("recompute_customer_insights");
        if (error) {
          return new Response(JSON.stringify({ ok: false, error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
        return Response.json({ ok: true, affected: data, at: new Date().toISOString() });
      },
    },
  },
});
