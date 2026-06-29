
DROP POLICY IF EXISTS "DBP: public can view verified partners" ON public.district_business_partners;

CREATE OR REPLACE VIEW public.public_dbp_profiles
WITH (security_invoker = true) AS
SELECT id, slug, full_name, district, state, photo_url, tagline,
       success_story, tier, hall_of_fame, hall_of_fame_rank, verified_at, status
  FROM public.district_business_partners
 WHERE status = 'verified';

DROP POLICY IF EXISTS "DBP: anon can view verified via view" ON public.district_business_partners;
CREATE POLICY "DBP: anon can view verified via view"
  ON public.district_business_partners FOR SELECT
  TO anon
  USING (status = 'verified');

GRANT SELECT ON public.public_dbp_profiles TO anon, authenticated;

REVOKE SELECT ON public.district_business_partners FROM anon;
GRANT SELECT (
  id, slug, full_name, district, state, photo_url, tagline,
  success_story, tier, hall_of_fame, hall_of_fame_rank, verified_at, status
) ON public.district_business_partners TO anon;

ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS business_public_phone text,
  ADD COLUMN IF NOT EXISTS business_public_whatsapp text,
  ADD COLUMN IF NOT EXISTS show_public_contact boolean NOT NULL DEFAULT true;

DROP VIEW IF EXISTS public.public_salon_cards;
CREATE VIEW public.public_salon_cards
WITH (security_invoker = true) AS
SELECT
  s.id, s.slug, s.name, s.tagline, s.category, s.description,
  s.location, s.address, s.city, s.pincode,
  s.latitude, s.longitude,
  s.cover_image_url, s.image_url, s.logo_url, s.gallery_images,
  s.rating, s.reviews_count, s.price_range, s.discount,
  s.is_verified, s.is_active, s.is_home_service,
  s.amenities, s.hours, s.website_url, s.theme, s.brand_primary, s.brand_secondary,
  s.nexora_score, s.rank_in_city, s.created_at,
  s.selected_template_id, s.selected_template_key, s.website_created,
  CASE WHEN s.show_public_contact THEN COALESCE(s.business_public_phone, s.phone) END AS phone,
  CASE WHEN s.show_public_contact THEN COALESCE(s.business_public_whatsapp, s.whatsapp) END AS whatsapp
FROM public.salons s
WHERE s.is_active = true;

GRANT SELECT ON public.public_salon_cards TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.is_salon_owner(uuid, uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_salon_owner(uuid, uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_district_partner(uuid, uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_district_partner(uuid, uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.release_payment_to_wallet(uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.release_payment_to_wallet(uuid) TO service_role;

REVOKE EXECUTE ON FUNCTION public.request_withdrawal(uuid, numeric, jsonb) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_withdrawal(uuid, numeric, jsonb) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.recompute_partner_dashboard_metrics(uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.recompute_partner_dashboard_metrics(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.recompute_partner_leaderboard(dbp_leaderboard_period) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.recompute_partner_leaderboard(dbp_leaderboard_period) TO service_role;

REVOKE EXECUTE ON FUNCTION public.recompute_customer_insights() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.recompute_customer_insights() TO service_role;

REVOKE EXECUTE ON FUNCTION public.recompute_nexora_scores() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.recompute_nexora_scores() TO service_role;

REVOKE EXECUTE ON FUNCTION public.auto_release_escrow() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.auto_release_escrow() TO service_role;

REVOKE EXECUTE ON FUNCTION public.process_pending_settlements() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.process_pending_settlements() TO service_role;

REVOKE EXECUTE ON FUNCTION public.release_expired_bookings() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.release_expired_bookings() TO service_role;

REVOKE EXECUTE ON FUNCTION public.refresh_salon_stats() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.refresh_salon_stats() TO service_role;

REVOKE EXECUTE ON FUNCTION public.list_salon_staff(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_salon_staff(uuid) TO anon, authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_at_risk_customers(uuid, integer) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_at_risk_customers(uuid, integer) TO authenticated, service_role;
