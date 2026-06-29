
-- Replace broad anon SELECT with column-restricted grants so the
-- security_invoker views can still read, but anon cannot read sensitive
-- columns by querying the base tables directly.

REVOKE SELECT ON public.district_business_partners FROM anon;
GRANT SELECT (
  id, slug, full_name, district, state, photo_url, tagline,
  success_story, tier, hall_of_fame, hall_of_fame_rank,
  verified_at, status
) ON public.district_business_partners TO anon;

REVOKE SELECT ON public.salons FROM anon;
GRANT SELECT (
  id, slug, name, tagline, category, description, location, address,
  city, pincode, latitude, longitude, cover_image_url, image_url,
  logo_url, gallery_images, rating, reviews_count, price_range,
  discount, is_verified, is_active, is_home_service, amenities, hours,
  website_url, theme, brand_primary, brand_secondary, nexora_score,
  rank_in_city, created_at, selected_template_id, selected_template_key,
  website_created, phone, whatsapp
) ON public.salons TO anon;
