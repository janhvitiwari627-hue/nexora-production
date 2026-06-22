ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS brand_primary TEXT,
  ADD COLUMN IF NOT EXISTS brand_secondary TEXT,
  ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'modern',
  ADD COLUMN IF NOT EXISTS custom_css TEXT,
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS hours JSONB;

-- Allow salon owners to UPDATE their salon row (read is already public)
DROP POLICY IF EXISTS "Owners can update their salon" ON public.salons;
CREATE POLICY "Owners can update their salon"
  ON public.salons FOR UPDATE
  TO authenticated
  USING (public.is_salon_owner(auth.uid(), id))
  WITH CHECK (public.is_salon_owner(auth.uid(), id));