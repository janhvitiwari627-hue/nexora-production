
-- Employer profiles
CREATE TABLE public.employer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employer_profiles TO authenticated;
GRANT ALL ON public.employer_profiles TO service_role;
ALTER TABLE public.employer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employers manage own profile" ON public.employer_profiles
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER employer_profiles_updated_at BEFORE UPDATE ON public.employer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Jobs
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES public.employer_profiles(id) ON DELETE CASCADE,
  posted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  job_type TEXT NOT NULL,
  experience_level TEXT,
  city TEXT NOT NULL,
  area TEXT,
  address TEXT,
  schedule TEXT,
  salary_min NUMERIC(10,2),
  salary_max NUMERIC(10,2),
  salary_period TEXT DEFAULT 'monthly',
  benefits TEXT[] DEFAULT '{}',
  requirements TEXT,
  skills TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  applicants_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.jobs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published jobs are public" ON public.jobs
  FOR SELECT USING (status = 'published' OR posted_by = auth.uid());
CREATE POLICY "Employers insert own jobs" ON public.jobs
  FOR INSERT WITH CHECK (posted_by = auth.uid());
CREATE POLICY "Employers update own jobs" ON public.jobs
  FOR UPDATE USING (posted_by = auth.uid()) WITH CHECK (posted_by = auth.uid());
CREATE POLICY "Employers delete own jobs" ON public.jobs
  FOR DELETE USING (posted_by = auth.uid());
CREATE TRIGGER jobs_updated_at BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_jobs_status_published ON public.jobs(status, published_at DESC);
CREATE INDEX idx_jobs_employer ON public.jobs(employer_id);

-- Job applications
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cover_note TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(job_id, applicant_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_applications TO authenticated;
GRANT ALL ON public.job_applications TO service_role;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Applicants see own applications" ON public.job_applications
  FOR SELECT USING (
    auth.uid() = applicant_id
    OR EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.posted_by = auth.uid())
  );
CREATE POLICY "Applicants insert own applications" ON public.job_applications
  FOR INSERT WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "Applicants update own applications" ON public.job_applications
  FOR UPDATE USING (auth.uid() = applicant_id) WITH CHECK (auth.uid() = applicant_id);
CREATE TRIGGER job_applications_updated_at BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
