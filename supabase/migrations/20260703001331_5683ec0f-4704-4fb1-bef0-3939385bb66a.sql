
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS business_type text,
  ADD COLUMN IF NOT EXISTS location_type text,
  ADD COLUMN IF NOT EXISTS working_days jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS start_time text,
  ADD COLUMN IF NOT EXISTS end_time text,
  ADD COLUMN IF NOT EXISTS flexible_schedule boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS joining_date_type text,
  ADD COLUMN IF NOT EXISTS salary_type text,
  ADD COLUMN IF NOT EXISTS certification_requirement text,
  ADD COLUMN IF NOT EXISTS language_preferences jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS portfolio_required boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS portfolio_type text,
  ADD COLUMN IF NOT EXISTS resume_preferred boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS screening_questions jsonb NOT NULL DEFAULT '[]'::jsonb;
