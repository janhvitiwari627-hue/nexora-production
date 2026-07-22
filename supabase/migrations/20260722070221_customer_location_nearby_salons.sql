-- Customer location foundation for the consolidated public.shops marketplace.
-- Uses a bounded Haversine calculation because PostGIS is not enabled in this project.

CREATE INDEX IF NOT EXISTS shops_public_location_candidates_idx
  ON public.shops (latitude, longitude)
  WHERE latitude IS NOT NULL
    AND longitude IS NOT NULL
    AND is_active IS TRUE
    AND (approval_status = 'approved' OR is_published IS TRUE);

CREATE OR REPLACE FUNCTION public.nearby_public_salon_cards(
  _latitude double precision,
  _longitude double precision,
  _radius_km double precision DEFAULT 50,
  _limit integer DEFAULT 50,
  _query text DEFAULT NULL,
  _category text DEFAULT NULL,
  _gender text DEFAULT NULL
)
RETURNS TABLE (
  slug text,
  name text,
  tagline text,
  category text,
  city text,
  location text,
  cover_image_url text,
  image_url text,
  rating numeric,
  reviews_count integer,
  is_verified boolean,
  distance_km double precision
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
  WITH params AS (
    SELECT
      greatest(-90::double precision, least(coalesce(_latitude, 0), 90::double precision)) AS latitude,
      greatest(-180::double precision, least(coalesce(_longitude, 0), 180::double precision)) AS longitude,
      greatest(0.1::double precision, least(coalesce(_radius_km, 50), 250::double precision)) AS radius_km,
      greatest(1, least(coalesce(_limit, 50), 100)) AS result_limit
  ),
  bounded AS (
    SELECT
      salon.slug,
      salon.name,
      salon.tagline,
      salon.category,
      salon.city,
      salon.location,
      salon.cover_image_url,
      salon.image_url,
      salon.rating,
      salon.reviews_count,
      salon.is_verified,
      6371.0088 * pg_catalog.acos(
        least(
          1::double precision,
          greatest(
            -1::double precision,
            pg_catalog.cos(pg_catalog.radians(params.latitude))
              * pg_catalog.cos(pg_catalog.radians(salon.latitude))
              * pg_catalog.cos(pg_catalog.radians(salon.longitude) - pg_catalog.radians(params.longitude))
              + pg_catalog.sin(pg_catalog.radians(params.latitude))
              * pg_catalog.sin(pg_catalog.radians(salon.latitude))
          )
        )
      ) AS distance_km
    FROM public.public_salon_cards AS salon
    CROSS JOIN params
    WHERE salon.latitude IS NOT NULL
      AND salon.longitude IS NOT NULL
      AND salon.is_active IS TRUE
      AND salon.website_created IS TRUE
      AND salon.latitude BETWEEN
        params.latitude - (params.radius_km / 111.045)
        AND params.latitude + (params.radius_km / 111.045)
      AND salon.longitude BETWEEN
        params.longitude - (params.radius_km / (111.045 * greatest(0.01, pg_catalog.cos(pg_catalog.radians(params.latitude)))))
        AND params.longitude + (params.radius_km / (111.045 * greatest(0.01, pg_catalog.cos(pg_catalog.radians(params.latitude)))))
      AND (
        NULLIF(pg_catalog.btrim(_category), '') IS NULL
        OR _category = 'All'
        OR salon.category = _category
      )
      AND (
        NULLIF(pg_catalog.btrim(_category), '') IS NOT NULL
        OR _gender IS NULL
        OR (_gender = 'male' AND salon.category = ANY (ARRAY['Barber Shop', 'Salon', 'Spa']))
        OR (_gender = 'female' AND salon.category = ANY (ARRAY['Beauty Parlour', 'Salon', 'Spa', 'Nail Art Studio', 'Makeup Artist']))
      )
      AND (
        NULLIF(pg_catalog.btrim(_query), '') IS NULL
        OR salon.name ILIKE '%' || pg_catalog.btrim(_query) || '%'
        OR salon.category ILIKE '%' || pg_catalog.btrim(_query) || '%'
        OR salon.location ILIKE '%' || pg_catalog.btrim(_query) || '%'
        OR salon.tagline ILIKE '%' || pg_catalog.btrim(_query) || '%'
        OR salon.city ILIKE '%' || pg_catalog.btrim(_query) || '%'
      )
  )
  SELECT
    bounded.slug,
    bounded.name,
    bounded.tagline,
    bounded.category,
    bounded.city,
    bounded.location,
    bounded.cover_image_url,
    bounded.image_url,
    bounded.rating,
    bounded.reviews_count,
    bounded.is_verified,
    bounded.distance_km
  FROM bounded
  CROSS JOIN params
  WHERE bounded.distance_km <= params.radius_km
  ORDER BY bounded.distance_km ASC, bounded.rating DESC, bounded.name ASC
  LIMIT (SELECT result_limit FROM params);
$function$;

REVOKE ALL ON FUNCTION public.nearby_public_salon_cards(
  double precision,
  double precision,
  double precision,
  integer,
  text,
  text,
  text
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.nearby_public_salon_cards(
  double precision,
  double precision,
  double precision,
  integer,
  text,
  text,
  text
) TO anon, authenticated;

COMMENT ON FUNCTION public.nearby_public_salon_cards IS
  'Returns RLS-visible published salons within a radius, ordered nearest first.';

NOTIFY pgrst, 'reload schema';
