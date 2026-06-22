
-- salon_owners: many-to-many link between auth users and salons
CREATE TABLE public.salon_owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'owner' CHECK (role IN ('owner','manager')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, salon_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.salon_owners TO authenticated;
GRANT ALL ON public.salon_owners TO service_role;

ALTER TABLE public.salon_owners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view their salon links" ON public.salon_owners
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage salon_owners" ON public.salon_owners
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Helper: is the user an owner/manager of this salon?
CREATE OR REPLACE FUNCTION public.is_salon_owner(_user_id uuid, _salon_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.salon_owners
    WHERE user_id = _user_id AND salon_id = _salon_id
  )
$$;

-- Salons: owners can update their own salons
CREATE POLICY "Owners update their salon" ON public.salons
  FOR UPDATE TO authenticated
  USING (public.is_salon_owner(auth.uid(), id))
  WITH CHECK (public.is_salon_owner(auth.uid(), id));

-- Services: owners full CRUD on their salon's services
CREATE POLICY "Owners manage their services" ON public.services
  FOR ALL TO authenticated
  USING (public.is_salon_owner(auth.uid(), salon_id))
  WITH CHECK (public.is_salon_owner(auth.uid(), salon_id));

-- Staff: owners full CRUD on their salon's staff
CREATE POLICY "Owners manage their staff" ON public.staff
  FOR ALL TO authenticated
  USING (public.is_salon_owner(auth.uid(), salon_id))
  WITH CHECK (public.is_salon_owner(auth.uid(), salon_id));

-- Bookings: owners view/update bookings for their salon
CREATE POLICY "Owners view their salon bookings" ON public.bookings
  FOR SELECT TO authenticated
  USING (public.is_salon_owner(auth.uid(), salon_id));
CREATE POLICY "Owners update their salon bookings" ON public.bookings
  FOR UPDATE TO authenticated
  USING (public.is_salon_owner(auth.uid(), salon_id))
  WITH CHECK (public.is_salon_owner(auth.uid(), salon_id));

-- Wallet/payments: owner-side aggregate view (uses bookings)
-- No new table; analytics will read from bookings filtered by salon_id.

-- Helpful index for owner lookups
CREATE INDEX IF NOT EXISTS idx_salon_owners_user ON public.salon_owners(user_id);
CREATE INDEX IF NOT EXISTS idx_salon_owners_salon ON public.salon_owners(salon_id);
CREATE INDEX IF NOT EXISTS idx_bookings_salon_date ON public.bookings(salon_id, booking_date);
