-- Fix security-definer view risk and prevent anonymous access to salon PII.

-- Remove elevated/definer behavior from public salon view and rebuild it without private contact fields.
DROP VIEW IF EXISTS public.public_salon_cards;

CREATE VIEW public.public_salon_cards
WITH (security_invoker = true) AS
SELECT
  s.id,
  s.slug,
  s.name,
  s.tagline,
  s.category,
  s.description,
  s.location,
  NULLIF(concat_ws(', ', NULLIF(s.location, ''), NULLIF(s.city, '')), '') AS address,
  s.city,
  s.pincode,
  s.latitude,
  s.longitude,
  s.cover_image_url,
  s.image_url,
  s.logo_url,
  s.gallery_images,
  s.rating,
  s.reviews_count,
  s.price_range,
  s.discount,
  s.is_verified,
  s.is_active,
  s.is_home_service,
  s.amenities,
  s.hours,
  s.website_url,
  s.theme,
  s.brand_primary,
  s.brand_secondary,
  s.nexora_score,
  s.rank_in_city,
  s.created_at,
  s.selected_template_id,
  s.selected_template_key,
  s.website_created,
  CASE WHEN s.show_public_contact THEN s.business_public_phone ELSE NULL::text END AS phone,
  CASE WHEN s.show_public_contact THEN s.business_public_whatsapp ELSE NULL::text END AS whatsapp
FROM public.salons s
WHERE s.is_active = true
  AND s.deleted_at IS NULL;

GRANT SELECT ON public.public_salon_cards TO anon, authenticated;

-- Public visitors should not have table-wide salon access; only safe columns needed by the invoker view.
REVOKE SELECT ON public.salons FROM anon;
GRANT SELECT (
  id,
  slug,
  name,
  tagline,
  category,
  description,
  location,
  city,
  pincode,
  latitude,
  longitude,
  cover_image_url,
  image_url,
  logo_url,
  gallery_images,
  rating,
  reviews_count,
  price_range,
  discount,
  is_verified,
  is_active,
  is_home_service,
  amenities,
  hours,
  website_url,
  theme,
  brand_primary,
  brand_secondary,
  nexora_score,
  rank_in_city,
  created_at,
  selected_template_id,
  selected_template_key,
  website_created,
  show_public_contact,
  business_public_phone,
  business_public_whatsapp,
  deleted_at
) ON public.salons TO anon;

-- Keep row filtering public, but only for anonymous safe-view reads. Authenticated full reads remain owner/member/admin scoped by separate policies.
DROP POLICY IF EXISTS "Public read active salons" ON public.salons;
CREATE POLICY "Anonymous can read active salon marketing rows"
ON public.salons
FOR SELECT
TO anon
USING (is_active = true AND deleted_at IS NULL);

-- Ensure other public views also use invoker permissions when present.
DO $$
BEGIN
  IF to_regclass('public.brands_public') IS NOT NULL THEN
    ALTER VIEW public.brands_public SET (security_invoker = true);
  END IF;
  IF to_regclass('public.distributors_public') IS NOT NULL THEN
    ALTER VIEW public.distributors_public SET (security_invoker = true);
  END IF;
  IF to_regclass('public.partner_hall_of_fame_public') IS NOT NULL THEN
    ALTER VIEW public.partner_hall_of_fame_public SET (security_invoker = true);
  END IF;
  IF to_regclass('public.partner_leaderboard_public') IS NOT NULL THEN
    ALTER VIEW public.partner_leaderboard_public SET (security_invoker = true);
  END IF;
END $$;