import { supabase } from "@/integrations/supabase/client";
import type { Shop } from "@/components/shared/ShopCard";

export async function listCustomerAppSalons(input?: {
  q?: string;
  category?: string;
  gender?: "male" | "female" | null;
  limit?: number;
}): Promise<Shop[]> {
  let query = supabase
    .from("public_salon_cards")
    .select(
      "slug, name, tagline, category, city, location, cover_image_url, image_url, rating, reviews_count, is_verified",
    )
    .eq("is_active", true)
    .eq("website_created", true)
    .limit(input?.limit ?? 50);

  if (input?.category && input.category !== "All") {
    query = query.eq("category", input.category);
  } else if (input?.gender === "male") {
    query = query.in("category", ["Barber Shop", "Salon", "Spa"]);
  } else if (input?.gender === "female") {
    query = query.in("category", [
      "Beauty Parlour",
      "Salon",
      "Spa",
      "Nail Art Studio",
      "Makeup Artist",
    ]);
  }
  if (input?.q?.trim()) {
    const term = input.q.trim().replace(/[%_,]/g, "");
    query = query.or(
      `name.ilike.%${term}%,category.ilike.%${term}%,location.ilike.%${term}%,tagline.ilike.%${term}%,city.ilike.%${term}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((salon) => ({
    slug: salon.slug ?? "",
    name: salon.name ?? "Salon",
    tagline: salon.tagline,
    category: salon.category ?? "Salon",
    area: salon.location,
    city: salon.city ?? "",
    cover_image: salon.cover_image_url ?? salon.image_url,
    rating: salon.rating ?? 0,
    review_count: salon.reviews_count ?? 0,
    price_level: 0,
    is_verified: Boolean(salon.is_verified),
    distance_km: null,
    membership_perk: null,
    starting_price: null,
    gender: null,
  }));
}
