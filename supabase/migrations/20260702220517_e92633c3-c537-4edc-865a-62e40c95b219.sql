
-- candidate_profiles: add missing spec fields (keep existing avatar_url/phone/education)
ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS area text,
  ADD COLUMN IF NOT EXISTS experience_years numeric,
  ADD COLUMN IF NOT EXISTS preferred_job_role text,
  ADD COLUMN IF NOT EXISTS preferred_salary_min numeric,
  ADD COLUMN IF NOT EXISTS preferred_salary_max numeric,
  ADD COLUMN IF NOT EXISTS profile_status text NOT NULL DEFAULT 'submitted',
  ADD COLUMN IF NOT EXISTS is_complete boolean NOT NULL DEFAULT false;

-- jobs (acts as job_posts): add business_name
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS business_name text;

-- job_applications: add candidate_id / owner_id / applied_at fields
ALTER TABLE public.job_applications
  ADD COLUMN IF NOT EXISTS candidate_id uuid REFERENCES public.candidate_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS applied_at timestamptz NOT NULL DEFAULT now();

-- Backfill candidate_id / owner_id for existing rows
UPDATE public.job_applications ja
   SET candidate_id = cp.id
  FROM public.candidate_profiles cp
 WHERE ja.candidate_id IS NULL
   AND cp.user_id = ja.applicant_id;

UPDATE public.job_applications ja
   SET owner_id = j.posted_by
  FROM public.jobs j
 WHERE ja.owner_id IS NULL
   AND j.id = ja.job_id;

UPDATE public.job_applications
   SET applied_at = created_at
 WHERE applied_at IS NULL;

CREATE INDEX IF NOT EXISTS job_applications_candidate_id_idx ON public.job_applications(candidate_id);
CREATE INDEX IF NOT EXISTS job_applications_owner_id_idx ON public.job_applications(owner_id);

-- Auto-populate candidate_id / owner_id on insert so app code doesn't have to
CREATE OR REPLACE FUNCTION public.populate_job_application_refs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.candidate_id IS NULL THEN
    SELECT id INTO NEW.candidate_id FROM public.candidate_profiles WHERE user_id = NEW.applicant_id LIMIT 1;
  END IF;
  IF NEW.owner_id IS NULL THEN
    SELECT posted_by INTO NEW.owner_id FROM public.jobs WHERE id = NEW.job_id LIMIT 1;
  END IF;
  IF NEW.applied_at IS NULL THEN
    NEW.applied_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS job_applications_populate_refs ON public.job_applications;
CREATE TRIGGER job_applications_populate_refs
  BEFORE INSERT ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.populate_job_application_refs();
