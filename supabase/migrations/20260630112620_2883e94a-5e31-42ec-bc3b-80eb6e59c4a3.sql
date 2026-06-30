
-- ENUMS
DO $$ BEGIN
  CREATE TYPE public.business_status AS ENUM (
    'draft','pending_verification','verified','active','inactive','suspended','rejected','archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- TABLES
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  salon_id UUID REFERENCES public.salons(id) ON DELETE SET NULL,
  business_name TEXT NOT NULL,
  business_category TEXT,
  phone TEXT,
  whatsapp_number TEXT,
  city TEXT,
  area_locality TEXT,
  status public.business_status NOT NULL DEFAULT 'pending_verification',
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);
GRANT SELECT, INSERT, UPDATE ON public.businesses TO authenticated;
GRANT SELECT ON public.businesses TO anon;
GRANT ALL ON public.businesses TO service_role;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.shop_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'shop_owner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shop_members TO authenticated;
GRANT ALL ON public.shop_members TO service_role;
ALTER TABLE public.shop_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.owner_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  owner_full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  business_name TEXT NOT NULL,
  business_category TEXT,
  whatsapp_number TEXT,
  city TEXT,
  area_locality TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.owner_requests TO authenticated;
GRANT ALL ON public.owner_requests TO service_role;
ALTER TABLE public.owner_requests ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- updated_at trigger
DROP TRIGGER IF EXISTS businesses_set_updated_at ON public.businesses;
CREATE TRIGGER businesses_set_updated_at
BEFORE UPDATE ON public.businesses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- HELPERS (no-arg / business-aware variants that use existing user_roles)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_super_admin(auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.is_shop_owner_biz(_business_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = _business_id AND owner_id = auth.uid() AND deleted_at IS NULL
  );
$$;

CREATE OR REPLACE FUNCTION public.is_shop_member_biz(_business_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shop_members
    WHERE business_id = _business_id AND user_id = auth.uid()
  );
$$;

-- POLICIES: businesses
DROP POLICY IF EXISTS "businesses_select_owner_member_public_admin" ON public.businesses;
CREATE POLICY "businesses_select_owner_member_public_admin"
  ON public.businesses FOR SELECT TO anon, authenticated
  USING (
    (status = 'active' AND is_active = true AND deleted_at IS NULL)
    OR (auth.uid() IS NOT NULL AND owner_id = auth.uid())
    OR (auth.uid() IS NOT NULL AND public.is_shop_member_biz(id))
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS "businesses_insert_owner_only" ON public.businesses;
CREATE POLICY "businesses_insert_owner_only"
  ON public.businesses FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "businesses_update_owner_or_admin" ON public.businesses;
CREATE POLICY "businesses_update_owner_or_admin"
  ON public.businesses FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.is_super_admin())
  WITH CHECK (owner_id = auth.uid() OR public.is_super_admin());

-- POLICIES: shop_members
DROP POLICY IF EXISTS "shop_members_select_owner_member_admin" ON public.shop_members;
CREATE POLICY "shop_members_select_owner_member_admin"
  ON public.shop_members FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_shop_owner_biz(business_id)
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS "shop_members_insert_self_or_owner_or_admin" ON public.shop_members;
CREATE POLICY "shop_members_insert_self_or_owner_or_admin"
  ON public.shop_members FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR public.is_shop_owner_biz(business_id)
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS "shop_members_update_owner_or_admin" ON public.shop_members;
CREATE POLICY "shop_members_update_owner_or_admin"
  ON public.shop_members FOR UPDATE TO authenticated
  USING (public.is_shop_owner_biz(business_id) OR public.is_super_admin())
  WITH CHECK (public.is_shop_owner_biz(business_id) OR public.is_super_admin());

DROP POLICY IF EXISTS "shop_members_delete_owner_or_admin" ON public.shop_members;
CREATE POLICY "shop_members_delete_owner_or_admin"
  ON public.shop_members FOR DELETE TO authenticated
  USING (public.is_shop_owner_biz(business_id) OR public.is_super_admin());

-- POLICIES: owner_requests
DROP POLICY IF EXISTS "owner_requests_select_own_or_admin" ON public.owner_requests;
CREATE POLICY "owner_requests_select_own_or_admin"
  ON public.owner_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "owner_requests_insert_own" ON public.owner_requests;
CREATE POLICY "owner_requests_insert_own"
  ON public.owner_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "owner_requests_update_admin_only" ON public.owner_requests;
CREATE POLICY "owner_requests_update_admin_only"
  ON public.owner_requests FOR UPDATE TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- POLICIES: audit_logs
DROP POLICY IF EXISTS "audit_logs_admin_select" ON public.audit_logs;
CREATE POLICY "audit_logs_admin_select"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "audit_logs_insert_authenticated" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_authenticated"
  ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Update register_owner_business to also write to new tables
CREATE OR REPLACE FUNCTION public.register_owner_business(
  _shop_name text,
  _district text,
  _owner_name text,
  _mobile text,
  _category text DEFAULT NULL,
  _address text DEFAULT NULL,
  _whatsapp text DEFAULT NULL,
  _email text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  new_salon_id uuid;
  new_business_id uuid;
  slug_base text;
  slug_final text;
  i int := 0;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _shop_name IS NULL OR length(trim(_shop_name)) < 2 THEN RAISE EXCEPTION 'Shop name is required'; END IF;
  IF _district IS NULL OR length(trim(_district)) < 2 THEN RAISE EXCEPTION 'District is required'; END IF;
  IF _mobile  IS NULL OR length(trim(_mobile))  < 6 THEN RAISE EXCEPTION 'Mobile is required'; END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'shop_owner'::public.app_role) ON CONFLICT DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'owner'::public.app_role) ON CONFLICT DO NOTHING;

  slug_base := regexp_replace(lower(trim(_shop_name)), '[^a-z0-9]+', '-', 'g');
  slug_base := regexp_replace(slug_base, '(^-+|-+$)', '', 'g');
  IF slug_base = '' THEN slug_base := 'shop'; END IF;
  slug_final := slug_base;
  WHILE EXISTS (SELECT 1 FROM public.salons WHERE slug = slug_final) LOOP
    i := i + 1; slug_final := slug_base || '-' || i::text;
  END LOOP;

  INSERT INTO public.salons (
    name, slug, district, category, address, phone, whatsapp, email, owner_name, is_active
  ) VALUES (
    trim(_shop_name), slug_final, trim(_district),
    NULLIF(trim(coalesce(_category,'')),''),
    NULLIF(trim(coalesce(_address,'')),''),
    trim(_mobile),
    NULLIF(trim(coalesce(_whatsapp,'')),''),
    NULLIF(trim(coalesce(_email,'')),''),
    trim(_owner_name),
    true
  ) RETURNING id INTO new_salon_id;

  INSERT INTO public.salon_owners (user_id, salon_id, role, is_approved, approved_at)
  VALUES (uid, new_salon_id, 'owner', true, now());

  -- NEW: businesses table mirror
  INSERT INTO public.businesses (
    owner_id, salon_id, business_name, business_category,
    phone, whatsapp_number, city, area_locality, status, is_active
  ) VALUES (
    uid, new_salon_id, trim(_shop_name),
    NULLIF(trim(coalesce(_category,'')),''),
    trim(_mobile),
    NULLIF(trim(coalesce(_whatsapp,'')),''),
    trim(_district),
    NULLIF(trim(coalesce(_address,'')),''),
    'pending_verification', false
  ) RETURNING id INTO new_business_id;

  INSERT INTO public.shop_members (business_id, user_id, role)
  VALUES (new_business_id, uid, 'shop_owner'::public.app_role)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.owner_requests (
    user_id, business_id, owner_full_name, email, phone,
    business_name, business_category, whatsapp_number, city, area_locality, status
  ) VALUES (
    uid, new_business_id, trim(_owner_name),
    coalesce(NULLIF(trim(coalesce(_email,'')),''),''),
    trim(_mobile),
    trim(_shop_name),
    NULLIF(trim(coalesce(_category,'')),''),
    NULLIF(trim(coalesce(_whatsapp,'')),''),
    trim(_district),
    NULLIF(trim(coalesce(_address,'')),''),
    'pending'
  );

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (uid, 'owner.register_business', 'business', new_business_id,
          jsonb_build_object('salon_id', new_salon_id, 'shop_name', _shop_name, 'city', _district));

  UPDATE public.profiles
     SET mobile = COALESCE(mobile, trim(_mobile)),
         full_name = COALESCE(NULLIF(full_name,''), trim(_owner_name))
   WHERE id = uid;

  RETURN new_salon_id;
END;
$$;

REVOKE DELETE ON public.businesses FROM authenticated, anon;
REVOKE DELETE ON public.owner_requests FROM authenticated, anon;
REVOKE DELETE ON public.audit_logs FROM authenticated, anon;
