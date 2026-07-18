GRANT SELECT ON public.salons TO anon, authenticated;
GRANT SELECT ON public.services TO anon, authenticated;
GRANT SELECT ON public.reviews TO anon, authenticated;

DROP POLICY IF EXISTS "Public can read active salons" ON public.salons;
CREATE POLICY "Public can read active salons"
  ON public.salons FOR SELECT
  TO anon, authenticated
  USING (is_active = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Public can read active services" ON public.services;
CREATE POLICY "Public can read active services"
  ON public.services FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.salons s
      WHERE s.id = services.salon_id
        AND s.is_active = true
        AND s.deleted_at IS NULL
    )
  );

DROP POLICY IF EXISTS "Public can read reviews of active salons" ON public.reviews;
CREATE POLICY "Public can read reviews of active salons"
  ON public.reviews FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.salons s
      WHERE s.id = reviews.salon_id
        AND s.is_active = true
        AND s.deleted_at IS NULL
    )
  );