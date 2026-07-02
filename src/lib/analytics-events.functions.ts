import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const LogEventInput = z.object({
  event_name: z.string().min(1).max(80),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

/**
 * Insert a lightweight analytics event scoped to the current user.
 * Fire-and-forget from the client — errors are swallowed at the call site.
 */
export const logAnalyticsEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => LogEventInput.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("analytics_events").insert({
      event_name: data.event_name,
      user_id: context.userId,
      metadata: (data.metadata ?? {}) as never,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

