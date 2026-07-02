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

/**
 * Return the count of a given analytics event fired by the current user
 * over the last N days, plus a daily breakdown for sparkline rendering.
 */
export const getMyEventStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      event_name: z.string().min(1).max(80),
      days: z.number().int().min(1).max(90).optional().default(7),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (data.days - 1));
    const { data: rows, error } = await context.supabase
      .from("analytics_events")
      .select("created_at")
      .eq("user_id", context.userId)
      .eq("event_name", data.event_name)
      .gte("created_at", since.toISOString());
    if (error) throw new Error(error.message);
    const buckets: { date: string; count: number }[] = [];
    for (let i = 0; i < data.days; i++) {
      const d = new Date(since);
      d.setUTCDate(since.getUTCDate() + i);
      buckets.push({ date: d.toISOString().slice(0, 10), count: 0 });
    }
    for (const r of rows ?? []) {
      const key = new Date(r.created_at as string).toISOString().slice(0, 10);
      const b = buckets.find((x) => x.date === key);
      if (b) b.count += 1;
    }
    return { total: rows?.length ?? 0, daily: buckets };
  });

