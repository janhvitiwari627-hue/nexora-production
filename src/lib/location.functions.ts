import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const NearbyInput = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radius_km: z.number().min(0.1).max(100).optional().default(10),
  limit: z.number().int().min(1).max(50).optional().default(20),
});

function publicClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// GET /api/salons/nearby — Haversine-based via SQL function, no auth needed
export const nearbySalons = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => NearbyInput.parse(d))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: rows, error } = await supabase.rpc("nearby_salons", {
      _lat: data.lat,
      _lng: data.lng,
      _radius_km: data.radius_km,
      _limit: data.limit,
    });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
