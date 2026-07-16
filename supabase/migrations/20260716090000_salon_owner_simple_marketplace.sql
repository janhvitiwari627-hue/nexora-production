-- Simple salon-owner marketplace flow for Lovable Cloud.
-- Owners can finish setup immediately, while public visibility remains an admin decision.

ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS about_us text,
  ADD COLUMN IF NOT EXISTS owner_profile_image_url text,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS home_service_charge numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS home_service_radius_km numeric(6,2) NOT NULL DEFAULT 0;

ALTER TABLE public.salons
  DROP CONSTRAINT IF EXISTS salons_gallery_limit,
  ADD CONSTRAINT salons_gallery_limit
    CHECK (COALESCE(cardinality(gallery_images), 0) <= 5),
  DROP CONSTRAINT IF EXISTS salons_home_service_charge_nonnegative,
  ADD CONSTRAINT salons_home_service_charge_nonnegative
    CHECK (home_service_charge >= 0),
  DROP CONSTRAINT IF EXISTS salons_home_service_radius_valid,
  ADD CONSTRAINT salons_home_service_radius_valid
    CHECK (home_service_radius_km >= 0 AND home_service_radius_km <= 100);

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS service_mode text NOT NULL DEFAULT 'in_salon',
  ADD COLUMN IF NOT EXISTS service_address text,
  ADD COLUMN IF NOT EXISTS home_service_charge numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS proposed_date date,
  ADD COLUMN IF NOT EXISTS proposed_time time,
  ADD COLUMN IF NOT EXISTS proposal_status text,
  ADD COLUMN IF NOT EXISTS proposal_note text;

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_service_mode_check,
  ADD CONSTRAINT bookings_service_mode_check
    CHECK (service_mode IN ('in_salon', 'home')),
  DROP CONSTRAINT IF EXISTS bookings_proposal_status_check,
  ADD CONSTRAINT bookings_proposal_status_check
    CHECK (proposal_status IS NULL OR proposal_status IN ('pending', 'accepted', 'rejected')),
  DROP CONSTRAINT IF EXISTS bookings_home_service_charge_nonnegative,
  ADD CONSTRAINT bookings_home_service_charge_nonnegative
    CHECK (home_service_charge >= 0);

