-- Nexora SalonOS final blueprint: additive production completion.
-- No table or user data is deleted by this migration.

CREATE TABLE IF NOT EXISTS public.booking_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES auth.users(id),
  salon_id uuid NOT NULL REFERENCES public.salons(id),
  changed_by uuid REFERENCES auth.users(id),
  previous_status text,
  new_status text NOT NULL,
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS booking_status_history_booking_created_idx ON public.booking_status_history(booking_id, created_at DESC);
CREATE INDEX IF NOT EXISTS booking_status_history_customer_idx ON public.booking_status_history(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS booking_status_history_salon_idx ON public.booking_status_history(salon_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.staff_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  starts_at time NOT NULL,
  ends_at time NOT NULL,
  slot_minutes integer NOT NULL DEFAULT 30 CHECK (slot_minutes BETWEEN 5 AND 480),
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (starts_at < ends_at),
  UNIQUE(staff_id, weekday, starts_at, ends_at)
);
CREATE INDEX IF NOT EXISTS staff_availability_salon_day_idx ON public.staff_availability(salon_id, weekday, starts_at);

CREATE TABLE IF NOT EXISTS public.staff_time_off (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  reason text,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (starts_at < ends_at)
);
CREATE INDEX IF NOT EXISTS staff_time_off_staff_range_idx ON public.staff_time_off(staff_id, starts_at, ends_at);

CREATE TABLE IF NOT EXISTS public.review_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id),
  body text NOT NULL CHECK (char_length(trim(body)) BETWEEN 1 AND 2000),
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS review_replies_review_created_idx ON public.review_replies(review_id, created_at);

CREATE TABLE IF NOT EXISTS public.review_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES auth.users(id),
  salon_id uuid NOT NULL REFERENCES public.salons(id),
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewing','resolved','rejected')),
  resolved_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(review_id, reporter_id)
);

