-- =====================================================================
-- Nexora "Shop Owner PWA App" — additive production schema.
-- =====================================================================
-- This migration is 100% ADDITIVE and NON-DESTRUCTIVE.
--   * No existing table or column is dropped or renamed.
--   * No production data is touched.
--   * Existing flows (customer booking, referral, header, PWA) are unaffected.
--
-- It REUSES the canonical Nexora tables that already power the live site:
--   salons      -> the "shop"  (slug, owner, address, etc.)
--   services    -> shop services
--   staff       -> shop staff
--   bookings    -> appointments (extended here with owner-only columns)
--   salon_owners-> owner/manager membership + approval
--   salon_wallets / wallet_ledger / wallet_settlements -> earnings
--
-- It only ADDS:
--   * missing shop-owner columns on salons / services / bookings
--   * genuinely-missing supporting tables (business hours, special hours,
--     blocked slots, settings)
--   * helper functions can_manage_shop / can_manage_booking
--   * RLS, CHECK constraints, indexes
--   * owner-scoped storage buckets
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Reusable helper functions (owner / manager / admin authorization)
-- ---------------------------------------------------------------------
-- is_salon_owner, is_shop_member, is_super_admin already exist in the DB.
-- We add owner-management helpers that combine them safely.

CREATE OR REPLACE FUNCTION public.can_manage_shop(_shop_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_salon_owner((SELECT auth.uid()), _shop_id)
      OR public.is_super_admin((SELECT auth.uid()))
$$;
REVOKE ALL ON FUNCTION public.can_manage_shop(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_manage_shop(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.can_manage_booking(_booking_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _shop_id uuid;
  _fk_col text;
BEGIN
  -- The bookings -> shop foreign-key column is named differently across
  -- Nexora environments ("salon_id" on fresh installs, "shop_id" on some
  -- live projects). Resolve the REAL column name from the catalog so this
  -- function can be created (and run) without ever failing on a missing
  -- column. EXECUTE/format keeps the reference fully dynamic.
  SELECT c.column_name INTO _fk_col
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'bookings'
    AND c.column_name IN ('salon_id', 'shop_id')
  ORDER BY (c.column_name = 'salon_id') DESC
  LIMIT 1;

  IF _fk_col IS NULL THEN
    RETURN false;
  END IF;

  EXECUTE format('SELECT %I FROM public.bookings WHERE id = $1', _fk_col)
    INTO _shop_id
    USING _booking_id;

  IF _shop_id IS NULL THEN
    RETURN false;
  END IF;

  RETURN public.is_salon_owner((SELECT auth.uid()), _shop_id)
      OR public.is_super_admin((SELECT auth.uid()));
END $$;
REVOKE ALL ON FUNCTION public.can_manage_booking(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_manage_booking(uuid) TO authenticated;

-- ---------------------------------------------------------------------
-- 2. Extend public.salons with shop-owner business fields
-- ---------------------------------------------------------------------
ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS business_email text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  ADD COLUMN IF NOT EXISTS booking_confirmation_mode text NOT NULL DEFAULT 'automatic'
    CHECK (booking_confirmation_mode IN ('automatic', 'manual')),
  ADD COLUMN IF NOT EXISTS cancellation_policy text,
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_temporarily_closed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS vacation_mode_until date,
  ADD COLUMN IF NOT EXISTS operational_status text NOT NULL DEFAULT 'active'
    CHECK (operational_status IN ('active', 'paused', 'closed', 'suspended')),
  ADD COLUMN IF NOT EXISTS payment_methods text[] NOT NULL DEFAULT ARRAY['cash']::text[],
  ADD COLUMN IF NOT EXISTS social_links jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Slug uniqueness is already enforced (salons_slug_unique). Add a format check
-- as NOT VALID so it never rejects historical rows (only future writes).
-- Guarded on column existence so it can never error on any schema variant.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='salons' AND column_name='slug'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'salons_slug_format_check'
  ) THEN
    ALTER TABLE public.salons
      ADD CONSTRAINT salons_slug_format_check
      CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$') NOT VALID;
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 3. Extend public.services with owner merchandising fields
-- ---------------------------------------------------------------------
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS discounted_price numeric(10,2),
  ADD COLUMN IF NOT EXISTS buffer_minutes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

-- discounted_price, when set, must be positive and below price.
-- NOT VALID keeps existing rows untouched (constraint applies to new writes only).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'services_discount_positive_check') THEN
    ALTER TABLE public.services
      ADD CONSTRAINT services_discount_positive_check
      CHECK (discounted_price IS NULL OR (discounted_price > 0 AND discounted_price <= price)) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'services_price_nonneg_check') THEN
    ALTER TABLE public.services ADD CONSTRAINT services_price_nonneg_check CHECK (price >= 0) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'services_duration_positive_check') THEN
    ALTER TABLE public.services ADD CONSTRAINT services_duration_positive_check CHECK (duration_minutes > 0) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'services_buffer_nonneg_check') THEN
    ALTER TABLE public.services ADD CONSTRAINT services_buffer_nonneg_check CHECK (buffer_minutes >= 0) NOT VALID;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS services_salon_active_order_idx
  ON public.services (salon_id, is_active, display_order)
  WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------
