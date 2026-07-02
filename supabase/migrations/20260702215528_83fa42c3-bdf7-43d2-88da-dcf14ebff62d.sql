CREATE POLICY "Employers update applications for their jobs"
ON public.job_applications
FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_applications.job_id AND j.posted_by = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_applications.job_id AND j.posted_by = auth.uid()));