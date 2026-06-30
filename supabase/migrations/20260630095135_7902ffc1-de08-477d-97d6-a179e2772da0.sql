
-- 1. Salons: hide sensitive columns from anon (keep phone/whatsapp public for booking sites)
REVOKE SELECT (upi_id, email, owner_name) ON public.salons FROM anon;
REVOKE SELECT (upi_id, email, owner_name) ON public.salons FROM authenticated;
-- Re-grant sensitive columns only to authenticated owners via the existing policies (they can read all cols of their salon via separate path)
-- Owners read their salon's full row through is_salon_owner check on a dedicated select policy:
DROP POLICY IF EXISTS "Owners read full salon" ON public.salons;
CREATE POLICY "Owners read full salon" ON public.salons
  FOR SELECT TO authenticated
  USING (is_salon_owner(auth.uid(), id) OR has_role(auth.uid(),'admin'::app_role));
GRANT SELECT (upi_id, email, owner_name) ON public.salons TO authenticated;

-- 2. Bump booking advance window 30 -> 90 days
CREATE OR REPLACE FUNCTION public.validate_booking()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status NOT IN ('pending','confirmed','completed','cancelled','no_show','expired') THEN
    RAISE EXCEPTION 'Invalid booking status: %', NEW.status;
  END IF;
  IF NEW.payment_status NOT IN ('pending','paid','refunded','failed') THEN
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
  IF NEW.payment_status = 'pending' AND NEW.payment_deadline IS NULL THEN
    NEW.payment_deadline := now() + INTERVAL '15 minutes';
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN
    IF NEW.cancelled_at IS NULL THEN NEW.cancelled_at := now(); END IF;
    IF NEW.cancelled_by IS NULL THEN NEW.cancelled_by := auth.uid(); END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- 3. Operational tables: audit_events, system_settings, notification_queue
CREATE TABLE IF NOT EXISTS public.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_events TO authenticated;
GRANT ALL ON public.audit_events TO service_role;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read audit" ON public.audit_events FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role));
CREATE INDEX IF NOT EXISTS idx_audit_events_actor ON public.audit_events(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_entity ON public.audit_events(entity_type, entity_id);

CREATE TABLE IF NOT EXISTS public.system_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.system_settings TO authenticated, anon;
GRANT ALL ON public.system_settings TO service_role;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Admins write settings" ON public.system_settings FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));

INSERT INTO public.system_settings(key,value,description) VALUES
  ('booking.slot_buffer_minutes','0'::jsonb,'Buffer between consecutive booking slots'),
  ('booking.max_advance_days','90'::jsonb,'Max days in advance a booking can be made'),
  ('booking.min_cancellation_hours','24'::jsonb,'Hours before slot for full refund'),
  ('settlement.daily_run_hour_ist','22'::jsonb,'IST hour for daily wallet settlement')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.notification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('email','sms','whatsapp','push','inapp')),
  template_key text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sending','sent','failed')),
  attempts int NOT NULL DEFAULT 0,
  last_error text,
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.notification_queue TO service_role;
GRANT SELECT ON public.notification_queue TO authenticated;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own queue" ON public.notification_queue FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(),'admin'::app_role));
CREATE INDEX IF NOT EXISTS idx_notif_queue_status ON public.notification_queue(status, scheduled_at);
