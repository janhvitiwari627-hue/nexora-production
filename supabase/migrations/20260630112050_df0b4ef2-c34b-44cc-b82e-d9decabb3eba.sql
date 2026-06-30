
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin'::app_role, 'admin'::app_role)
  )
$$;

CREATE OR REPLACE FUNCTION public.is_shop_member(_user_id uuid, _salon_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.salon_owners
    WHERE user_id = _user_id AND salon_id = _salon_id AND is_approved = true
  ) OR EXISTS (
    SELECT 1 FROM public.shop_staff ss
    WHERE ss.profile_id = _user_id AND ss.shop_id = _salon_id AND ss.is_active = true
  )
$$;

ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS deleted_by UUID;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS deleted_by UUID;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS deleted_by UUID;
ALTER TABLE public.salon_wallets ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.wallet_transactions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

DROP POLICY IF EXISTS "Salons are publicly viewable" ON public.salons;
CREATE POLICY "Public read active salons"
  ON public.salons FOR SELECT TO anon, authenticated
  USING (is_active = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Services publicly viewable" ON public.services;
CREATE POLICY "Public read active services"
  ON public.services FOR SELECT TO anon, authenticated
  USING (
    is_active = true
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.salons s
      WHERE s.id = services.salon_id AND s.is_active = true AND s.deleted_at IS NULL
    )
  );

DROP POLICY IF EXISTS "Users delete own bookings" ON public.bookings;

DROP POLICY IF EXISTS "Super admin manage salons" ON public.salons;
CREATE POLICY "Super admin manage salons" ON public.salons FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admin manage salon_owners" ON public.salon_owners;
CREATE POLICY "Super admin manage salon_owners" ON public.salon_owners FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admin manage bookings" ON public.bookings;
CREATE POLICY "Super admin manage bookings" ON public.bookings FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admin manage services" ON public.services;
CREATE POLICY "Super admin manage services" ON public.services FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admin manage wallets" ON public.salon_wallets;
CREATE POLICY "Super admin manage wallets" ON public.salon_wallets FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admin manage wallet_tx" ON public.wallet_transactions;
CREATE POLICY "Super admin manage wallet_tx" ON public.wallet_transactions FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admin manage payments" ON public.payments;
CREATE POLICY "Super admin manage payments" ON public.payments FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admin read profiles" ON public.profiles;
CREATE POLICY "Super admin read profiles" ON public.profiles FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Members read assigned salon" ON public.salons;
CREATE POLICY "Members read assigned salon" ON public.salons FOR SELECT TO authenticated
  USING (public.is_shop_member(auth.uid(), id));

DROP POLICY IF EXISTS "Members read assigned services" ON public.services;
CREATE POLICY "Members read assigned services" ON public.services FOR SELECT TO authenticated
  USING (public.is_shop_member(auth.uid(), salon_id));

DROP POLICY IF EXISTS "Members read assigned bookings" ON public.bookings;
CREATE POLICY "Members read assigned bookings" ON public.bookings FOR SELECT TO authenticated
  USING (public.is_shop_member(auth.uid(), salon_id));

REVOKE DELETE ON public.bookings FROM authenticated, anon;
REVOKE DELETE ON public.wallet_transactions FROM authenticated, anon;
REVOKE DELETE ON public.salon_wallets FROM authenticated, anon;
REVOKE DELETE ON public.payments FROM authenticated, anon;
REVOKE DELETE ON public.audit_events FROM authenticated, anon;
