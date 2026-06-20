
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ SALONS ============
CREATE TABLE public.salons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text,
  rating double precision NOT NULL DEFAULT 0,
  reviews_count integer NOT NULL DEFAULT 0,
  price_range text,
  discount text,
  location text,
  distance double precision,
  description text,
  is_verified boolean NOT NULL DEFAULT false,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.salons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.salons TO authenticated;
GRANT ALL ON public.salons TO service_role;
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Salons are publicly viewable" ON public.salons FOR SELECT USING (true);
CREATE POLICY "Admins manage salons" ON public.salons FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ BOOKINGS ============
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  booking_date date NOT NULL,
  booking_time time NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own bookings" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own bookings" ON public.bookings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own bookings" ON public.bookings FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all bookings" ON public.bookings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ MEMBERSHIPS ============
CREATE TABLE public.memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier text NOT NULL CHECK (tier IN ('silver','gold','platinum')),
  saved_amount numeric(10,2) NOT NULL DEFAULT 0,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memberships TO authenticated;
GRANT ALL ON public.memberships TO service_role;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own membership" ON public.memberships FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own membership" ON public.memberships FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own membership" ON public.memberships FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all memberships" ON public.memberships FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ PENDING PAYMENTS ============
CREATE TABLE public.pending_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE,
  transaction_id text NOT NULL,
  screenshot_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pending_payments TO authenticated;
GRANT ALL ON public.pending_payments TO service_role;
ALTER TABLE public.pending_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own payments" ON public.pending_payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own payments" ON public.pending_payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all payments" ON public.pending_payments FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update payments" ON public.pending_payments FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ updated_at triggers ============
CREATE TRIGGER trg_salons_updated BEFORE UPDATE ON public.salons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_memberships_updated BEFORE UPDATE ON public.memberships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_pending_payments_updated BEFORE UPDATE ON public.pending_payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ Indexes ============
CREATE INDEX idx_bookings_user ON public.bookings(user_id);
CREATE INDEX idx_bookings_salon ON public.bookings(salon_id);
CREATE INDEX idx_memberships_user ON public.memberships(user_id);
CREATE INDEX idx_pending_payments_user ON public.pending_payments(user_id);
CREATE INDEX idx_pending_payments_booking ON public.pending_payments(booking_id);
