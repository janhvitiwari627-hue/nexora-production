
-- Ensure RLS is enabled on all three tables
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- candidate_profiles: admin read all
DROP POLICY IF EXISTS "Admins view all candidate profiles" ON public.candidate_profiles;
CREATE POLICY "Admins view all candidate profiles"
  ON public.candidate_profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_super_admin(auth.uid()));

-- jobs: replace anon-readable published policy with authenticated-only, keep owner access
DROP POLICY IF EXISTS "Published jobs are public" ON public.jobs;
CREATE POLICY "Authenticated can view published jobs"
  ON public.jobs FOR SELECT
  TO authenticated
  USING (
    status = 'published'
    OR posted_by = auth.uid()
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.is_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Admins manage all jobs" ON public.jobs;
CREATE POLICY "Admins manage all jobs"
  ON public.jobs FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_super_admin(auth.uid()));

-- job_applications: admin manage all
DROP POLICY IF EXISTS "Admins manage all applications" ON public.job_applications;
CREATE POLICY "Admins manage all applications"
  ON public.job_applications FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_super_admin(auth.uid()));
