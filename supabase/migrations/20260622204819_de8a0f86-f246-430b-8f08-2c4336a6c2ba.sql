CREATE SCHEMA IF NOT EXISTS internal;
GRANT USAGE ON SCHEMA internal TO service_role;

DROP MATERIALIZED VIEW IF EXISTS public.salon_stats;

CREATE MATERIALIZED VIEW internal.salon_stats AS
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
LEFT JOIN public.bookings  b ON b.salon_id = s.id
LEFT JOIN public.reviews   r ON r.salon_id = s.id
LEFT JOIN public.payments  p ON p.booking_id = b.id
GROUP BY s.id, s.name, s.city;

CREATE UNIQUE INDEX idx_internal_salon_stats_salon_id ON internal.salon_stats (salon_id);

CREATE OR REPLACE FUNCTION public.refresh_salon_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'internal'
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY internal.salon_stats;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_salon_stats() FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.refresh_salon_stats() TO service_role;
