
-- 1) Remove broad anon read on salons; force public traffic through the safe view
DROP POLICY IF EXISTS "Public can read active salons" ON public.salons;
REVOKE SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.salons FROM anon;

-- Make the view read as its owner so it can serve anon rows without an anon
-- SELECT policy on the underlying table. Only marketing-safe columns are exposed.
ALTER VIEW public.public_salon_cards SET (security_invoker = false);
GRANT SELECT ON public.public_salon_cards TO anon, authenticated;

-- 2) Revoke EXECUTE from anon on SECURITY DEFINER helpers that anon has no
-- legitimate reason to call. Triggers/cron/RLS still work because they run as
-- table owner or as the authenticated user (which retains EXECUTE).
REVOKE EXECUTE ON FUNCTION public.log_partner_financial_change() FROM anon, PUBLIC;
DO $$
BEGIN
  IF to_regprocedure('public.email_queue_wake()') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.email_queue_wake() FROM anon, authenticated, PUBLIC;
  END IF;
  IF to_regprocedure('public.email_queue_dispatch()') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM anon, authenticated, PUBLIC;
  END IF;
END
$$;
REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_shop_member(uuid, uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_shop_owner_biz(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_shop_member_biz(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.populate_job_application_refs() FROM anon, authenticated, PUBLIC;
