import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const ListInput = z
  .object({
    q: z.string().optional(),
    category: z.string().optional(),
    limit: z.number().int().min(1).max(50).optional(),
  })
  .optional();

function publicClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export const listShops = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => ListInput.parse(data))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: rows, error } = await supabase.rpc("shops_search", {
      _q: data?.q ?? null,
      _category: data?.category ?? null,
      _limit: data?.limit ?? 50,
    });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