-- 4. Extend public.bookings with richer owner-management columns
--    (existing customer columns/flow are untouched; all new columns are
--     nullable/defaulted so historical rows stay valid.)
-- ---------------------------------------------------------------------
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS staff_id uuid,
  ADD COLUMN IF NOT EXISTS start_at timestamptz,
  ADD COLUMN IF NOT EXISTS end_at timestamptz,
  ADD COLUMN IF NOT EXISTS subtotal numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_amount numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'partially_paid', 'refunded', 'failed', 'unpaid')),
  ADD COLUMN IF NOT EXISTS booking_source text NOT NULL DEFAULT 'online'
    CHECK (booking_source IN ('online', 'walk_in', 'phone', 'whatsapp', 'owner_manual')),
  ADD COLUMN IF NOT EXISTS customer_note text,
  ADD COLUMN IF NOT EXISTS internal_note text,
  ADD COLUMN IF NOT EXISTS staff_assigned_by uuid;

-- Widen the status enum to support the full owner workflow (no_show /
-- rejected / rescheduled) while keeping every existing value valid.
-- NOT VALID avoids rescanning/ rejecting historical rows.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.bookings'::regclass AND conname = 'bookings_status_check'
  ) THEN
    ALTER TABLE public.bookings DROP CONSTRAINT bookings_status_check;
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.bookings'::regclass AND conname = 'bookings_status_check'
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_status_check
      CHECK (status IN ('pending','confirmed','completed','cancelled','no_show','rejected','rescheduled')) NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_amounts_nonneg_check') THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_amounts_nonneg_check
      CHECK (subtotal >= 0 AND discount_amount >= 0 AND total_amount >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_end_after_start_check') THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_end_after_start_check
      CHECK (end_at IS NULL OR start_at IS NULL OR end_at > start_at);
  END IF;
END $$;

-- Covering indexes for the owner booking views. Guarded on column existence
-- so they never error on environments where bookings uses "shop_id" instead
-- of "salon_id" (they simply get skipped there).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'salon_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS bookings_owner_status_idx
      ON public.bookings (salon_id, status, booking_date) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS bookings_owner_staff_idx
      ON public.bookings (salon_id, staff_id, booking_date) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS bookings_owner_start_idx
      ON public.bookings (salon_id, start_at) WHERE start_at IS NOT NULL;
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 5. New supporting table: weekly business hours per shop
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.salon_business_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_open boolean NOT NULL DEFAULT true,
  opening_time time,
  closing_time time,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (salon_id, day_of_week),
  CHECK (is_open = false OR (opening_time IS NOT NULL AND closing_time IS NOT NULL)),
  CHECK (is_open = false OR closing_time > opening_time)
);
CREATE INDEX IF NOT EXISTS salon_business_hours_salon_idx
  ON public.salon_business_hours (salon_id, day_of_week);

