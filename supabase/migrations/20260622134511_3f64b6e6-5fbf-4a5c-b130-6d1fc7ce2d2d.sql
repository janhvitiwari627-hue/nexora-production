
-- Columns
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS booking_reference TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Reference generator
CREATE OR REPLACE FUNCTION public.generate_booking_reference()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  code TEXT;
  exists_already BOOLEAN;
  alphabet TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i INT;
  suffix TEXT;
BEGIN
  LOOP
    suffix := '';
    FOR i IN 1..6 LOOP
      suffix := suffix || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    END LOOP;
    code := 'NX-' || to_char(now(),'YYMM') || '-' || suffix;
    SELECT EXISTS (SELECT 1 FROM public.bookings WHERE booking_reference = code) INTO exists_already;
    IF NOT exists_already THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$;

-- Backfill existing rows
UPDATE public.bookings
   SET booking_reference = public.generate_booking_reference()
 WHERE booking_reference IS NULL;

-- Enforce uniqueness + non-null going forward
ALTER TABLE public.bookings
  ALTER COLUMN booking_reference SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS bookings_booking_reference_key
  ON public.bookings(booking_reference);

-- Update validate_booking trigger to (1) auto-assign reference on insert,
-- (2) capture cancelled_by/reason on status change
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
    IF NEW.booking_reference IS NULL THEN
      NEW.booking_reference := public.generate_booking_reference();
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
     AND OLD.status <> 'cancelled' THEN
    IF NEW.cancelled_at IS NULL THEN
      NEW.cancelled_at := now();
    END IF;
    IF NEW.cancelled_by IS NULL THEN
      NEW.cancelled_by := auth.uid();
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
