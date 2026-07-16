CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT saved_jobs_user_job_key UNIQUE (user_id, job_id)
);

ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON public.saved_jobs TO authenticated;

DROP POLICY IF EXISTS "Users read own saved jobs" ON public.saved_jobs;
CREATE POLICY "Users read own saved jobs"
  ON public.saved_jobs FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users save jobs for themselves" ON public.saved_jobs;
CREATE POLICY "Users save jobs for themselves"
  ON public.saved_jobs FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users remove own saved jobs" ON public.saved_jobs;
CREATE POLICY "Users remove own saved jobs"
  ON public.saved_jobs FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS saved_jobs_user_created_idx
  ON public.saved_jobs (user_id, created_at DESC);
