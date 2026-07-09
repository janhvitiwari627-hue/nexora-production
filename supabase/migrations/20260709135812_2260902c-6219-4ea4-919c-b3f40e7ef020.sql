
-- =========================================================
-- 1) SUPA_security_definer_view: public_salon_cards
-- =========================================================
ALTER VIEW public.public_salon_cards SET (security_invoker = true);

-- Anon needs column-level SELECT on non-sensitive salon columns so the
-- security-invoker view works, without exposing phone/email/owner_name/upi_id.
GRANT SELECT (
  id, slug, name, tagline, category, description, location, city, pincode,
  latitude, longitude, cover_image_url, image_url, logo_url, gallery_images,
  rating, reviews_count, price_range, discount, is_verified, is_active,
  is_home_service, amenities, hours, website_url, theme, brand_primary,
  brand_secondary, nexora_score, rank_in_city, created_at,
  selected_template_id, selected_template_key, website_created, address,
  business_public_phone, business_public_whatsapp, show_public_contact,
  deleted_at, district
) ON public.salons TO anon;

GRANT SELECT (
  id, slug, name, tagline, category, description, location, city, pincode,
  latitude, longitude, cover_image_url, image_url, logo_url, gallery_images,
  rating, reviews_count, price_range, discount, is_verified, is_active,
  is_home_service, amenities, hours, website_url, theme, brand_primary,
  brand_secondary, nexora_score, rank_in_city, created_at,
  selected_template_id, selected_template_key, website_created, address,
  business_public_phone, business_public_whatsapp, show_public_contact,
  deleted_at, district
) ON public.salons TO authenticated;

-- Narrow RLS policy allowing public reads of active, non-deleted salons.
DROP POLICY IF EXISTS "Public read active salons" ON public.salons;
CREATE POLICY "Public read active salons"
  ON public.salons FOR SELECT
  TO anon, authenticated
  USING (is_active = true AND deleted_at IS NULL);

GRANT SELECT ON public.public_salon_cards TO anon, authenticated;


-- =========================================================
-- 2) businesses_public_pii_exposure
-- =========================================================
-- Remove anonymous access to the raw table (phone/whatsapp_number).
REVOKE ALL ON public.businesses FROM anon;

-- Rewrite SELECT policy: only owner, staff members, and admins can read
-- the raw businesses table (which includes phone/whatsapp_number).
DROP POLICY IF EXISTS businesses_select_owner_member_public_admin ON public.businesses;

CREATE POLICY businesses_select_owner_member_admin
  ON public.businesses FOR SELECT
  TO authenticated
  USING (
    (owner_id = auth.uid())
    OR is_shop_member_biz(id)
    OR is_super_admin()
  );

-- Public-safe view exposing only non-contact fields for active businesses.
DROP VIEW IF EXISTS public.public_businesses;
CREATE VIEW public.public_businesses
WITH (security_invoker = true) AS
SELECT
  id,
  owner_id,
  salon_id,
  business_name,
  business_category,
  city,
  area_locality,
  status,
  is_active,
  created_at
FROM public.businesses
WHERE status = 'active'
  AND is_active = true
  AND deleted_at IS NULL;

-- Column-level SELECT on the base table (needed for security_invoker view)
-- for anon/authenticated — excludes phone and whatsapp_number.
GRANT SELECT (
  id, owner_id, salon_id, business_name, business_category,
  city, area_locality, status, is_active, created_at, deleted_at
) ON public.businesses TO anon, authenticated;

-- Public read RLS branch limited to active/live businesses.
CREATE POLICY businesses_public_active_read
  ON public.businesses FOR SELECT
  TO anon, authenticated
  USING (
    status = 'active'
    AND is_active = true
    AND deleted_at IS NULL
  );

GRANT SELECT ON public.public_businesses TO anon, authenticated;


-- =========================================================
-- 3) memberships_tier_check_bypass
-- =========================================================
DROP POLICY IF EXISTS "Users update own membership (no tier change)" ON public.memberships;

CREATE POLICY "Users update own membership"
  ON public.memberships FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.prevent_membership_tier_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.tier IS DISTINCT FROM OLD.tier
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Membership tier cannot be changed by users'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_membership_tier_change ON public.memberships;
CREATE TRIGGER trg_prevent_membership_tier_change
  BEFORE UPDATE ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION public.prevent_membership_tier_change();
