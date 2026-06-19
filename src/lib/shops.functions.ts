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
    let query = supabase
      .from("shops")
      .select(
        "id, slug, name, tagline, category, city, area, cover_image, rating, review_count, price_level, is_verified",
      )
      .order("rating", { ascending: false });

    if (data?.q) {
      query = query.or(
        `name.ilike.%${data.q}%,tagline.ilike.%${data.q}%,category.ilike.%${data.q}%,area.ilike.%${data.q}%`,
      );
    }
    if (data?.category) query = query.eq("category", data.category);
    if (data?.limit) query = query.limit(data.limit);

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
