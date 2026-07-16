-- P1: public customer-facing website booking MVP.
-- Payment is not captured in this phase. Every appointment remains explicitly
-- pending until a later payment workflow records the advance.

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS service_id uuid
    REFERENCES public.services(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS bookings_service_id_idx
  ON public.bookings(service_id);

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_status_check,
  ADD CONSTRAINT bookings_status_check
    CHECK (
      status IN (
        'pending_payment', 'pending', 'confirmed', 'completed',
        'cancelled', 'no_show', 'expired'
      )
    );

-- Keep the existing booking trigger rules while adding the two honest
-- pre-payment states required by P1.
CREATE OR REPLACE FUNCTION public.validate_booking()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF NEW.status NOT IN (
    'pending_payment', 'pending', 'confirmed', 'completed',
    'cancelled', 'no_show', 'expired'
  ) THEN
    RAISE EXCEPTION 'Invalid booking status: %', NEW.status;
  END IF;

  IF NEW.payment_status NOT IN (
    'advance_pending', 'pending', 'paid', 'refunded', 'failed'
  ) THEN
    RAISE EXCEPTION 'Invalid payment_status: %', NEW.payment_status;
  END IF;

  IF NEW.status = 'confirmed' AND NEW.payment_status <> 'paid' THEN
    RAISE EXCEPTION 'Cannot confirm booking before advance payment is paid';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.booking_date < CURRENT_DATE THEN
      RAISE EXCEPTION 'Booking date must not be in the past';
    END IF;
    IF NEW.booking_date > CURRENT_DATE + INTERVAL '90 days' THEN
      RAISE EXCEPTION 'Booking date must be within 90 days';
    END IF;
    IF NEW.booking_reference IS NULL THEN
      NEW.booking_reference := public.generate_booking_reference();
    END IF;
  END IF;

  IF NEW.advance_amount IS NULL THEN
    NEW.advance_amount := round(NEW.price * 0.25, 2);
  END IF;

  IF NEW.payment_status IN ('advance_pending', 'pending')
     AND NEW.payment_deadline IS NULL THEN
    NEW.payment_deadline := now() + INTERVAL '15 minutes';
  END IF;

  IF TG_OP = 'UPDATE'
     AND NEW.status = 'cancelled'
     AND OLD.status <> 'cancelled' THEN
    IF NEW.cancelled_at IS NULL THEN NEW.cancelled_at := now(); END IF;
    IF NEW.cancelled_by IS NULL THEN NEW.cancelled_by := auth.uid(); END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Transactional implementation lives outside the exposed API schema. It needs
-- definer privileges only to validate publication without granting anonymous
-- Auth users access to private salon columns. Every inserted identity is pinned
-- to auth.uid() and all price/status values are server-derived.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.create_public_appointment(
  _tenant_id uuid,
  _service_id uuid,
  _appointment_date date,
  _appointment_time time,
  _customer_name text,
  _mobile text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  caller_id uuid := auth.uid();
  selected_service public.services%ROWTYPE;
  created_booking public.bookings%ROWTYPE;
  normalized_mobile text;
  calculated_advance numeric(10,2);
BEGIN
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'A booking session is required';
  END IF;

  IF length(trim(coalesce(_customer_name, ''))) < 2
     OR length(trim(_customer_name)) > 100 THEN
    RAISE EXCEPTION 'Enter a valid customer name';
  END IF;

  normalized_mobile := regexp_replace(coalesce(_mobile, ''), '[^0-9]', '', 'g');
  IF normalized_mobile ~ '^91[6-9][0-9]{9}$' THEN
    normalized_mobile := substring(normalized_mobile FROM 3);
  END IF;
  IF normalized_mobile !~ '^[6-9][0-9]{9}$' THEN
    RAISE EXCEPTION 'Enter a valid 10-digit Indian mobile number';
  END IF;
  normalized_mobile := '+91' || normalized_mobile;

  IF _appointment_date < CURRENT_DATE
     OR _appointment_date > CURRENT_DATE + INTERVAL '90 days' THEN
    RAISE EXCEPTION 'Choose a date within the next 90 days';
  END IF;

  IF (_appointment_date + _appointment_time) <= now() THEN
    RAISE EXCEPTION 'Choose a future appointment time';
  END IF;

  SELECT service.*
  INTO selected_service
  FROM public.services AS service
  JOIN public.salons AS salon ON salon.id = service.salon_id
  WHERE service.id = _service_id
    AND service.salon_id = _tenant_id
    AND service.is_active IS TRUE
    AND service.deleted_at IS NULL
    AND salon.is_active IS TRUE
    AND salon.deleted_at IS NULL
    AND salon.website_created IS TRUE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'This service is not available for public booking';
  END IF;

  INSERT INTO public.profiles (
    id, full_name, mobile, is_active, is_verified, updated_at
  ) VALUES (
    caller_id, trim(_customer_name), normalized_mobile, true, false, now()
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      mobile = EXCLUDED.mobile,
      is_active = true,
      updated_at = now();

  calculated_advance := round(selected_service.price * 0.25, 2);

  INSERT INTO public.bookings (
    salon_id,
    service_id,
    user_id,
    service_name,
    price,
    advance_amount,
    booking_date,
    booking_time,
    status,
    payment_status
  ) VALUES (
    _tenant_id,
    selected_service.id,
    caller_id,
    selected_service.name,
    selected_service.price,
    calculated_advance,
    _appointment_date,
    _appointment_time,
    'pending_payment',
    'advance_pending'
  )
  RETURNING * INTO created_booking;

  RETURN jsonb_build_object(
    'id', created_booking.id,
    'booking_reference', created_booking.booking_reference,
    'tenant_id', created_booking.salon_id,
    'service_id', created_booking.service_id,
    'service_name', created_booking.service_name,
    'appointment_date', created_booking.booking_date,
    'appointment_time', created_booking.booking_time,
    'total', created_booking.price,
    'advance', created_booking.advance_amount,
    'remaining', created_booking.price - created_booking.advance_amount,
    'status', created_booking.status,
    'payment_status', created_booking.payment_status
  );
END;
$function$;

REVOKE ALL ON FUNCTION private.create_public_appointment(
  uuid, uuid, date, time, text, text
) FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.create_public_appointment(
  uuid, uuid, date, time, text, text
) TO authenticated;

-- Exposed wrapper has no elevated privileges of its own.
CREATE OR REPLACE FUNCTION public.create_public_appointment(
  _tenant_id uuid,
  _service_id uuid,
  _appointment_date date,
  _appointment_time time,
  _customer_name text,
  _mobile text
) RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $function$
  SELECT private.create_public_appointment(
    _tenant_id,
    _service_id,
    _appointment_date,
    _appointment_time,
    _customer_name,
    _mobile
  );
$function$;

REVOKE ALL ON FUNCTION public.create_public_appointment(
  uuid, uuid, date, time, text, text
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_public_appointment(
  uuid, uuid, date, time, text, text
) TO authenticated;

COMMENT ON FUNCTION public.create_public_appointment(
  uuid, uuid, date, time, text, text
) IS
  'P1 invoker wrapper creates an unpaid appointment through a locked private implementation.';

CREATE OR REPLACE FUNCTION public.release_expired_bookings()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  released integer;
BEGIN
  WITH updated AS (
    UPDATE public.bookings
    SET status = 'expired', updated_at = now()
    WHERE status IN ('pending_payment', 'pending')
      AND payment_status IN ('advance_pending', 'pending')
      AND payment_deadline IS NOT NULL
      AND payment_deadline < now()
    RETURNING 1
  )
  SELECT count(*) INTO released FROM updated;
  RETURN released;
END;
$function$;

REVOKE ALL ON FUNCTION public.release_expired_bookings()
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.release_expired_bookings() TO service_role;
