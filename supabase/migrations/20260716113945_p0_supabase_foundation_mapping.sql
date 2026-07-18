-- P0: canonical Supabase foundation without duplicating existing business data.
--
-- Canonical physical tables already present:
--   profiles, services, website_templates
--
-- Canonical compatibility views:
--   tenants          -> salons
--   customers        -> profiles
--   appointments     -> bookings
--   tenant_websites  -> public_salon_cards / salons website fields
--   media_files      -> storage.objects in the salon-media bucket
--
-- The views are intentionally read-only. Existing RPCs and legacy tables remain
-- the write path until a later module migrates each workflow transactionally.

-- ---------------------------------------------------------------------------
-- RLS foundations used by the compatibility views
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_templates ENABLE ROW LEVEL SECURITY;

-- Anonymous users can only reach the explicitly granted marketing columns.
-- Sensitive salon columns (owner phone/email/UPI) are not granted to anon.
DROP POLICY IF EXISTS "P0 public reads active salon website rows" ON public.salons;
CREATE POLICY "P0 public reads active salon website rows"
ON public.salons
FOR SELECT
TO anon
USING (is_active IS TRUE AND deleted_at IS NULL);

-- A salon owner needs customer identity details only for customers who booked
-- that owner's salon. This keeps the canonical customers mapping useful without
-- turning profiles into an authenticated-user directory.
DROP POLICY IF EXISTS "P0 owners read booked customers" ON public.profiles;
CREATE POLICY "P0 owners read booked customers"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.bookings AS booking
    WHERE booking.user_id = profiles.id
      AND booking.deleted_at IS NULL
      AND public.is_salon_owner((SELECT auth.uid()), booking.salon_id)
  )
);

-- Growth partners can read only active tenants explicitly assigned to them.
-- They do not receive access to customer profiles, appointments or owner
-- financial fields.
DROP POLICY IF EXISTS "P0 partners read assigned tenants" ON public.salons;
CREATE POLICY "P0 partners read assigned tenants"
ON public.salons
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.partner_shop_mapping AS mapping
    JOIN public.district_business_partners AS partner
      ON partner.id = mapping.partner_id
    WHERE mapping.salon_id = salons.id
      AND mapping.is_active IS TRUE
      AND partner.user_id = (SELECT auth.uid())
  )
);

-- Keep public service/template access constrained to active records. Existing
-- owner/member/admin policies continue to govern authenticated management.
DROP POLICY IF EXISTS "P0 public reads active tenant services" ON public.services;
CREATE POLICY "P0 public reads active tenant services"
ON public.services
FOR SELECT
TO anon, authenticated
USING (
  is_active IS TRUE
  AND deleted_at IS NULL
  AND EXISTS (
    SELECT 1
    FROM public.salons AS salon
    WHERE salon.id = services.salon_id
      AND salon.is_active IS TRUE
      AND salon.deleted_at IS NULL
  )
);

DROP POLICY IF EXISTS "P0 public reads active website templates" ON public.website_templates;
CREATE POLICY "P0 public reads active website templates"
ON public.website_templates
FOR SELECT
TO anon, authenticated
USING (is_active IS TRUE);

-- Explicit Data API privileges. RLS and grants are separate controls.
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.bookings FROM anon;
REVOKE ALL ON public.salons FROM anon;

-- Table-level REVOKE does not remove older column-level grants. Clear them
-- before granting the reviewed public website projection below.
DO $revoke_anon_salon_columns$
DECLARE
  granted_column record;
BEGIN
  FOR granted_column IN
    SELECT column_name
    FROM information_schema.column_privileges
    WHERE table_schema = 'public'
      AND table_name = 'salons'
      AND grantee = 'anon'
      AND privilege_type = 'SELECT'
  LOOP
    EXECUTE format(
      'REVOKE SELECT (%I) ON public.salons FROM anon',
      granted_column.column_name
    );
  END LOOP;
END
$revoke_anon_salon_columns$;

GRANT SELECT (
  id, slug, name, tagline, category, description, about_us, location, city,
  pincode, latitude, longitude, cover_image_url, image_url, logo_url,
  owner_profile_image_url, video_url, gallery_images, rating, reviews_count,
  price_range, discount, is_verified, is_active, is_home_service,
  home_service_charge, home_service_radius_km, amenities, hours, website_url,
  theme, brand_primary, brand_secondary, nexora_score, rank_in_city, created_at,
  selected_template_id, selected_template_key, website_created,
  show_public_contact, business_public_phone, business_public_whatsapp,
  deleted_at
) ON public.salons TO anon;
GRANT SELECT ON public.services TO anon, authenticated;
GRANT SELECT ON public.website_templates TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Canonical mapping views
-- ---------------------------------------------------------------------------

