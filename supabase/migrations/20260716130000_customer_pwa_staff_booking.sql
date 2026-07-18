-- Part 3: optional staff selection for the customer PWA booking journey.
-- The existing six-argument P1 RPC remains available for older clients.

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS staff_id uuid
    REFERENCES public.staff(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS bookings_staff_id_idx
  ON public.bookings(staff_id);

CREATE OR REPLACE FUNCTION private.create_public_appointment(
  _tenant_id uuid,
  _service_id uuid,
  _appointment_date date,
  _appointment_time time,
  _customer_name text,
  _mobile text,
  _staff_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  receipt jsonb;
  selected_staff public.staff%ROWTYPE;
  booking_id uuid;
BEGIN
  IF _staff_id IS NOT NULL THEN
    SELECT staff_member.*
    INTO selected_staff
    FROM public.staff AS staff_member
    WHERE staff_member.id = _staff_id
      AND staff_member.salon_id = _tenant_id
      AND staff_member.is_active IS TRUE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'This staff member is not available for booking';
    END IF;
  END IF;

  receipt := private.create_public_appointment(
    _tenant_id,
    _service_id,
    _appointment_date,
    _appointment_time,
    _customer_name,
    _mobile
  );
  booking_id := (receipt->>'id')::uuid;

  IF _staff_id IS NOT NULL THEN
    UPDATE public.bookings
    SET staff_id = _staff_id
    WHERE id = booking_id
      AND user_id = auth.uid()
      AND salon_id = _tenant_id
      AND status = 'pending_payment';

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Staff selection could not be saved';
    END IF;
  END IF;

  RETURN receipt || jsonb_build_object(
    'staff_id', _staff_id,
    'staff_name', CASE WHEN _staff_id IS NULL THEN 'Any professional' ELSE selected_staff.name END
  );
END;
$function$;

REVOKE ALL ON FUNCTION private.create_public_appointment(
  uuid, uuid, date, time, text, text, uuid
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.create_public_appointment(
  uuid, uuid, date, time, text, text, uuid
) TO authenticated;

CREATE OR REPLACE FUNCTION public.create_public_appointment(
  _tenant_id uuid,
  _service_id uuid,
  _appointment_date date,
  _appointment_time time,
  _customer_name text,
  _mobile text,
  _staff_id uuid
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
    _mobile,
    _staff_id
  );
$function$;

REVOKE ALL ON FUNCTION public.create_public_appointment(
  uuid, uuid, date, time, text, text, uuid
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_public_appointment(
  uuid, uuid, date, time, text, text, uuid
) TO authenticated;

COMMENT ON FUNCTION public.create_public_appointment(
  uuid, uuid, date, time, text, text, uuid
) IS
  'Customer PWA appointment creation with optional validated salon staff selection.';