-- ---------------------------------------------------------------------
-- 6. New supporting table: special dates / holidays per shop
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.salon_special_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  special_date date NOT NULL,
  is_closed boolean NOT NULL DEFAULT false,
  opening_time time,
  closing_time time,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (salon_id, special_date),
  CHECK (is_closed = true OR (opening_time IS NOT NULL AND closing_time IS NOT NULL)),
  CHECK (is_closed = true OR closing_time > opening_time)
);
CREATE INDEX IF NOT EXISTS salon_special_hours_salon_date_idx
  ON public.salon_special_hours (salon_id, special_date);

-- ---------------------------------------------------------------------
-- 7. New supporting table: owner-created blocked time slots
--    (private scheduling data — owner/staff only)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.salon_blocked_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  staff_id uuid, -- references public.staff(id) without hard FK to stay additive
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  reason text,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_at > start_at)
);
CREATE INDEX IF NOT EXISTS salon_blocked_slots_salon_range_idx
  ON public.salon_blocked_slots (salon_id, start_at, end_at);
CREATE INDEX IF NOT EXISTS salon_blocked_slots_staff_range_idx
  ON public.salon_blocked_slots (staff_id, start_at, end_at);

-- ---------------------------------------------------------------------
-- 8. New supporting table: shop settings
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.salon_settings (
  salon_id uuid PRIMARY KEY REFERENCES public.salons(id) ON DELETE CASCADE,
  currency text NOT NULL DEFAULT 'INR',
  timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  auto_confirm_bookings boolean NOT NULL DEFAULT true,
  allow_online_payments boolean NOT NULL DEFAULT true,
  minimum_booking_notice_minutes integer NOT NULL DEFAULT 120 CHECK (minimum_booking_notice_minutes >= 0),
  maximum_advance_booking_days integer NOT NULL DEFAULT 60 CHECK (maximum_advance_booking_days >= 1),
  cancellation_window_hours integer NOT NULL DEFAULT 24 CHECK (cancellation_window_hours >= 0),
  buffer_between_bookings_minutes integer NOT NULL DEFAULT 0 CHECK (buffer_between_bookings_minutes >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 9. updated_at triggers for the new tables
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.salons_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END $$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['salon_business_hours','salon_special_hours','salon_settings'] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%I_touch ON public.%I;', t, t
    );
    EXECUTE format(
      'CREATE TRIGGER trg_%I_touch BEFORE UPDATE ON public.%I '
      'FOR EACH ROW EXECUTE FUNCTION public.salons_touch_updated_at();', t, t
    );
  END LOOP;
END $$;

-- ---------------------------------------------------------------------
-- 10. Row Level Security on the new tables
-- ---------------------------------------------------------------------
ALTER TABLE public.salon_business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_special_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_blocked_slots  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_settings       ENABLE ROW LEVEL SECURITY;

-- Public users can read hours/availability of *active, published* shops
-- (needed by the public booking calendar). Blocked slots + settings stay private.
DROP POLICY IF EXISTS "Public read published shop hours" ON public.salon_business_hours;
CREATE POLICY "Public read published shop hours"
  ON public.salon_business_hours FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.salons s
      WHERE s.id = salon_business_hours.salon_id
        AND s.is_active = true AND s.deleted_at IS NULL
        AND s.is_published = true
    )
  );

DROP POLICY IF EXISTS "Owners manage shop business hours" ON public.salon_business_hours;
CREATE POLICY "Owners manage shop business hours"
  ON public.salon_business_hours FOR ALL TO authenticated
  USING (public.can_manage_shop(salon_id))
  WITH CHECK (public.can_manage_shop(salon_id));

DROP POLICY IF EXISTS "Public read published special hours" ON public.salon_special_hours;
CREATE POLICY "Public read published special hours"
  ON public.salon_special_hours FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.salons s
      WHERE s.id = salon_special_hours.salon_id
        AND s.is_active = true AND s.deleted_at IS NULL
        AND s.is_published = true
    )
  );

DROP POLICY IF EXISTS "Owners manage shop special hours" ON public.salon_special_hours;
CREATE POLICY "Owners manage shop special hours"
  ON public.salon_special_hours FOR ALL TO authenticated
  USING (public.can_manage_shop(salon_id))
  WITH CHECK (public.can_manage_shop(salon_id));

