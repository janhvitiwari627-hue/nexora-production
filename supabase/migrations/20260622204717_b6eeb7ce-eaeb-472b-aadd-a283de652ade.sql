-- ============================================================
-- Phase 8: Performance indexes + salon_stats MV + grant lockdown
-- ============================================================

-- 1) Hot-path indexes
CREATE INDEX IF NOT EXISTS idx_bookings_salon_date_status
  ON public.bookings (salon_id, booking_date, status);

CREATE INDEX IF NOT EXISTS idx_bookings_user_created
  ON public.bookings (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_customer_created
  ON public.payments (customer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_booking
  ON public.payments (booking_id);

CREATE INDEX IF NOT EXISTS idx_reviews_salon_rating
  ON public.reviews (salon_id, rating DESC);

-- 2) salon_stats materialized view (refreshed nightly via pg_cron)
DROP MATERIALIZED VIEW IF EXISTS public.salon_stats;

CREATE MATERIALIZED VIEW public.salon_stats AS
SELECT
  s.id              AS salon_id,
  s.name,
  s.city,
  COUNT(DISTINCT b.id)                                          AS total_bookings,
  COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'completed')    AS completed_bookings,
  COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'cancelled')    AS cancelled_bookings,
  COALESCE(AVG(r.rating), 0)::numeric(3,2)                      AS avg_rating,
  COUNT(DISTINCT r.id)                                          AS total_reviews,
  COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'SUCCESS'), 0)::numeric(12,2) AS total_revenue,
  COUNT(DISTINCT b.user_id)                                     AS unique_customers,
  now()                                                         AS refreshed_at
FROM public.salons s
LEFT JOIN public.bookings b ON b.salon_id = s.id
LEFT JOIN public.reviews  r ON r.salon_id = s.id
LEFT JOIN public.payments p ON p.booking_id = b.id
GROUP BY s.id, s.name, s.city;

CREATE UNIQUE INDEX idx_salon_stats_salon_id ON public.salon_stats (salon_id);

-- Refresh function (SECURITY DEFINER so cron-hook role can invoke)
CREATE OR REPLACE FUNCTION public.refresh_salon_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.salon_stats;
END;
$$;

-- 3) Lock down grants — these functions are called by cron/hooks, not end users
REVOKE ALL ON FUNCTION public.refresh_salon_stats()             FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recompute_nexora_scores()         FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recompute_customer_insights()     FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_expired_bookings()        FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.auto_release_escrow()             FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.process_pending_settlements()     FROM PUBLIC, anon, authenticated;

-- service_role retains EXECUTE implicitly via SECURITY DEFINER + ownership; grant explicitly for clarity
GRANT EXECUTE ON FUNCTION public.refresh_salon_stats()           TO service_role;
GRANT EXECUTE ON FUNCTION public.recompute_nexora_scores()       TO service_role;
GRANT EXECUTE ON FUNCTION public.recompute_customer_insights()   TO service_role;
GRANT EXECUTE ON FUNCTION public.release_expired_bookings()      TO service_role;
GRANT EXECUTE ON FUNCTION public.auto_release_escrow()           TO service_role;
GRANT EXECUTE ON FUNCTION public.process_pending_settlements()   TO service_role;

-- Allow public reads on the materialized view (it contains only aggregate/public salon info)
GRANT SELECT ON public.salon_stats TO anon, authenticated;
GRANT ALL    ON public.salon_stats TO service_role;