CREATE TABLE IF NOT EXISTS public.payment_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL REFERENCES public.payments(id),
  booking_id uuid REFERENCES public.bookings(id),
  customer_id uuid NOT NULL REFERENCES auth.users(id),
  salon_id uuid NOT NULL REFERENCES public.salons(id),
  event_type text NOT NULL,
  amount numeric(14,2) NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL,
  gateway_reference text,
  idempotency_key text NOT NULL UNIQUE,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS payment_ledger_customer_idx ON public.payment_ledger(customer_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS payment_ledger_salon_idx ON public.payment_ledger(salon_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS payment_ledger_payment_idx ON public.payment_ledger(payment_id, occurred_at);

CREATE TABLE IF NOT EXISTS public.wallet_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES public.salon_wallets(id),
  salon_id uuid NOT NULL REFERENCES public.salons(id),
  user_id uuid REFERENCES auth.users(id),
  payment_id uuid REFERENCES public.payments(id),
  booking_id uuid REFERENCES public.bookings(id),
  entry_type text NOT NULL CHECK (entry_type IN ('credit','debit','hold','release','refund','commission','withdrawal','adjustment')),
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  balance_after numeric(14,2),
  idempotency_key text NOT NULL UNIQUE,
  description text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS wallet_ledger_wallet_idx ON public.wallet_ledger(wallet_id, created_at DESC);
CREATE INDEX IF NOT EXISTS wallet_ledger_salon_idx ON public.wallet_ledger(salon_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.wallet_settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES public.salon_wallets(id),
  salon_id uuid NOT NULL REFERENCES public.salons(id),
  requested_by uuid NOT NULL REFERENCES auth.users(id),
  processed_by uuid REFERENCES auth.users(id),
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  fee_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (fee_amount >= 0),
  net_amount numeric(14,2) GENERATED ALWAYS AS (amount - fee_amount) STORED,
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','approved','processing','paid','failed','cancelled')),
  payout_reference text,
  failure_reason text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS wallet_settlements_salon_idx ON public.wallet_settlements(salon_id, requested_at DESC);

CREATE TABLE IF NOT EXISTS public.reward_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES auth.users(id),
  booking_id uuid REFERENCES public.bookings(id),
  payment_id uuid REFERENCES public.payments(id),
  referral_attribution_id uuid,
  entry_type text NOT NULL CHECK (entry_type IN ('earn','redeem','expire','reverse','adjustment')),
  points integer NOT NULL CHECK (points > 0),
  balance_after integer,
  idempotency_key text NOT NULL UNIQUE,
  expires_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reward_transactions_customer_idx ON public.reward_transactions(customer_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.referral_attributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id uuid NOT NULL REFERENCES auth.users(id),
  referred_user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id),
  referral_code text NOT NULL,
  referrer_name text,
  source text NOT NULL DEFAULT 'signup',
  status text NOT NULL DEFAULT 'attributed' CHECK (status IN ('attributed','qualified','rewarded','rejected')),
  validated_at timestamptz NOT NULL DEFAULT now(),
  qualified_at timestamptz,
  rewarded_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CHECK (referrer_user_id <> referred_user_id)
);
CREATE INDEX IF NOT EXISTS referral_attributions_referrer_idx ON public.referral_attributions(referrer_user_id, validated_at DESC);
ALTER TABLE public.reward_transactions
  ADD CONSTRAINT reward_transactions_referral_attribution_fkey
  FOREIGN KEY (referral_attribution_id) REFERENCES public.referral_attributions(id);

CREATE TABLE IF NOT EXISTS public.referral_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attribution_id uuid NOT NULL REFERENCES public.referral_attributions(id),
  beneficiary_user_id uuid NOT NULL REFERENCES auth.users(id),
  booking_id uuid REFERENCES public.bookings(id),
  transaction_type text NOT NULL CHECK (transaction_type IN ('qualification','reward','reversal','adjustment')),
  amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  points integer NOT NULL DEFAULT 0 CHECK (points >= 0),
  idempotency_key text NOT NULL UNIQUE,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS referral_transactions_user_idx ON public.referral_transactions(beneficiary_user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.notification_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid REFERENCES public.notifications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  channel text NOT NULL CHECK (channel IN ('in_app','email','whatsapp','push')),
  provider text,
  provider_message_id text,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sending','sent','delivered','failed','read')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error text,
  queued_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS notification_deliveries_user_idx ON public.notification_deliveries(user_id, queued_at DESC);
CREATE INDEX IF NOT EXISTS notification_deliveries_status_idx ON public.notification_deliveries(status, queued_at);

-- Every new exposed table is explicitly granted and protected with RLS.
GRANT SELECT ON public.booking_status_history, public.payment_ledger, public.wallet_ledger,
  public.wallet_settlements, public.reward_transactions, public.referral_attributions,
  public.referral_transactions, public.notification_deliveries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_availability, public.staff_time_off,
  public.review_replies, public.review_reports TO authenticated;
GRANT INSERT ON public.wallet_settlements, public.review_reports TO authenticated;
GRANT ALL ON public.booking_status_history, public.staff_availability, public.staff_time_off,
  public.review_replies, public.review_reports, public.payment_ledger, public.wallet_ledger,
  public.wallet_settlements, public.reward_transactions, public.referral_attributions,
  public.referral_transactions, public.notification_deliveries TO service_role;

ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers read own booking history" ON public.booking_status_history FOR SELECT TO authenticated USING ((select auth.uid()) = customer_id);
CREATE POLICY "Owners read salon booking history" ON public.booking_status_history FOR SELECT TO authenticated USING (public.is_salon_owner((select auth.uid()), salon_id));
CREATE POLICY "Admins read booking history" ON public.booking_status_history FOR SELECT TO authenticated USING (public.is_super_admin((select auth.uid())));

CREATE POLICY "Public reads available staff schedule" ON public.staff_availability FOR SELECT TO anon, authenticated USING (is_available);
GRANT SELECT ON public.staff_availability TO anon;
CREATE POLICY "Owners manage staff availability" ON public.staff_availability FOR ALL TO authenticated USING (public.is_salon_owner((select auth.uid()), salon_id)) WITH CHECK (public.is_salon_owner((select auth.uid()), salon_id));
CREATE POLICY "Owners manage staff time off" ON public.staff_time_off FOR ALL TO authenticated USING (public.is_salon_owner((select auth.uid()), salon_id)) WITH CHECK (public.is_salon_owner((select auth.uid()), salon_id) AND created_by = (select auth.uid()));

CREATE POLICY "Public reads review replies" ON public.review_replies FOR SELECT TO anon, authenticated USING (is_public);
GRANT SELECT ON public.review_replies TO anon;
CREATE POLICY "Owners manage review replies" ON public.review_replies FOR ALL TO authenticated USING (public.is_salon_owner((select auth.uid()), salon_id)) WITH CHECK (public.is_salon_owner((select auth.uid()), salon_id) AND author_id = (select auth.uid()));
CREATE POLICY "Users create review reports" ON public.review_reports FOR INSERT TO authenticated WITH CHECK (reporter_id = (select auth.uid()));
CREATE POLICY "Users read own review reports" ON public.review_reports FOR SELECT TO authenticated USING (reporter_id = (select auth.uid()));
CREATE POLICY "Admins manage review reports" ON public.review_reports FOR ALL TO authenticated USING (public.is_super_admin((select auth.uid()))) WITH CHECK (public.is_super_admin((select auth.uid())));

CREATE POLICY "Customers read payment ledger" ON public.payment_ledger FOR SELECT TO authenticated USING (customer_id = (select auth.uid()));
CREATE POLICY "Owners read payment ledger" ON public.payment_ledger FOR SELECT TO authenticated USING (public.is_salon_owner((select auth.uid()), salon_id));
CREATE POLICY "Admins read payment ledger" ON public.payment_ledger FOR SELECT TO authenticated USING (public.is_super_admin((select auth.uid())));
CREATE POLICY "Owners read wallet ledger" ON public.wallet_ledger FOR SELECT TO authenticated USING (public.is_salon_owner((select auth.uid()), salon_id));
CREATE POLICY "Admins read wallet ledger" ON public.wallet_ledger FOR SELECT TO authenticated USING (public.is_super_admin((select auth.uid())));
CREATE POLICY "Owners read settlements" ON public.wallet_settlements FOR SELECT TO authenticated USING (public.is_salon_owner((select auth.uid()), salon_id));
CREATE POLICY "Owners request settlements" ON public.wallet_settlements FOR INSERT TO authenticated WITH CHECK (requested_by = (select auth.uid()) AND public.is_salon_owner((select auth.uid()), salon_id));
CREATE POLICY "Admins manage settlements" ON public.wallet_settlements FOR ALL TO authenticated USING (public.is_super_admin((select auth.uid()))) WITH CHECK (public.is_super_admin((select auth.uid())));
CREATE POLICY "Customers read reward transactions" ON public.reward_transactions FOR SELECT TO authenticated USING (customer_id = (select auth.uid()));
CREATE POLICY "Admins read reward transactions" ON public.reward_transactions FOR SELECT TO authenticated USING (public.is_super_admin((select auth.uid())));

CREATE POLICY "Users read own referral attribution" ON public.referral_attributions FOR SELECT TO authenticated
  USING ((select auth.uid()) IN (referrer_user_id, referred_user_id));
CREATE POLICY "Admins read referral attributions" ON public.referral_attributions FOR SELECT TO authenticated USING (public.is_super_admin((select auth.uid())));
CREATE POLICY "Users read own referral transactions" ON public.referral_transactions FOR SELECT TO authenticated USING (beneficiary_user_id = (select auth.uid()));
CREATE POLICY "Admins read referral transactions" ON public.referral_transactions FOR SELECT TO authenticated USING (public.is_super_admin((select auth.uid())));
CREATE POLICY "Users read own notification deliveries" ON public.notification_deliveries FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
CREATE POLICY "Admins read notification deliveries" ON public.notification_deliveries FOR SELECT TO authenticated USING (public.is_super_admin((select auth.uid())));

CREATE OR REPLACE FUNCTION public.prevent_ledger_mutation()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  RAISE EXCEPTION 'Ledger rows are immutable';
END
$$;
REVOKE ALL ON FUNCTION public.prevent_ledger_mutation() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER payment_ledger_immutable BEFORE UPDATE OR DELETE ON public.payment_ledger FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();
CREATE TRIGGER wallet_ledger_immutable BEFORE UPDATE OR DELETE ON public.wallet_ledger FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();
CREATE TRIGGER reward_transactions_immutable BEFORE UPDATE OR DELETE ON public.reward_transactions FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();
CREATE TRIGGER referral_attributions_immutable BEFORE UPDATE OR DELETE ON public.referral_attributions FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();
CREATE TRIGGER referral_transactions_immutable BEFORE UPDATE OR DELETE ON public.referral_transactions FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();
CREATE TRIGGER booking_status_history_immutable BEFORE UPDATE OR DELETE ON public.booking_status_history FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();

CREATE OR REPLACE FUNCTION public.record_booking_status_history()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.booking_status_history(booking_id, customer_id, salon_id, changed_by, previous_status, new_status, reason)
    VALUES (NEW.id, NEW.user_id, NEW.salon_id, auth.uid(), CASE WHEN TG_OP='UPDATE' THEN OLD.status::text END, NEW.status::text, NEW.cancellation_reason);
  END IF;
  RETURN NEW;
END
$$;
REVOKE ALL ON FUNCTION public.record_booking_status_history() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER record_booking_status_history_trigger AFTER INSERT OR UPDATE OF status ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.record_booking_status_history();

CREATE OR REPLACE FUNCTION public.record_payment_ledger()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.payment_ledger(payment_id, booking_id, customer_id, salon_id, event_type, amount, currency, status, gateway_reference, idempotency_key, metadata, occurred_at)
    VALUES (NEW.id, NEW.booking_id, NEW.customer_id, NEW.salon_id,
      CASE WHEN TG_OP='INSERT' THEN 'created' ELSE 'status_changed' END,
      NEW.amount, NEW.currency, NEW.status::text, COALESCE(NEW.razorpay_payment_id, NEW.transaction_id),
      NEW.id::text || ':' || NEW.status::text,
      jsonb_build_object('payment_type',NEW.payment_type,'payment_method',NEW.payment_method),
      COALESCE(NEW.processed_at, now()))
    ON CONFLICT (idempotency_key) DO NOTHING;
  END IF;
  RETURN NEW;
END
$$;
REVOKE ALL ON FUNCTION public.record_payment_ledger() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER record_payment_ledger_trigger AFTER INSERT OR UPDATE OF status ON public.payments FOR EACH ROW EXECUTE FUNCTION public.record_payment_ledger();

-- Signup attribution is validated from the authoritative profile code and stored once.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $$
DECLARE
  new_referral_code text;
  new_nexora_id text;
  assigned_role public.app_role;
  role_text text;
  gender_text text;
  ref_code text;
  ref_user_id uuid;
  referrer_display_name text;
BEGIN
  new_referral_code := public.generate_referral_code();
  new_nexora_id := 'NX' || to_char(now(), 'YYMMDD') || upper(substr(replace(gen_random_uuid()::text,'-',''),1,6));
  role_text := NEW.raw_user_meta_data ->> 'role';
  assigned_role := CASE WHEN role_text IN ('customer','owner','shop_owner','growth_partner','district_partner','distributor','brand')
    THEN role_text::public.app_role ELSE 'customer'::public.app_role END;
  gender_text := lower(NULLIF(trim(NEW.raw_user_meta_data ->> 'gender'),''));
  IF gender_text NOT IN ('male','female') THEN gender_text := NULL; END IF;
  ref_code := upper(NULLIF(trim(NEW.raw_user_meta_data ->> 'referred_by'),''));
  IF ref_code IS NOT NULL THEN
    SELECT id, full_name INTO ref_user_id, referrer_display_name
    FROM public.profiles WHERE upper(referral_code)=ref_code AND id <> NEW.id AND is_active IS TRUE LIMIT 1;
  END IF;
  INSERT INTO public.profiles(id,full_name,email,mobile,gender,referral_code,referred_by,referred_by_user_id,nexora_id)
  VALUES (NEW.id,NULLIF(trim(NEW.raw_user_meta_data->>'full_name'),''),NEW.email,
    NULLIF(trim(NEW.raw_user_meta_data->>'mobile'),''),gender_text,new_referral_code,
    CASE WHEN ref_user_id IS NOT NULL THEN ref_code END,ref_user_id,new_nexora_id)
  ON CONFLICT (id) DO UPDATE SET full_name=COALESCE(EXCLUDED.full_name,profiles.full_name),
    email=COALESCE(EXCLUDED.email,profiles.email), mobile=COALESCE(EXCLUDED.mobile,profiles.mobile),
    gender=COALESCE(EXCLUDED.gender,profiles.gender), updated_at=now();
  INSERT INTO public.user_roles(user_id,role) VALUES (NEW.id,assigned_role) ON CONFLICT (user_id,role) DO NOTHING;
  IF ref_user_id IS NOT NULL THEN
    INSERT INTO public.referral_attributions(referrer_user_id,referred_user_id,referral_code,referrer_name)
    VALUES (ref_user_id,NEW.id,ref_code,referrer_display_name) ON CONFLICT (referred_user_id) DO NOTHING;
    INSERT INTO public.referrals(referrer_id,referred_user_id,status,reward_amount)
    VALUES (ref_user_id,NEW.id,'pending',0) ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END
$$;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Helpful covering indexes for owner/customer access paths.
CREATE INDEX IF NOT EXISTS bookings_user_created_idx ON public.bookings(user_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS bookings_salon_date_idx ON public.bookings(salon_id, booking_date, booking_time) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS reviews_salon_created_idx ON public.reviews(salon_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_user_unread_idx ON public.notifications(user_id, created_at DESC) WHERE is_read IS FALSE;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_referral_code_upper_key ON public.profiles(upper(referral_code)) WHERE referral_code IS NOT NULL;
