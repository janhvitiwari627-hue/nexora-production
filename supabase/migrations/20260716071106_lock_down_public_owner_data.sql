-- Keep owner PII and financial data out of anonymous base-table reads.
-- Public marketplace pages read from deliberately limited mirror tables instead.

CREATE TABLE public.public_salon_cards_next AS
SELECT * FROM public.public_salon_cards WITH NO DATA;

ALTER TABLE public.public_salon_cards_next ENABLE ROW LEVEL SECURITY;

INSERT INTO public.public_salon_cards_next
SELECT * FROM public.public_salon_cards;

CREATE TABLE public.public_businesses_next AS
SELECT * FROM public.public_businesses WITH NO DATA;

ALTER TABLE public.public_businesses_next ENABLE ROW LEVEL SECURITY;

INSERT INTO public.public_businesses_next
SELECT * FROM public.public_businesses;

DROP VIEW public.public_salon_cards;
ALTER TABLE public.public_salon_cards_next RENAME TO public_salon_cards;
ALTER TABLE public.public_salon_cards ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX public_salon_cards_slug_key
  ON public.public_salon_cards (slug);
CREATE INDEX public_salon_cards_city_idx
  ON public.public_salon_cards (city);

DROP VIEW public.public_businesses;
ALTER TABLE public.public_businesses_next RENAME TO public_businesses;
ALTER TABLE public.public_businesses ADD PRIMARY KEY (id);
CREATE INDEX public_businesses_salon_id_idx
  ON public.public_businesses (salon_id);

ALTER TABLE public.public_salon_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read safe salon cards"
  ON public.public_salon_cards
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can read safe active businesses"
  ON public.public_businesses
  FOR SELECT
  TO anon, authenticated
  USING (true);

REVOKE ALL ON public.public_salon_cards FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.public_businesses FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.public_salon_cards TO anon, authenticated;
GRANT SELECT ON public.public_businesses TO anon, authenticated;

DROP POLICY IF EXISTS "Public read active salons" ON public.salons;
DROP POLICY IF EXISTS "businesses_public_active_read" ON public.businesses;

-- Remove every legacy anonymous column grant, not only table-level grants.
DO $revoke$
DECLARE
  column_row record;
BEGIN
  FOR column_row IN
    SELECT table_name, column_name
    FROM information_schema.column_privileges
    WHERE table_schema = 'public'
      AND table_name IN ('salons', 'businesses')
      AND grantee = 'anon'
      AND privilege_type = 'SELECT'
  LOOP
    EXECUTE format(
      'REVOKE SELECT (%I) ON public.%I FROM anon',
      column_row.column_name,
      column_row.table_name
    );
  END LOOP;
END
$revoke$;

REVOKE SELECT ON public.salons FROM anon;
REVOKE SELECT ON public.businesses FROM anon;

CREATE OR REPLACE FUNCTION public.sync_public_salon_card()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  target_id uuid := COALESCE(NEW.id, OLD.id);
BEGIN
  DELETE FROM public.public_salon_cards WHERE id = target_id;

  IF TG_OP <> 'DELETE' AND NEW.is_active IS TRUE AND NEW.deleted_at IS NULL THEN
    INSERT INTO public.public_salon_cards (
      id, slug, name, tagline, category, description, about_us, location,
      address, city, pincode, latitude, longitude, cover_image_url, image_url,
      logo_url, owner_profile_image_url, video_url, gallery_images, rating,
      reviews_count, price_range, discount, is_verified, is_active,
      is_home_service, home_service_charge, home_service_radius_km, amenities,
      hours, website_url, theme, brand_primary, brand_secondary, nexora_score,
      rank_in_city, created_at, selected_template_id, selected_template_key,
      website_created, phone, whatsapp
    )
    SELECT
      s.id, s.slug, s.name, s.tagline, s.category, s.description, s.about_us,
      s.location,
      NULLIF(concat_ws(', ', NULLIF(s.location, ''), NULLIF(s.city, '')), ''),
      s.city, s.pincode, s.latitude, s.longitude, s.cover_image_url, s.image_url,
      s.logo_url, s.owner_profile_image_url, s.video_url, s.gallery_images,
      s.rating, s.reviews_count, s.price_range, s.discount, s.is_verified,
      s.is_active, s.is_home_service, s.home_service_charge,
      s.home_service_radius_km, s.amenities, s.hours, s.website_url, s.theme,
      s.brand_primary, s.brand_secondary, s.nexora_score, s.rank_in_city,
      s.created_at, s.selected_template_id, s.selected_template_key,
      s.website_created,
      CASE WHEN s.show_public_contact THEN s.business_public_phone END,
      CASE WHEN s.show_public_contact THEN s.business_public_whatsapp END
    FROM public.salons AS s
    WHERE s.id = target_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END
$function$;

REVOKE ALL ON FUNCTION public.sync_public_salon_card() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_public_salon_card() TO service_role;

DROP TRIGGER IF EXISTS sync_public_salon_card_trigger ON public.salons;
CREATE TRIGGER sync_public_salon_card_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.salons
FOR EACH ROW EXECUTE FUNCTION public.sync_public_salon_card();

CREATE OR REPLACE FUNCTION public.sync_public_business()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  target_id uuid := COALESCE(NEW.id, OLD.id);
BEGIN
  DELETE FROM public.public_businesses WHERE id = target_id;

  IF TG_OP <> 'DELETE'
     AND NEW.status = 'active'::public.business_status
     AND NEW.is_active IS TRUE
     AND NEW.deleted_at IS NULL THEN
    INSERT INTO public.public_businesses (
      id, owner_id, salon_id, business_name, business_category, city,
      area_locality, status, is_active, created_at
    ) VALUES (
      NEW.id, NEW.owner_id, NEW.salon_id, NEW.business_name,
      NEW.business_category, NEW.city, NEW.area_locality, NEW.status,
      NEW.is_active, NEW.created_at
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END
$function$;

REVOKE ALL ON FUNCTION public.sync_public_business() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_public_business() TO service_role;

DROP TRIGGER IF EXISTS sync_public_business_trigger ON public.businesses;
CREATE TRIGGER sync_public_business_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.businesses
FOR EACH ROW EXECUTE FUNCTION public.sync_public_business();

-- Reviews remain public only while their salon is still present in the safe mirror.
DROP POLICY IF EXISTS "Reviews publicly viewable" ON public.reviews;
DROP POLICY IF EXISTS "Public can read reviews of active salons" ON public.reviews;
CREATE POLICY "Public can read reviews of active salons"
  ON public.reviews
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.public_salon_cards AS salon
      WHERE salon.id = reviews.salon_id
    )
  );

REVOKE ALL ON public.reviews FROM anon;
GRANT SELECT ON public.reviews TO anon;

-- Trigger functions never need to be callable through the public API.
REVOKE ALL ON FUNCTION public.prevent_membership_tier_change()
  FROM PUBLIC, anon, authenticated;
