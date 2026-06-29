CREATE OR REPLACE FUNCTION public.validate_booking()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status NOT IN ('pending','confirmed','completed','cancelled','no_show') THEN
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
$function$;