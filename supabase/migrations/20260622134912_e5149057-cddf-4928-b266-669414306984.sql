
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  results_count INTEGER NOT NULL DEFAULT 0,
  clicked_salon_id UUID REFERENCES public.salons(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.search_history TO authenticated;
GRANT ALL ON public.search_history TO service_role;

ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own search history"
  ON public.search_history FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own search history"
  ON public.search_history FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_search_history_user_created
  ON public.search_history(user_id, created_at DESC);

-- Recommendations RPC: top salons in user's city, excluding ones they've booked
CREATE OR REPLACE FUNCTION public.recommended_salons(_limit INT DEFAULT 10)
RETURNS TABLE (
  id UUID, name TEXT, category TEXT, rating DOUBLE PRECISION,
  reviews_count INTEGER, image_url TEXT, location TEXT,
  price_range TEXT, discount TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH me AS (
    SELECT auth.uid() AS uid
  ),
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

REVOKE ALL ON FUNCTION public.recommended_salons(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.recommended_salons(INT) TO authenticated;
