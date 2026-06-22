
ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS nexora_score INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rank_in_city INTEGER;

CREATE INDEX IF NOT EXISTS idx_salons_city_nexora
  ON public.salons(location, nexora_score DESC);

CREATE OR REPLACE FUNCTION public.recompute_nexora_scores()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE updated_count INT;
BEGIN
  WITH stats AS (
    SELECT
      s.id,
      s.location,
      COALESCE(s.rating, 0) AS rating,
      -- monthly booking count (cap 100)
      LEAST(
        (SELECT count(*) FROM public.bookings b
          WHERE b.salon_id = s.id
            AND b.created_at >= now() - INTERVAL '30 days'),
        100
      )::numeric / 100.0 AS booking_norm,
      -- repeat-customer ratio
      COALESCE((
        SELECT (count(*) FILTER (WHERE c > 1))::numeric
             / NULLIF(count(*), 0)
          FROM (
            SELECT b.user_id, count(*) AS c
              FROM public.bookings b
             WHERE b.salon_id = s.id
             GROUP BY b.user_id
          ) t
      ), 0) AS retention,
      -- recency (1.0 if booked today, 0 if >30 days)
      GREATEST(
        0,
        1.0 - (EXTRACT(EPOCH FROM (now() - COALESCE(
          (SELECT max(b.created_at) FROM public.bookings b WHERE b.salon_id = s.id),
          now() - INTERVAL '999 days'
        ))) / 86400.0) / 30.0
      ) AS recency
    FROM public.salons s
  ),
  scored AS (
    SELECT id, location,
           ROUND(
             (rating / 5.0) * 40
             + booking_norm * 30
             + retention   * 20
             + recency     * 10
           )::int AS score
      FROM stats
  ),
  ranked AS (
    SELECT id, score,
           ROW_NUMBER() OVER (PARTITION BY location ORDER BY score DESC, id) AS rnk
      FROM scored
  ),
  upd AS (
    UPDATE public.salons s
       SET nexora_score = r.score,
           rank_in_city = r.rnk
      FROM ranked r
     WHERE s.id = r.id
       AND (s.nexora_score IS DISTINCT FROM r.score
         OR s.rank_in_city IS DISTINCT FROM r.rnk)
     RETURNING 1
  )
  SELECT count(*) INTO updated_count FROM upd;
  RETURN updated_count;
END;
$$;

REVOKE ALL ON FUNCTION public.recompute_nexora_scores() FROM PUBLIC;

-- Initial run
SELECT public.recompute_nexora_scores();

-- Schedule hourly recompute (SQL-only, no external endpoint needed)
SELECT cron.schedule(
  'recompute-nexora-scores-hourly',
  '0 * * * *',
  $cron$ SELECT public.recompute_nexora_scores(); $cron$
);
