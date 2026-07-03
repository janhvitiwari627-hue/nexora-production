
-- Security fix: prevent privilege escalation via chat_threads.
-- The previous "Owners can manage chat threads" ALL policy let any authenticated
-- user insert a chat_threads row with their own owner_id + any real shop_id and
-- then read/send messages. The public.shops table has no ownership column, so
-- there is no real ownership check to bind against yet. Until shop ownership is
-- modeled, restrict writes to admins; owners can still read their existing rows.

DROP POLICY IF EXISTS "Owners can manage chat threads" ON public.chat_threads;
DROP POLICY IF EXISTS "Owners can manage chat messages" ON public.chat_messages;

CREATE POLICY "Owners can read own chat threads"
  ON public.chat_threads FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Admins manage chat threads"
  ON public.chat_threads FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_super_admin(auth.uid()));

CREATE POLICY "Owners can read own chat messages"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_threads cr
      WHERE cr.id = chat_messages.thread_id
        AND cr.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage chat messages"
  ON public.chat_messages FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_super_admin(auth.uid()));
