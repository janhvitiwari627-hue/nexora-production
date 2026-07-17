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
      [s.name, s.category, s.area ?? "", s.city, s.tagline ?? ""].some((v) =>
        v.toLowerCase().includes(term),
      ),
    );
  }
  if (data?.limit) out = out.slice(0, data.limit);
  return out;
}

function publicClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function priceLevelFromAmount(p: number | null | undefined): number {
  if (!p || p <= 0) return 1;
  if (p < 400) return 1;
  if (p < 800) return 2;
  if (p < 1500) return 3;
  return 4;
}

function inferGender(category: string | null): Shop["gender"] {
  const value = (category ?? "").toLowerCase();
  if (value.includes("unisex")) return "unisex";
  if (value.includes("barber") || value.includes("men")) return "male";
  if (value.includes("beauty parlour") || value.includes("women")) return "female";
  return null;
}

function priceTierFromAmount(p: number | null | undefined): Shop["price_tier"] {
  if (!p || p < 500) return "budget";
  if (p < 1_000) return "mid";
  if (p < 2_000) return "premium";
  return "luxury";
}

function parseMinutes(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const match = value.match(/^(\d{1,2})(?::(\d{2}))?/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2] ?? 0);
  return hour >= 0 && hour < 24 && minute >= 0 && minute < 60 ? hour * 60 + minute : null;
}

function isOpenNow(hours: unknown): boolean {
  if (!hours || typeof hours !== "object" || Array.isArray(hours)) return false;
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const weekday = parts.find((part) => part.type === "weekday")?.value.toLowerCase();
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  if (!weekday) return false;

  const record = hours as Record<string, unknown>;
  const schedule = record[weekday] ?? record[weekday.slice(0, 3)];
  if (!schedule) return false;
  let open: unknown;
  let close: unknown;
  if (typeof schedule === "string") {
    [open, close] = schedule.split(/\s*(?:-|–|to)\s*/i);
  } else if (typeof schedule === "object" && !Array.isArray(schedule)) {
    const day = schedule as Record<string, unknown>;
    if (day.closed === true || day.is_closed === true) return false;
    open = day.open ?? day.opening ?? day.start;
    close = day.close ?? day.closing ?? day.end;
  }
  const start = parseMinutes(open);
  const end = parseMinutes(close);
  if (start === null || end === null) return false;
  const current = hour * 60 + minute;
  return end > start ? current >= start && current < end : current >= start || current < end;
}

export const listShops = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => ListInput.parse(data))
  .handler(async ({ data }): Promise<Shop[]> => {
    const supabase = publicClient();
    // Search currently renders one result set (no pagination); fetch the public
    // catalogue ceiling so advanced filters are not applied to an arbitrary
    // first page and therefore return incomplete counts.
    const limit = data?.limit ?? 200;

    try {
      let q = supabase
        .from("public_salon_cards")
        .select(
          "id, slug, name, tagline, category, city, location, cover_image_url, image_url, rating, reviews_count, is_verified, amenities, created_at, discount, hours, is_home_service, nexora_score, price_range",
        )
        .eq("is_active", true)
        .limit(limit);

      if (data?.category) q = q.eq("category", data.category);
      if (data?.area && data.area !== "All Areas") q = q.ilike("location", data.area);
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
          popularity: s.nexora_score ?? s.reviews_count ?? 0,
          gender: inferGender(s.category),
          is_open_now: isOpenNow(s.hours),
          has_offer: typeof s.discount === "string" && s.discount.trim().length > 0,
          is_home_service: !!s.is_home_service,
          amenities: s.amenities ?? [],
          created_at: s.created_at,
          price_tier: priceTierFromAmount(startingPrice),
        };
      });

      return mapped;
    } catch {
      return filterDemo(DEMO_SHOPS, data);
    }
  });
