-- Add search_vector to salons table for public discovery search
-- This enables full-text search on the public_salon_cards view

ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create gin index for fast full-text search
CREATE INDEX IF NOT EXISTS salons_search_vector_idx
  ON public.salons USING gin (search_vector);

-- Update the search_vector column for existing rows
UPDATE public.salons SET search_vector =
  setweight(to_tsvector('simple', coalesce(name,'')), 'A') ||
  setweight(to_tsvector('simple', coalesce(tagline,'')), 'B') ||
  setweight(to_tsvector('simple', coalesce(category,'')), 'B') ||
  setweight(to_tsvector('simple', coalesce(description,'')), 'C') ||
  setweight(to_tsvector('simple', coalesce(location,'')), 'C') ||
  setweight(to_tsvector('simple', coalesce(city,'')), 'C')
WHERE search_vector IS NULL;

-- Create trigger to auto-update search_vector on insert/update
CREATE OR REPLACE FUNCTION public.update_salon_search_vector()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.name,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.tagline,'')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.category,'')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.description,'')), 'C') ||
    setweight(to_tsvector('simple', coalesce(NEW.location,'')), 'C') ||
    setweight(to_tsvector('simple', coalesce(NEW.city,'')), 'C');
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_salons_search_vector ON public.salons;
CREATE TRIGGER trg_salons_search_vector
  BEFORE INSERT OR UPDATE ON public.salons
  FOR EACH ROW EXECUTE FUNCTION public.update_salon_search_vector();

-- Recreate the public_salon_cards view to include search_vector
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
  s.search_vector,
  CASE WHEN s.show_public_contact THEN COALESCE(s.business_public_phone, s.phone) END AS phone,
  CASE WHEN s.show_public_contact THEN COALESCE(s.business_public_whatsapp, s.whatsapp) END AS whatsapp
FROM public.salons s
WHERE s.is_active = true;

GRANT SELECT ON public.public_salon_cards TO anon, authenticated;

-- Public salon search function using public_salon_cards view
CREATE OR REPLACE FUNCTION public.public_salons_search(
  _q text DEFAULT NULL,
  _category text DEFAULT NULL,
  _limit int DEFAULT 50
) RETURNS TABLE (
  id uuid,
  slug text,
  name text,
  tagline text,
  category text,
  city text,
  area text,
  cover_image text,
  rating double precision,
  review_count int,
  price_level text,
  is_verified boolean,
  rank real
) LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT
    s.id,
    s.slug,
    s.name,
    s.tagline,
    s.category,
    s.city,
    s.location AS area,
    s.cover_image_url AS cover_image,
    s.rating,
    s.reviews_count AS review_count,
    s.price_range AS price_level,
    s.is_verified,
    CASE
      WHEN _q IS NULL OR _q = '' THEN 0
      ELSE ts_rank(s.search_vector, websearch_to_tsquery('simple', _q))
    END AS rank
  FROM public.public_salon_cards s
 WHERE (_category IS NULL OR s.category = _category)
   AND (
     _q IS NULL OR _q = ''
     OR s.search_vector @@ websearch_to_tsquery('simple', _q)
     OR s.name ILIKE '%' || _q || '%'
   )
 ORDER BY rank DESC, s.rating DESC NULLS LAST
 LIMIT _limit;
$$;

GRANT EXECUTE ON FUNCTION public.public_salons_search(text, text, int) TO anon, authenticated;
