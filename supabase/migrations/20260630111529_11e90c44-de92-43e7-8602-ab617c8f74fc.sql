
-- District column
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS district text;
CREATE INDEX IF NOT EXISTS salons_district_idx ON public.salons(district);

-- INSERT policy: only authenticated users with an owner-ish role may create a shop
DROP POLICY IF EXISTS "Authenticated owners can create salon" ON public.salons;
CREATE POLICY "Authenticated owners can create salon"
  ON public.salons
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'owner'::public.app_role)
    OR public.has_role(auth.uid(), 'shop_owner'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

-- INSERT policy: a user can only link themselves as a salon owner
DROP POLICY IF EXISTS "Owner can link self to their salon" ON public.salon_owners;
CREATE POLICY "Owner can link self to their salon"
  ON public.salon_owners
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (
      public.has_role(auth.uid(), 'owner'::public.app_role)
      OR public.has_role(auth.uid(), 'shop_owner'::public.app_role)
    )
  );

GRANT SELECT, INSERT, UPDATE ON public.salons TO authenticated;
GRANT SELECT, INSERT ON public.salon_owners TO authenticated;

-- Atomic, security-definer registration: forces owner_id = auth.uid()
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
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  new_salon_id uuid;
  slug_base text;
  slug_final text;
  i int := 0;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _shop_name IS NULL OR length(trim(_shop_name)) < 2 THEN
    RAISE EXCEPTION 'Shop name is required';
  END IF;
  IF _district IS NULL OR length(trim(_district)) < 2 THEN
    RAISE EXCEPTION 'District is required';
  END IF;
  IF _mobile IS NULL OR length(trim(_mobile)) < 6 THEN
    RAISE EXCEPTION 'Mobile is required';
  END IF;

  -- Ensure the user has the owner role (idempotent)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (uid, 'shop_owner'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (uid, 'owner'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Build a unique slug
  slug_base := regexp_replace(lower(trim(_shop_name)), '[^a-z0-9]+', '-', 'g');
  slug_base := regexp_replace(slug_base, '(^-+|-+$)', '', 'g');
  IF slug_base = '' THEN slug_base := 'shop'; END IF;
  slug_final := slug_base;
  WHILE EXISTS (SELECT 1 FROM public.salons WHERE slug = slug_final) LOOP
    i := i + 1;
    slug_final := slug_base || '-' || i::text;
  END LOOP;

  INSERT INTO public.salons (
    name, slug, district, category, address, phone, whatsapp, email,
    owner_name, is_active
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

  -- Sync mobile to profile if missing
  UPDATE public.profiles
     SET mobile = COALESCE(mobile, trim(_mobile)),
         full_name = COALESCE(NULLIF(full_name,''), trim(_owner_name))
   WHERE id = uid;

  RETURN new_salon_id;
END;
$$;

REVOKE ALL ON FUNCTION public.register_owner_business(text,text,text,text,text,text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.register_owner_business(text,text,text,text,text,text,text,text) TO authenticated;
