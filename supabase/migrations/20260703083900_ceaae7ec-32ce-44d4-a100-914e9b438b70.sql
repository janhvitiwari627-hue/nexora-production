
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.portal_leads;

CREATE POLICY "Anyone can submit a lead"
ON public.portal_leads
FOR INSERT
TO public
WITH CHECK (
  target_type = ANY (ARRAY['brand'::text, 'distributor'::text, 'partner'::text])
  AND length(COALESCE(name, ''::text)) BETWEEN 1 AND 200
  AND length(COALESCE(message, ''::text)) BETWEEN 1 AND 2000
  AND status = 'new'::text
  AND (
    (target_type = 'brand'
      AND brand_id IS NOT NULL AND distributor_id IS NULL
      AND EXISTS (SELECT 1 FROM public.brands b WHERE b.id = portal_leads.brand_id AND b.status = 'active'))
    OR (target_type = 'distributor'
      AND distributor_id IS NOT NULL AND brand_id IS NULL
      AND EXISTS (SELECT 1 FROM public.distributors d WHERE d.id = portal_leads.distributor_id AND d.status = 'active'))
    OR (target_type = 'partner'
      AND brand_id IS NULL AND distributor_id IS NULL
      AND length(COALESCE(phone, '')) BETWEEN 6 AND 20
      AND length(COALESCE(city, '')) BETWEEN 1 AND 120)
  )
  AND (from_user_id IS NULL OR from_user_id = auth.uid())
);
