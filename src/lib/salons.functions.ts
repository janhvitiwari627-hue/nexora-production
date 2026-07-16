import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

function publicClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type PublicStaffMember = {
  id: string;
  salon_id: string;
  name: string;
  role: string | null;
  bio: string | null;
  avatar_url: string | null;
  rating: number | null;
};

const SlugInput = z.object({ slug: z.string().trim().min(1).max(200) });

export const getSalonBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => SlugInput.parse(d))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: salon, error } = await supabase
      .from("public_salon_cards")
      .select(
        "id, slug, name, category, rating, reviews_count, image_url, cover_image_url, owner_profile_image_url, video_url, gallery_images, location, address, phone, whatsapp, price_range, discount, description, about_us, tagline, is_verified, latitude, longitude, hours, brand_primary, brand_secondary, is_home_service, home_service_charge, home_service_radius_km, website_created, selected_template_id, selected_template_key",
      )
      .eq("slug", data.slug)
      .eq("website_created", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!salon) return null;

    const [{ data: services }, { data: staff }, { data: reviews }] = await Promise.all([
      supabase
        .from("services")
        .select("id, name, description, category, duration_minutes, price, image_url")
        .eq("salon_id", salon.id)
        .eq("is_active", true)
        .order("price", { ascending: true }),
      supabase.rpc("list_salon_staff", { _salon_id: salon.id }),
      supabase
        .from("reviews")
        .select("id, rating, comment, created_at, user_id")
        .eq("salon_id", salon.id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    return {
      salon,
      services: services ?? [],
      staff: (staff ?? []) as PublicStaffMember[],
      reviews: reviews ?? [],
    };
  });
