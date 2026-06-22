import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const LogInput = z.object({
  query: z.string().trim().max(200).optional().nullable(),
  filters: z.record(z.string(), z.any()).default({}),
  results_count: z.number().int().nonnegative().default(0),
  clicked_salon_id: z.string().uuid().optional().nullable(),
});

// POST /api/search/log — record a search for personalization
export const logSearchHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => LogInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("search_history").insert({
      user_id: userId,
      query: data.query ?? null,
      filters: data.filters,
      results_count: data.results_count,
      clicked_salon_id: data.clicked_salon_id ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// GET /api/recommendations — top salons in user's city, excluding already-booked
export const getRecommendations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ limit: z.number().int().min(1).max(20).default(10) }).parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase.rpc("recommended_salons", {
      _limit: data.limit,
    });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
