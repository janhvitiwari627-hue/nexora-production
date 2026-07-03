
DROP POLICY IF EXISTS "Authenticated can view submitted candidate profiles" ON public.candidate_profiles;

CREATE POLICY "Employers view applicants candidate profiles"
ON public.candidate_profiles
FOR SELECT
TO authenticated
USING (
  is_submitted = true
  AND EXISTS (
    SELECT 1 FROM public.job_applications ja
    WHERE ja.candidate_id = candidate_profiles.id
      AND ja.owner_id = auth.uid()
  )
);
