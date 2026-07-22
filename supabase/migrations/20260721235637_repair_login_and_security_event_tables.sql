-- Repair production projects where the original security-event migration was
-- skipped. The statements are idempotent so fully migrated projects are safe.
CREATE TABLE IF NOT EXISTS public.login_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address inet,
  user_agent text,
  device_label text,
  location jsonb,
  is_active boolean NOT NULL DEFAULT true,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS login_events_user_id_idx
  ON public.login_events (user_id, created_at DESC);

ALTER TABLE public.login_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.login_events FROM anon;
GRANT SELECT, INSERT, UPDATE ON TABLE public.login_events TO authenticated;
GRANT ALL ON TABLE public.login_events TO service_role;

DROP POLICY IF EXISTS "Users view own login events" ON public.login_events;
CREATE POLICY "Users view own login events"
  ON public.login_events FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users insert own login events" ON public.login_events;
CREATE POLICY "Users insert own login events"
  ON public.login_events FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users revoke own login events" ON public.login_events;
CREATE POLICY "Users revoke own login events"
  ON public.login_events FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS security_events_user_id_idx
  ON public.security_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS security_events_type_idx
  ON public.security_events (event_type, created_at DESC);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.security_events FROM anon;
GRANT SELECT, INSERT ON TABLE public.security_events TO authenticated;
GRANT ALL ON TABLE public.security_events TO service_role;

DROP POLICY IF EXISTS "Users view own security events" ON public.security_events;
CREATE POLICY "Users view own security events"
  ON public.security_events FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users insert own security events" ON public.security_events;
CREATE POLICY "Users insert own security events"
  ON public.security_events FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) IS NOT NULL
    AND (user_id IS NULL OR user_id = (SELECT auth.uid()))
  );

NOTIFY pgrst, 'reload schema';
