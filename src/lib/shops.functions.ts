import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Shop } from "@/components/shared/ShopCard";
import { DEMO_SHOPS } from "./shops.demo";

const ListInput = z
  .object({
    q: z.string().optional(),
    category: z.string().optional(),
    area: z.string().optional(),
    limit: z.number().int().min(1).max(200).optional(),
  })
  .optional();

function filterDemo(
  list: Shop[],
  data?: { q?: string; category?: string; area?: string; limit?: number },
): Shop[] {
  let out = list;
  if (data?.category && data.category !== "All Categories")
    out = out.filter((s) => s.category.toLowerCase() === data.category!.toLowerCase());
  if (data?.area && data.area !== "All Areas")
    out = out.filter((s) => (s.area ?? "").toLowerCase() === data.area!.toLowerCase());
  if (data?.q) {
    const term = data.q.toLowerCase();
    out = out.filter((s) =>
      [s.name, s.category, s.area ?? "", s.city, s.tagline ?? ""]
        .some((v) => v.toLowerCase().includes(term)),
    );
  }
  if (data?.limit) out = out.slice(0, data.limit);
  return out;
}

function publicClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

function priceLevelFromAmount(p: number | null | undefined): number {
  if (!p || p <= 0) return 1;
  if (p < 400) return 1;
  if (p < 800) return 2;
  if (p < 1500) return 3;
  return 4;
}

export const listShops = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => ListInput.parse(data))
  .handler(async ({ data }): Promise<Shop[]> => {
    const supabase = publicClient();
    const limit = data?.limit ?? 50;

    try {
      let q = supabase
        .from("public_salon_cards")
        .select(
          "id, slug, name, tagline, category, city, location, cover_image_url, image_url, rating, reviews_count, is_verified",
        )
        .eq("is_active", true)
        .limit(limit);

      if (data?.category) q = q.eq("category", data.category);
      if (data?.q) {
        const term = data.q.replace(/[%_]/g, "");
        q = q.or(
          `name.ilike.%${term}%,category.ilike.%${term}%,location.ilike.%${term}%,tagline.ilike.%${term}%,city.ilike.%${term}%`,
        );
      }

      const { data: salons, error } = await q;
      if (error || !salons || salons.length === 0) {
        return filterDemo(DEMO_SHOPS, data);
      }

      const ids = salons.map((s) => s.id).filter((x): x is string => !!x);
      const minBySalon = new Map<string, number>();
      if (ids.length > 0) {
        const { data: services } = await supabase
          .from("services")
          .select("salon_id, price, is_active")
          .in("salon_id", ids)
          .eq("is_active", true);
        (services ?? []).forEach((s) => {
          if (!s.salon_id || typeof s.price !== "number") return;
          const cur = minBySalon.get(s.salon_id);
          if (cur === undefined || s.price < cur) minBySalon.set(s.salon_id, s.price);
        });
      }

      const mapped: Shop[] = salons.map((s) => {
        const startingPrice = s.id ? (minBySalon.get(s.id) ?? null) : null;
        return {
          slug: s.slug ?? "",
          name: s.name ?? "Salon",
          tagline: s.tagline,
          category: s.category ?? "Salon",
          area: s.location ?? null,
          city: s.city ?? "Jaipur",
          cover_image: s.cover_image_url ?? s.image_url ?? null,
          rating: s.rating ?? 0,
          review_count: s.reviews_count ?? 0,
          price_level: priceLevelFromAmount(startingPrice),
          is_verified: !!s.is_verified,
          distance_km: null,
          membership_perk: null,
          starting_price: startingPrice,
          popularity: s.reviews_count ?? 0,
          gender: null,
        };
      });

      return mapped;
    } catch {
      return filterDemo(DEMO_SHOPS, data);
    }
  });