-- Rebuild registration around the existing authenticated RPC. No service-role key is
-- requested by the app. The owner link is usable immediately, but the salon remains
-- private until an admin verifies and activates it.
CREATE OR REPLACE FUNCTION public.register_owner_business(
  _shop_name text,
  _district text,
  _owner_name text,
  _mobile text,
  _category text DEFAULT NULL,
  _address text DEFAULT NULL,
  _whatsapp text DEFAULT NULL,
  _email text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  new_salon_id uuid;
  new_business_id uuid;
  default_template_id uuid;
  default_template_key text;
  slug_base text;
  slug_final text;
  i integer := 0;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _shop_name IS NULL OR length(trim(_shop_name)) < 2 THEN RAISE EXCEPTION 'Shop name is required'; END IF;
  IF _district IS NULL OR length(trim(_district)) < 2 THEN RAISE EXCEPTION 'District is required'; END IF;
  IF _owner_name IS NULL OR length(trim(_owner_name)) < 2 THEN RAISE EXCEPTION 'Owner name is required'; END IF;
  IF _mobile IS NULL OR trim(_mobile) !~ '^(\+91)?[6-9][0-9]{9}$' THEN RAISE EXCEPTION 'Valid mobile is required'; END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (uid, 'shop_owner'::public.app_role), (uid, 'owner'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  slug_base := regexp_replace(lower(trim(_shop_name)), '[^a-z0-9]+', '-', 'g');
  slug_base := regexp_replace(slug_base, '(^-+|-+$)', '', 'g');
  IF slug_base = '' THEN slug_base := 'salon'; END IF;
  slug_final := slug_base;
  WHILE EXISTS (SELECT 1 FROM public.salons WHERE slug = slug_final) LOOP
    i := i + 1;
    slug_final := slug_base || '-' || i::text;
  END LOOP;

  SELECT id, template_key
    INTO default_template_id, default_template_key
    FROM public.website_templates
   WHERE is_active = true
   ORDER BY sort_order ASC, created_at ASC
   LIMIT 1;

  INSERT INTO public.salons (
    name, slug, district, city, category, address, phone, whatsapp, email,
    owner_name, is_active, is_verified, website_created,
    selected_template_id, selected_template_key, theme, hours
  ) VALUES (
    trim(_shop_name), slug_final, trim(_district), trim(_district),
    NULLIF(trim(coalesce(_category, '')), ''),
    NULLIF(trim(coalesce(_address, '')), ''),
    trim(_mobile),
    COALESCE(NULLIF(trim(coalesce(_whatsapp, '')), ''), trim(_mobile)),
    NULLIF(trim(coalesce(_email, '')), ''),
    trim(_owner_name), false, false, true,
    default_template_id, default_template_key, 'modern',
    '{"mon":{"open":"10:00","close":"20:00","closed":false},"tue":{"open":"10:00","close":"20:00","closed":false},"wed":{"open":"10:00","close":"20:00","closed":false},"thu":{"open":"10:00","close":"20:00","closed":false},"fri":{"open":"10:00","close":"20:00","closed":false},"sat":{"open":"10:00","close":"20:00","closed":false},"sun":{"open":"10:00","close":"20:00","closed":true}}'::jsonb
  ) RETURNING id INTO new_salon_id;

  INSERT INTO public.salon_owners (user_id, salon_id, role, is_approved, approved_at)
  VALUES (uid, new_salon_id, 'owner', true, now());

  INSERT INTO public.businesses (
    owner_id, salon_id, business_name, business_category, phone,
    whatsapp_number, city, area_locality, status, is_active
  ) VALUES (
    uid, new_salon_id, trim(_shop_name),
    NULLIF(trim(coalesce(_category, '')), ''), trim(_mobile),
    COALESCE(NULLIF(trim(coalesce(_whatsapp, '')), ''), trim(_mobile)),
    trim(_district), NULLIF(trim(coalesce(_address, '')), ''),
    'pending_verification', false
  ) RETURNING id INTO new_business_id;

  INSERT INTO public.shop_members (business_id, user_id, role)
  VALUES (new_business_id, uid, 'shop_owner'::public.app_role)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.owner_requests (
    user_id, business_id, owner_full_name, email, phone, business_name,
    business_category, whatsapp_number, city, area_locality, status
  ) VALUES (
    uid, new_business_id, trim(_owner_name),
    coalesce(NULLIF(trim(coalesce(_email, '')), ''), ''), trim(_mobile),
    trim(_shop_name), NULLIF(trim(coalesce(_category, '')), ''),
    COALESCE(NULLIF(trim(coalesce(_whatsapp, '')), ''), trim(_mobile)),
    trim(_district), NULLIF(trim(coalesce(_address, '')), ''), 'pending'
  );

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    uid, 'owner.register_business', 'business', new_business_id,
    jsonb_build_object('salon_id', new_salon_id, 'shop_name', trim(_shop_name), 'city', trim(_district))
  );

  UPDATE public.profiles
     SET mobile = COALESCE(mobile, trim(_mobile)),
         full_name = COALESCE(NULLIF(full_name, ''), trim(_owner_name))
   WHERE id = uid;

  RETURN new_salon_id;
END;
$$;

REVOKE ALL ON FUNCTION public.register_owner_business(text,text,text,text,text,text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.register_owner_business(text,text,text,text,text,text,text,text) TO authenticated;

-- Finalize the editable website without activating an unverified marketplace listing.
CREATE OR REPLACE FUNCTION public.complete_owner_salon_setup(_salon_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s public.salons%ROWTYPE;
  active_services integer;
  missing text[] := ARRAY[]::text[];
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_salon_owner(auth.uid(), _salon_id) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT * INTO s FROM public.salons WHERE id = _salon_id AND deleted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Salon not found'; END IF;

  SELECT count(*) INTO active_services
    FROM public.services
   WHERE salon_id = _salon_id AND is_active = true AND deleted_at IS NULL;

  IF nullif(trim(s.name), '') IS NULL THEN missing := array_append(missing, 'Salon name'); END IF;
  IF nullif(trim(s.category), '') IS NULL THEN missing := array_append(missing, 'Category'); END IF;
  IF nullif(trim(s.owner_name), '') IS NULL THEN missing := array_append(missing, 'Owner name'); END IF;
  IF nullif(trim(s.phone), '') IS NULL THEN missing := array_append(missing, 'Mobile'); END IF;
  IF nullif(trim(s.address), '') IS NULL THEN missing := array_append(missing, 'Address'); END IF;
  IF s.latitude IS NULL OR s.longitude IS NULL THEN missing := array_append(missing, 'Google Maps location'); END IF;
  IF s.cover_image_url IS NULL THEN missing := array_append(missing, 'Cover image'); END IF;
  IF s.hours IS NULL THEN missing := array_append(missing, 'Working hours'); END IF;
  IF active_services < 1 THEN missing := array_append(missing, 'At least one service'); END IF;
  IF s.is_home_service AND (s.home_service_radius_km <= 0) THEN
    missing := array_append(missing, 'Home-service radius');
  END IF;

  IF cardinality(missing) > 0 THEN
    RETURN jsonb_build_object('ok', false, 'missing', to_jsonb(missing));
  END IF;

  UPDATE public.salons
     SET setup_completed_at = now(), website_created = true
   WHERE id = _salon_id;

  RETURN jsonb_build_object(
    'ok', true,
    'missing', '[]'::jsonb,
    'awaiting_approval', NOT s.is_verified
  );
END;
$$;

REVOKE ALL ON FUNCTION public.complete_owner_salon_setup(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_owner_salon_setup(uuid) TO authenticated;

-- Owner booking decisions are constrained to explicit marketplace transitions.
CREATE OR REPLACE FUNCTION public.owner_transition_booking(
  _booking_id uuid,
  _action text,
  _proposed_date date DEFAULT NULL,
  _proposed_time time DEFAULT NULL,
  _note text DEFAULT NULL
) RETURNS public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  b public.bookings%ROWTYPE;
BEGIN
  SELECT * INTO b FROM public.bookings WHERE id = _booking_id AND deleted_at IS NULL FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Booking not found'; END IF;
  IF auth.uid() IS NULL OR NOT public.is_salon_owner(auth.uid(), b.salon_id) THEN RAISE EXCEPTION 'Forbidden'; END IF;

  IF _action = 'confirm' THEN
    IF b.status <> 'pending' THEN RAISE EXCEPTION 'Only pending bookings can be confirmed'; END IF;
    UPDATE public.bookings
       SET status = 'confirmed', proposal_status = NULL, updated_at = now()
     WHERE id = b.id RETURNING * INTO b;
  ELSIF _action = 'reject' THEN
    IF b.status NOT IN ('pending', 'confirmed') THEN RAISE EXCEPTION 'Booking cannot be rejected now'; END IF;
    UPDATE public.bookings
       SET status = 'cancelled', cancellation_reason = left(coalesce(_note, 'Rejected by salon'), 300),
           cancelled_at = now(), cancelled_by = auth.uid(), updated_at = now()
     WHERE id = b.id RETURNING * INTO b;
  ELSIF _action = 'complete' THEN
    IF b.status <> 'confirmed' THEN RAISE EXCEPTION 'Only confirmed bookings can be completed'; END IF;
    UPDATE public.bookings SET status = 'completed', updated_at = now()
     WHERE id = b.id RETURNING * INTO b;
  ELSIF _action = 'no_show' THEN
    IF b.status NOT IN ('pending', 'confirmed') THEN RAISE EXCEPTION 'Booking cannot be marked no-show now'; END IF;
    UPDATE public.bookings SET status = 'no_show', updated_at = now()
     WHERE id = b.id RETURNING * INTO b;
  ELSIF _action = 'suggest_time' THEN
    IF b.status <> 'pending' THEN RAISE EXCEPTION 'A new time can only be suggested for pending bookings'; END IF;
    IF _proposed_date IS NULL OR _proposed_time IS NULL THEN RAISE EXCEPTION 'New date and time are required'; END IF;
    IF (_proposed_date + _proposed_time) <= now() THEN RAISE EXCEPTION 'Suggested time must be in the future'; END IF;
    UPDATE public.bookings
       SET proposed_date = _proposed_date, proposed_time = _proposed_time,
           proposal_status = 'pending', proposal_note = left(nullif(trim(_note), ''), 300), updated_at = now()
     WHERE id = b.id RETURNING * INTO b;
    INSERT INTO public.notifications (user_id, title, body, type, link)
    VALUES (
      b.user_id,
      'Salon suggested a new time',
      'Please accept or reject the new appointment time.',
      'booking_time_proposed',
      '/dashboard/bookings/' || b.id::text
    );
  ELSE
    RAISE EXCEPTION 'Unsupported booking action';
  END IF;

  RETURN b;
END;
$$;

REVOKE ALL ON FUNCTION public.owner_transition_booking(uuid,text,date,time,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.owner_transition_booking(uuid,text,date,time,text) TO authenticated;

-- Admin approval uses authenticated, role-checked RPCs rather than an unavailable
-- Lovable-managed service-role credential.
CREATE OR REPLACE FUNCTION public.list_pending_owner_salons()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  result jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'id', r.id,
      'created_at', r.created_at,
      'salon', jsonb_build_object(
        'id', s.id, 'name', s.name, 'slug', s.slug, 'city', s.city, 'phone', s.phone
      ),
      'user', jsonb_build_object(
        'id', p.id, 'full_name', p.full_name, 'email', p.email, 'mobile', p.mobile
      )
    ) ORDER BY r.created_at DESC), '[]'::jsonb) INTO result
  FROM public.owner_requests r
  JOIN public.businesses b ON b.id = r.business_id
  JOIN public.salons s ON s.id = b.salon_id
  LEFT JOIN public.profiles p ON p.id = r.user_id
  WHERE r.status = 'pending';

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.review_owner_salon(_owner_request_id uuid, _approve boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_row public.owner_requests%ROWTYPE;
  business_row public.businesses%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT * INTO request_row FROM public.owner_requests
   WHERE id = _owner_request_id AND status = 'pending' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pending owner request not found'; END IF;

  SELECT * INTO business_row FROM public.businesses WHERE id = request_row.business_id;
  IF NOT FOUND OR business_row.salon_id IS NULL THEN RAISE EXCEPTION 'Linked salon not found'; END IF;

  UPDATE public.owner_requests
     SET status = CASE WHEN _approve THEN 'approved' ELSE 'rejected' END
   WHERE id = request_row.id;

  UPDATE public.businesses
     SET status = CASE WHEN _approve THEN 'verified'::public.business_status ELSE 'rejected'::public.business_status END,
         is_active = _approve,
         updated_at = now()
   WHERE id = business_row.id;

  UPDATE public.salons
     SET is_verified = _approve, is_active = _approve, updated_at = now()
   WHERE id = business_row.salon_id;

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    CASE WHEN _approve THEN 'admin.approve_owner_salon' ELSE 'admin.reject_owner_salon' END,
    'business', business_row.id,
    jsonb_build_object('salon_id', business_row.salon_id, 'owner_request_id', request_row.id)
  );

  RETURN jsonb_build_object('ok', true, 'approved', _approve, 'salon_id', business_row.salon_id);
END;
$$;

REVOKE ALL ON FUNCTION public.list_pending_owner_salons() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_pending_owner_salons() TO authenticated;
REVOKE ALL ON FUNCTION public.review_owner_salon(uuid,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_owner_salon(uuid,boolean) TO authenticated;

-- Expose only customer-safe website fields through the invoker view.
DROP VIEW IF EXISTS public.public_salon_cards;
CREATE VIEW public.public_salon_cards
WITH (security_invoker = true) AS
SELECT
  s.id, s.slug, s.name, s.tagline, s.category, s.description, s.about_us,
  s.location, NULLIF(concat_ws(', ', NULLIF(s.location, ''), NULLIF(s.city, '')), '') AS address,
  s.city, s.pincode, s.latitude, s.longitude,
  s.cover_image_url, s.image_url, s.logo_url, s.owner_profile_image_url, s.video_url, s.gallery_images,
  s.rating, s.reviews_count, s.price_range, s.discount,
  s.is_verified, s.is_active, s.is_home_service, s.home_service_charge, s.home_service_radius_km,
  s.amenities, s.hours, s.website_url, s.theme, s.brand_primary, s.brand_secondary,
  s.nexora_score, s.rank_in_city, s.created_at,
  s.selected_template_id, s.selected_template_key, s.website_created,
  CASE WHEN s.show_public_contact THEN s.business_public_phone ELSE NULL::text END AS phone,
  CASE WHEN s.show_public_contact THEN s.business_public_whatsapp ELSE NULL::text END AS whatsapp
FROM public.salons s
WHERE s.is_active = true AND s.deleted_at IS NULL;

GRANT SELECT ON public.public_salon_cards TO anon, authenticated;
GRANT SELECT (
  id, slug, name, tagline, category, description, about_us, location, city, pincode,
  latitude, longitude, cover_image_url, image_url, logo_url, owner_profile_image_url,
  video_url, gallery_images, rating, reviews_count, price_range, discount, is_verified,
  is_active, is_home_service, home_service_charge, home_service_radius_km, amenities,
  hours, website_url, theme, brand_primary, brand_secondary, nexora_score, rank_in_city,
  created_at, selected_template_id, selected_template_key, website_created,
  show_public_contact, business_public_phone, business_public_whatsapp, deleted_at
) ON public.salons TO anon;
