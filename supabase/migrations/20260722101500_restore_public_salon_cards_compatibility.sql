-- Restore the public marketplace API expected by the customer and discovery UI.
-- The current production foundation stores salons in public.shops.

DROP VIEW IF EXISTS public.public_salon_cards;

CREATE VIEW public.public_salon_cards
WITH (security_invoker = true) AS
SELECT
  shop.id,
  shop.slug,
  shop.name,
  NULL::text AS tagline,
  COALESCE(category.name, 'Salon'::text) AS category,
  shop.description,
  NULL::text AS about_us,
  shop.address AS location,
  shop.address,
  shop.city,
  shop.postal_code AS pincode,
  shop.latitude,
  shop.longitude,
  shop.cover_image_url,
  shop.logo_url AS image_url,
  shop.logo_url,
  NULL::text AS owner_profile_image_url,
  NULL::text AS video_url,
  NULL::text[] AS gallery_images,
  COALESCE(shop.rating_average, 0::numeric) AS rating,
  COALESCE(shop.review_count, 0) AS reviews_count,
  NULL::text AS price_range,
  NULL::text AS discount,
  COALESCE(shop.is_verified, false) AS is_verified,
  COALESCE(shop.is_active, false) AS is_active,
  false AS is_home_service,
  NULL::numeric AS home_service_charge,
  NULL::numeric AS home_service_radius_km,
  NULL::text[] AS amenities,
  NULL::jsonb AS hours,
  NULL::text AS website_url,
  'nexora-gold'::text AS theme,
  '#0b0a08'::text AS brand_primary,
  '#d7a93b'::text AS brand_secondary,
  COALESCE(shop.rating_average, 0::numeric) AS nexora_score,
  NULL::integer AS rank_in_city,
  shop.created_at,
  NULL::uuid AS selected_template_id,
  NULL::text AS selected_template_key,
  (COALESCE(shop.is_published, false) OR shop.approval_status = 'approved') AS website_created,
  shop.phone,
  shop.whatsapp
FROM public.shops AS shop
LEFT JOIN public.service_categories AS category ON category.id = shop.category_id
WHERE shop.is_active IS TRUE
  AND (shop.approval_status = 'approved' OR shop.is_published IS TRUE);

REVOKE ALL ON public.public_salon_cards FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.public_salon_cards TO anon, authenticated;

COMMENT ON VIEW public.public_salon_cards IS
  'RLS-invoker compatibility view exposing only public marketplace shop fields.';

NOTIFY pgrst, 'reload schema';
