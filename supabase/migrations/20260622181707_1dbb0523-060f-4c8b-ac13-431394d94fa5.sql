
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'customer_insights_customer_id_key'
  ) THEN
    ALTER TABLE public.customer_insights
      ADD CONSTRAINT customer_insights_customer_id_key UNIQUE (customer_id);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.recompute_customer_insights()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE affected INT;
BEGIN
  WITH cust_bookings AS (
    SELECT
      b.user_id AS customer_id,
      MAX(b.booking_date) AS last_booking_date,
      COUNT(*) AS bookings_count,
      COUNT(*) FILTER (WHERE b.status = 'cancelled') AS cancelled_count,
      COALESCE(SUM(b.price) FILTER (WHERE b.status = 'completed'), 0)::numeric(10,2) AS lifetime_value,
      EXTRACT(EPOCH FROM (MAX(b.created_at) - MIN(b.created_at))) / 86400.0 AS span_days,
      MAX(b.created_at) AS last_created
    FROM public.bookings b
    WHERE b.user_id IS NOT NULL
    GROUP BY b.user_id
  ),
  pref_services AS (
    SELECT user_id, array_agg(DISTINCT service_name) FILTER (WHERE service_name IS NOT NULL) AS services
      FROM public.bookings
     WHERE user_id IS NOT NULL
     GROUP BY user_id
  ),
  scored AS (
    SELECT
      cb.customer_id,
      cb.last_booking_date,
      cb.lifetime_value,
      CASE WHEN cb.bookings_count > 1 AND cb.span_days > 0
           THEN (cb.span_days / GREATEST(cb.bookings_count - 1, 1))::int
           ELSE NULL END AS avg_booking_frequency,
      COALESCE(ps.services, ARRAY[]::text[]) AS preferred_services,
      LEAST(1.0, GREATEST(0.0,
          (CASE
             WHEN cb.last_created < now() - INTERVAL '90 days' THEN 0.55
             WHEN cb.last_created < now() - INTERVAL '60 days' THEN 0.40
             WHEN cb.last_created < now() - INTERVAL '45 days' THEN 0.25
             WHEN cb.last_created < now() - INTERVAL '30 days' THEN 0.10
             ELSE 0.0
           END)
          + (cb.cancelled_count::numeric / GREATEST(cb.bookings_count,1)) * 0.30
          + (CASE WHEN cb.bookings_count = 1 THEN 0.15 ELSE 0.0 END)
      ))::numeric(3,2) AS churn_risk_score,
      LEAST(100, (cb.bookings_count * 8)
            + (CASE WHEN cb.last_created > now() - INTERVAL '30 days' THEN 25 ELSE 0 END)
      )::numeric AS loyalty_score
    FROM cust_bookings cb
    LEFT JOIN pref_services ps ON ps.user_id = cb.customer_id
  )
  INSERT INTO public.customer_insights (
    customer_id, last_booking_date, avg_booking_frequency, preferred_services,
    lifetime_value, churn_risk_score, loyalty_score, updated_at
  )
  SELECT customer_id, last_booking_date, avg_booking_frequency, preferred_services,
         lifetime_value, churn_risk_score, loyalty_score, now()
    FROM scored
  ON CONFLICT (customer_id) DO UPDATE SET
    last_booking_date = EXCLUDED.last_booking_date,
    avg_booking_frequency = EXCLUDED.avg_booking_frequency,
    preferred_services = EXCLUDED.preferred_services,
    lifetime_value = EXCLUDED.lifetime_value,
    churn_risk_score = EXCLUDED.churn_risk_score,
    loyalty_score = EXCLUDED.loyalty_score,
    updated_at = now();

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END $$;

REVOKE EXECUTE ON FUNCTION public.recompute_customer_insights() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.recompute_customer_insights() TO service_role;

CREATE OR REPLACE FUNCTION public.get_at_risk_customers(_salon_id UUID, _limit INT DEFAULT 50)
RETURNS TABLE(
  customer_id UUID,
  full_name TEXT,
  mobile TEXT,
  last_booking_date DATE,
  lifetime_value NUMERIC,
  churn_risk_score NUMERIC,
  preferred_services TEXT[]
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ci.customer_id, p.full_name, p.mobile, ci.last_booking_date,
         ci.lifetime_value, ci.churn_risk_score, ci.preferred_services
    FROM public.customer_insights ci
    JOIN public.profiles p ON p.id = ci.customer_id
   WHERE ci.churn_risk_score >= 0.5
     AND (
       _salon_id IS NULL
       OR EXISTS (
         SELECT 1 FROM public.bookings b
          WHERE b.user_id = ci.customer_id AND b.salon_id = _salon_id
       )
     )
     AND (
       _salon_id IS NULL AND public.has_role(auth.uid(), 'admin'::app_role)
       OR (_salon_id IS NOT NULL AND (
            public.is_salon_owner(auth.uid(), _salon_id)
            OR public.has_role(auth.uid(), 'admin'::app_role)
          ))
     )
   ORDER BY ci.churn_risk_score DESC, ci.lifetime_value DESC
   LIMIT _limit;
$$;

REVOKE EXECUTE ON FUNCTION public.get_at_risk_customers(UUID, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_at_risk_customers(UUID, INT) TO authenticated, service_role;
