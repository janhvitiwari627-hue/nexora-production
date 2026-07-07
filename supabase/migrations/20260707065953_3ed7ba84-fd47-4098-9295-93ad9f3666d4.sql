
-- P1: Revoke EXECUTE on trigger-only SECURITY DEFINER functions.
-- These run automatically via triggers as the table owner, so no role needs direct EXECUTE.
REVOKE EXECUTE ON FUNCTION public.notify_on_new_booking() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_on_booking_status_change() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_wallet_for_shop() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;

-- P2: chat_quick_replies has RLS on but no policies (locked to everyone).
-- Add explicit admin-only policies so the state is intentional and auditable.
-- Owner/staff/shop-scoped policies will be added when the chat feature ships.
REVOKE ALL ON public.chat_quick_replies FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_quick_replies TO authenticated;
GRANT ALL ON public.chat_quick_replies TO service_role;

CREATE POLICY "Admins manage chat quick replies"
  ON public.chat_quick_replies
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