CREATE VIEW public.tenants
WITH (security_invoker = true, security_barrier = true)
AS
SELECT
  salon.id,
  salon.slug,
  salon.name,
  salon.tagline,
  salon.category,
  salon.description,
  salon.about_us,
  salon.location,
  salon.address,
  salon.city,
  salon.district,
  salon.pincode,
  salon.latitude,
  salon.longitude,
  salon.logo_url,
  salon.cover_image_url,
  salon.image_url,
  salon.gallery_images,
  salon.video_url,
  salon.hours,
  salon.amenities,
  salon.is_home_service,
  salon.home_service_charge,
  salon.home_service_radius_km,
  salon.business_public_phone AS public_phone,
  salon.business_public_whatsapp AS public_whatsapp,
  salon.show_public_contact,
  salon.is_active,
  salon.is_verified,
  salon.website_created,
  salon.website_url,
  salon.selected_template_id,
  salon.selected_template_key,
  salon.theme,
  salon.brand_primary,
  salon.brand_secondary,
  salon.created_at,
  salon.updated_at,
  salon.deleted_at
FROM public.salons AS salon;

COMMENT ON VIEW public.tenants IS
  'P0 canonical read mapping over public.salons. Writes remain on salons/RPCs.';

CREATE VIEW public.customers
WITH (security_invoker = true, security_barrier = true)
AS
SELECT
  profile.id,
  profile.full_name,
  profile.username,
  profile.email,
  profile.mobile,
  profile.avatar_url,
  profile.gender,
  profile.date_of_birth,
  profile.city,
  profile.district,
  profile.state,
  profile.country,
  profile.pincode,
  profile.is_active,
  profile.is_verified,
  profile.created_at,
  profile.updated_at
FROM public.profiles AS profile;

COMMENT ON VIEW public.customers IS
  'P0 canonical read mapping over public.profiles. RLS limits self/admin/booked-customer access.';

CREATE VIEW public.appointments
WITH (security_invoker = true, security_barrier = true)
AS
SELECT
  booking.id,
  booking.booking_reference,
  booking.salon_id AS tenant_id,
  booking.user_id AS customer_id,
  booking.service_name,
  booking.booking_date AS appointment_date,
  booking.booking_time AS appointment_time,
  booking.price,
  booking.status,
  booking.payment_status,
  booking.service_mode,
  booking.service_address,
  booking.home_service_charge,
  booking.advance_amount,
  booking.payment_deadline,
  booking.proposed_date,
  booking.proposed_time,
  booking.proposal_status,
  booking.proposal_note,
  booking.cancellation_reason,
  booking.cancelled_at,
  booking.cancelled_by,
  booking.refund_status,
  booking.created_at,
  booking.updated_at,
  booking.deleted_at
FROM public.bookings AS booking;

COMMENT ON VIEW public.appointments IS
  'P0 canonical read mapping over public.bookings. Writes remain on booking RPCs/table policies.';

CREATE VIEW public.tenant_websites
WITH (security_invoker = true, security_barrier = true)
AS
SELECT
  salon.id,
  salon.id AS tenant_id,
  salon.slug,
  salon.name,
  salon.tagline,
  salon.category,
  salon.description,
  salon.about_us,
  salon.location,
  salon.address,
  salon.city,
  salon.pincode,
  salon.latitude,
  salon.longitude,
  salon.cover_image_url,
  salon.image_url,
  salon.logo_url,
  salon.owner_profile_image_url,
  salon.video_url,
  salon.gallery_images,
  salon.rating,
  salon.reviews_count,
  salon.price_range,
  salon.discount,
  salon.is_verified,
  salon.is_active,
  salon.is_home_service,
  salon.home_service_charge,
  salon.home_service_radius_km,
  salon.amenities,
  salon.hours,
  salon.website_url,
  salon.theme,
  salon.brand_primary,
  salon.brand_secondary,
  salon.selected_template_id AS template_id,
  salon.selected_template_key AS template_key,
  salon.website_created AS is_published,
  salon.phone,
  salon.whatsapp,
  salon.created_at
FROM public.public_salon_cards AS salon;

COMMENT ON VIEW public.tenant_websites IS
  'P0 public website mapping over the safe active-salon projection.';

CREATE VIEW public.media_files
WITH (security_invoker = true, security_barrier = true)
AS
SELECT
  object.id,
  split_part(object.name, '/', 1)::uuid AS tenant_id,
  object.bucket_id,
  object.name AS object_path,
  object.metadata,
  object.created_at,
  object.updated_at,
  object.last_accessed_at
FROM storage.objects AS object
WHERE object.bucket_id = 'salon-media'
  AND split_part(object.name, '/', 1) ~*
    '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

COMMENT ON VIEW public.media_files IS
  'P0 canonical read mapping over storage.objects for UUID-prefixed salon-media paths.';

-- Views do not bypass underlying RLS because every view is security_invoker.
REVOKE ALL ON public.tenants FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.customers FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.appointments FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.tenant_websites FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.media_files FROM PUBLIC, anon, authenticated;

GRANT SELECT ON public.tenants TO authenticated;
GRANT SELECT ON public.customers TO authenticated;
GRANT SELECT ON public.appointments TO authenticated;
GRANT SELECT ON public.tenant_websites TO anon, authenticated;
GRANT SELECT ON public.media_files TO anon, authenticated;
