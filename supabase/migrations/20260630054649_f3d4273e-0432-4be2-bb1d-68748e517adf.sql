
-- 1) Revoke EXECUTE from anon on SECURITY DEFINER helpers that don't need anonymous access
REVOKE EXECUTE ON FUNCTION public.create_wallet_for_shop() FROM anon;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.list_salon_staff(uuid) FROM anon;

-- 2) partner_payouts: drop owner SELECT (V2 module is locked); only admins may read
DROP POLICY IF EXISTS "Payouts: owner view" ON public.partner_payouts;

-- 3) shop_staff: add owner SELECT policy, but exclude phone via column-level revoke
CREATE POLICY "shop_staff_owner_select"
  ON public.shop_staff FOR SELECT
  USING (public.is_salon_owner(auth.uid(), shop_id));
REVOKE SELECT (phone) ON public.shop_staff FROM anon, authenticated;

-- 4) staff: field-level restriction on email/phone from authenticated (admins use service role)
REVOKE SELECT (email, phone) ON public.staff FROM anon, authenticated;
