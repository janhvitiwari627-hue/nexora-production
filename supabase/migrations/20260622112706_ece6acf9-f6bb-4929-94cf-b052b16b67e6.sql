-- ============ BOOKING BUSINESS LOGIC ============

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS advance_amount numeric(10,2),
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_deadline timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS refund_status text;

CREATE OR REPLACE FUNCTION public.validate_booking()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('pending','confirmed','completed','cancelled','expired') THEN
    RAISE EXCEPTION 'Invalid booking status: %', NEW.status;
  END IF;
  IF NEW.payment_status NOT IN ('pending','paid','refunded','failed') THEN
    RAISE EXCEPTION 'Invalid payment_status: %', NEW.payment_status;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.booking_date < CURRENT_DATE THEN
      RAISE EXCEPTION 'Booking date must not be in the past';
    END IF;
    IF NEW.booking_date > CURRENT_DATE + INTERVAL '30 days' THEN
      RAISE EXCEPTION 'Booking date must be within 30 days';
    END IF;
  END IF;

  IF NEW.advance_amount IS NULL THEN
    NEW.advance_amount := round(NEW.price * 0.25, 2);
  END IF;

  IF NEW.payment_status = 'pending' AND NEW.payment_deadline IS NULL THEN
    NEW.payment_deadline := now() + INTERVAL '15 minutes';
  END IF;

  IF TG_OP = 'UPDATE'
     AND NEW.status = 'cancelled'
     AND OLD.status <> 'cancelled'
     AND NEW.cancelled_at IS NULL THEN
    NEW.cancelled_at := now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_booking ON public.bookings;
CREATE TRIGGER trg_validate_booking
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.validate_booking();

-- Double-booking prevention: only active bookings occupy a slot
CREATE UNIQUE INDEX IF NOT EXISTS bookings_slot_unique
  ON public.bookings (salon_id, booking_date, booking_time)
  WHERE status NOT IN ('cancelled','expired');

-- Auto-release helper for the 15-min unpaid window
CREATE OR REPLACE FUNCTION public.release_expired_bookings()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE released int;
BEGIN
  WITH updated AS (
    UPDATE public.bookings
       SET status = 'expired'
     WHERE status = 'pending'
       AND payment_status = 'pending'
       AND payment_deadline IS NOT NULL
       AND payment_deadline < now()
     RETURNING 1
  )
  SELECT count(*) INTO released FROM updated;
  RETURN released;
END;
$$;

GRANT EXECUTE ON FUNCTION public.release_expired_bookings() TO service_role;

-- ============ LOCATION + NEARBY ============

ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;

CREATE INDEX IF NOT EXISTS salons_geo_idx ON public.salons (latitude, longitude);

CREATE OR REPLACE FUNCTION public.nearby_salons(
  _lat double precision,
  _lng double precision,
  _radius_km double precision DEFAULT 10,
  _limit int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  name text,
  category text,
  rating double precision,
  reviews_count int,
  image_url text,
  location text,
  price_range text,
  discount text,
  latitude double precision,
  longitude double precision,
  distance_km double precision
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id, s.name, s.category, s.rating, s.reviews_count, s.image_url,
         s.location, s.price_range, s.discount, s.latitude, s.longitude,
         (6371 * acos(
            cos(radians(_lat)) * cos(radians(s.latitude)) *
            cos(radians(s.longitude) - radians(_lng)) +
            sin(radians(_lat)) * sin(radians(s.latitude))
         )) AS distance_km
    FROM public.salons s
   WHERE s.latitude IS NOT NULL
     AND s.longitude IS NOT NULL
     AND (6371 * acos(
            cos(radians(_lat)) * cos(radians(s.latitude)) *
            cos(radians(s.longitude) - radians(_lng)) +
            sin(radians(_lat)) * sin(radians(s.latitude))
         )) <= _radius_km
   ORDER BY distance_km ASC
   LIMIT _limit;
$$;

GRANT EXECUTE ON FUNCTION public.nearby_salons(double precision, double precision, double precision, int)
  TO anon, authenticated;