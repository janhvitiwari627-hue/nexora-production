DROP POLICY IF EXISTS businesses_public_active_read ON public.businesses;
CREATE POLICY businesses_public_active_read
  ON public.businesses FOR SELECT
  TO anon
  USING (
    status = 'active'
    AND is_active = true
    AND deleted_at IS NULL
  );