-- Blocked slots: owner/staff read + owner write (private scheduling).
DROP POLICY IF EXISTS "Shop members read blocked slots" ON public.salon_blocked_slots;
CREATE POLICY "Shop members read blocked slots"
  ON public.salon_blocked_slots FOR SELECT TO authenticated
  USING (public.is_shop_member((SELECT auth.uid()), salon_id) OR public.is_super_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "Owners manage blocked slots" ON public.salon_blocked_slots;
CREATE POLICY "Owners manage blocked slots"
  ON public.salon_blocked_slots FOR ALL TO authenticated
  USING (public.can_manage_shop(salon_id))
  WITH CHECK (public.can_manage_shop(salon_id) AND created_by = (SELECT auth.uid()));

-- Settings: owner only.
DROP POLICY IF EXISTS "Owners manage shop settings" ON public.salon_settings;
CREATE POLICY "Owners manage shop settings"
  ON public.salon_settings FOR ALL TO authenticated
  USING (public.can_manage_shop(salon_id))
  WITH CHECK (public.can_manage_shop(salon_id));

GRANT SELECT ON public.salon_business_hours, public.salon_special_hours TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.salon_business_hours, public.salon_special_hours,
  public.salon_blocked_slots, public.salon_settings TO authenticated;
GRANT ALL ON public.salon_business_hours, public.salon_special_hours,
  public.salon_blocked_slots, public.salon_settings TO service_role;

-- ---------------------------------------------------------------------
-- 11. Owner-scoped storage buckets (mirror the salon-media pattern)
--     Folder layout: <salon_id>/<unique-file>  -> owner-scoped via policy.
-- ---------------------------------------------------------------------
DO $$
DECLARE b text;
BEGIN
  FOREACH b IN ARRAY ARRAY['shop-logos','shop-covers','shop-services','shop-staff','shop-media'] LOOP
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = b) THEN
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES (
        b, b, true, 10485760,
        ARRAY['image/jpeg','image/png','image/webp','image/avif']
      );
    END IF;
  END LOOP;
END $$;

-- Policy names are identifiers -> use %I (double-quoted). bucket_id values
-- are string literals -> use %L. Mirrors the committed salon-media policies.
DO $$
DECLARE b text;
BEGIN
  FOREACH b IN ARRAY ARRAY['shop-logos','shop-covers','shop-services','shop-staff','shop-media'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects;', 'Public read ' || b);
    EXECUTE format(
      'CREATE POLICY %I ON storage.objects FOR SELECT TO public USING (bucket_id = %L);',
      'Public read ' || b, b
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects;', 'Owners upload to ' || b);
    EXECUTE format(
      'CREATE POLICY %I ON storage.objects FOR INSERT TO authenticated
       WITH CHECK (bucket_id = %L AND public.is_salon_owner(auth.uid(), (split_part(name, ''/'', 1))::uuid));',
      'Owners upload to ' || b, b
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects;', 'Owners update their ' || b);
    EXECUTE format(
      'CREATE POLICY %I ON storage.objects FOR UPDATE TO authenticated
       USING (bucket_id = %L AND public.is_salon_owner(auth.uid(), (split_part(name, ''/'', 1))::uuid));',
      'Owners update their ' || b, b
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects;', 'Owners delete their ' || b);
    EXECUTE format(
      'CREATE POLICY %I ON storage.objects FOR DELETE TO authenticated
       USING (bucket_id = %L AND public.is_salon_owner(auth.uid(), (split_part(name, ''/'', 1))::uuid));',
      'Owners delete their ' || b, b
    );
  END LOOP;
END $$;

-- ---------------------------------------------------------------------
-- 12. Realtime for the owner dashboard (bookings already published).
-- ---------------------------------------------------------------------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['salon_business_hours','salon_special_hours','salon_blocked_slots','salon_settings'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I;', t);
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------
-- 13. Backfill an owner settings row for every existing shop so the
--     dashboard never sees a missing-settings error.
-- ---------------------------------------------------------------------
INSERT INTO public.salon_settings (salon_id)
SELECT s.id FROM public.salons s
WHERE s.deleted_at IS NULL
ON CONFLICT (salon_id) DO NOTHING;
