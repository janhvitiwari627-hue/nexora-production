-- Defense in depth: ensure no signed-in or anonymous user can write to user_roles via the Data API.
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon, authenticated, PUBLIC;

-- Add a restrictive deny-write policy as a belt-and-suspenders measure (even if a grant is ever re-added).
DROP POLICY IF EXISTS "Block client-side role writes" ON public.user_roles;
CREATE POLICY "Block client-side role writes"
ON public.user_roles
AS RESTRICTIVE
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- Tighten has_role: revoke EXECUTE from anon and PUBLIC. Keep authenticated, which is required
-- for RLS policy evaluation when an authenticated user queries protected tables.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;