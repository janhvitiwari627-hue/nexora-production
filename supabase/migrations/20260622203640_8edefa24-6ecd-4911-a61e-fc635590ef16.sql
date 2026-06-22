-- Tighten staff RLS: owners + admins only; expose public-safe view via RPC.

-- 1. Drop the over-permissive SELECT policy
DROP POLICY IF EXISTS "Staff viewable by authenticated users" ON public.staff;
DROP POLICY IF EXISTS "Staff viewable by everyone" ON public.staff;
DROP POLICY IF EXISTS "Public can view staff" ON public.staff;

-- 2. Owner + admin SELECT (preserve existing manage policies if present)
CREATE POLICY "Staff readable by salon owners and admins"
  ON public.staff
  FOR SELECT
  TO authenticated
  USING (
    public.is_salon_owner(auth.uid(), salon_id)
    OR public.has_role(auth.uid(), 'admin')
  );

-- 3. Public-safe RPC: name, role, bio, avatar, rating only — no email/phone/working_hours
CREATE OR REPLACE FUNCTION public.list_salon_staff(_salon_id uuid)
RETURNS TABLE (
  id uuid,
  salon_id uuid,
  name text,
  role text,
  bio text,
  avatar_url text,
  rating double precision
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id, s.salon_id, s.name, s.role, s.bio, s.avatar_url, s.rating
    FROM public.staff s
   WHERE s.salon_id = _salon_id
     AND s.is_active = true
   ORDER BY s.rating DESC NULLS LAST, s.name;
$$;

REVOKE ALL ON FUNCTION public.list_salon_staff(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_salon_staff(uuid) TO anon, authenticated;