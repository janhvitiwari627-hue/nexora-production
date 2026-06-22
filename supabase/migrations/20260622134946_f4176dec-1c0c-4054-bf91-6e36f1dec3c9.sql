
CREATE OR REPLACE FUNCTION public.recommended_salons(_limit INT DEFAULT 10)
RETURNS TABLE (
  id UUID, name TEXT, category TEXT, rating DOUBLE PRECISION,
  reviews_count INTEGER, image_url TEXT, location TEXT,
  price_range TEXT, discount TEXT
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH me AS (SELECT auth.uid() AS uid),
  my_city AS (
    SELECT COALESCE(
      (SELECT p.city FROM public.profiles p WHERE p.id = (SELECT uid FROM me)),
      (SELECT (sh.filters ->> 'city')
         FROM public.search_history sh
        WHERE sh.user_id = (SELECT uid FROM me)
          AND sh.filters ? 'city'
        GROUP BY sh.filters ->> 'city'
        ORDER BY count(*) DESC
        LIMIT 1)
    ) AS city
  ),
  booked AS (
    SELECT DISTINCT salon_id FROM public.bookings
     WHERE user_id = (SELECT uid FROM me)
  )
  SELECT s.id, s.name, s.category, s.rating, s.reviews_count,
         s.image_url, s.location, s.price_range, s.discount
    FROM public.salons s
   WHERE s.id NOT IN (SELECT salon_id FROM booked WHERE salon_id IS NOT NULL)
     AND ((SELECT city FROM my_city) IS NULL OR s.location ILIKE '%'||(SELECT city FROM my_city)||'%')
   ORDER BY s.rating DESC NULLS LAST, s.reviews_count DESC NULLS LAST
   LIMIT _limit;
$$;
