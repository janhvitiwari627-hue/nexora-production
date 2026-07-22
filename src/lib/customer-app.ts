import { supabase } from "@/integrations/supabase/client";
import type { Shop } from "@/components/shared/ShopCard";

export async function listCustomerAppSalons(input?: {
  q?: string;
  category?: string;
  gender?: "male" | "female" | null;
  limit?: number;
  location?: { latitude: number; longitude: number; radiusKm?: number } | null;
}): Promise<Shop[]> {
  if (input?.location) {
    const term = input.q?.trim().replace(/[%_,]/g, "") || null;
    const { data, error } = await supabase.rpc(
      "nearby_public_salon_cards" as never,
      {
        _latitude: input.location.latitude,
        _longitude: input.location.longitude,
        _radius_km: input.location.radiusKm ?? 50,
        _limit: input.limit ?? 50,
        _query: term,
        _category: input.category && input.category !== "All" ? input.category : null,
        _gender: input.gender ?? null,
      } as never,
    );
    if (error) throw new Error(error.message);

    return ((data ?? []) as unknown as CustomerSalonRow[]).map(mapCustomerSalon);
  }

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

  return (data ?? []).map(mapCustomerSalon);
}

interface CustomerSalonRow {
  slug: string | null;
  name: string | null;
  tagline: string | null;
  category: string | null;
  city: string | null;
  location: string | null;
  cover_image_url: string | null;
  image_url: string | null;
  rating: number | null;
  reviews_count: number | null;
  is_verified: boolean | null;
  distance_km?: number | null;
}

function mapCustomerSalon(salon: CustomerSalonRow): Shop {
  return {
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
    distance_km: salon.distance_km ?? null,
    membership_perk: null,
    starting_price: null,
    gender: null,
  };
}
