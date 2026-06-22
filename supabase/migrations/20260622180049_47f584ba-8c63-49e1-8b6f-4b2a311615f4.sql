
-- 1. Memberships: restrict self-insert to 'free' tier only
ALTER TABLE public.memberships ALTER COLUMN tier SET DEFAULT 'free';
DROP POLICY IF EXISTS "Users create own membership" ON public.memberships;
CREATE POLICY "Users create own free membership"
  ON public.memberships FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND tier = 'free');

-- Also restrict tier changes via UPDATE: keep existing update policy but block tier escalation
DROP POLICY IF EXISTS "Users update own membership" ON public.memberships;
CREATE POLICY "Users update own membership (no tier change)"
  ON public.memberships FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND tier = (SELECT m.tier FROM public.memberships m WHERE m.id = memberships.id));

-- 2. Referrals: drop referred_email column to prevent third-party PII leak
ALTER TABLE public.referrals DROP COLUMN IF EXISTS referred_email;

-- 3. Salons: revoke anon access to contact columns
REVOKE SELECT (phone, email, whatsapp) ON public.salons FROM anon;
REVOKE SELECT (phone, email, whatsapp) ON public.salons FROM PUBLIC;
GRANT SELECT (phone, email, whatsapp) ON public.salons TO authenticated;

-- 4. Staff: restrict public SELECT to authenticated users
DROP POLICY IF EXISTS "Staff publicly viewable" ON public.staff;
CREATE POLICY "Staff viewable by authenticated users"
  ON public.staff FOR SELECT TO authenticated
  USING (true);

-- 5. SECURITY DEFINER functions: revoke public/anon EXECUTE on internal functions
-- has_role and is_salon_owner are used in RLS policies (need authenticated) - keep authenticated
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_salon_owner(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_salon_owner(uuid, uuid) TO authenticated, service_role;

-- Admin/system functions: service_role only
REVOKE ALL ON FUNCTION public.auto_release_escrow() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.auto_release_escrow() TO service_role;

REVOKE ALL ON FUNCTION public.process_pending_settlements() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_pending_settlements() TO service_role;

REVOKE ALL ON FUNCTION public.recompute_nexora_scores() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.recompute_nexora_scores() TO service_role;

REVOKE ALL ON FUNCTION public.release_expired_bookings() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.release_expired_bookings() TO service_role;

REVOKE ALL ON FUNCTION public.release_payment_to_wallet(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.release_payment_to_wallet(uuid) TO service_role;

-- request_withdrawal: authenticated (verifies ownership internally)
REVOKE ALL ON FUNCTION public.request_withdrawal(uuid, numeric, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_withdrawal(uuid, numeric, jsonb) TO authenticated, service_role;

-- Trigger-only functions: no direct callers needed
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_on_new_booking() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_on_booking_status_change() FROM PUBLIC, anon, authenticated;
