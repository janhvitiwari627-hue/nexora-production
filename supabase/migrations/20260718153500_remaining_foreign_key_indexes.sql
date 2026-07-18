-- Cover the remaining foreign keys where an existing composite index does not
-- lead with the referenced column. No existing index or data is removed.
CREATE INDEX IF NOT EXISTS idx_favorites_salon_id
  ON public.favorites (salon_id);

CREATE INDEX IF NOT EXISTS idx_job_applications_applicant_id
  ON public.job_applications (applicant_id);

CREATE INDEX IF NOT EXISTS idx_review_reports_reporter_id
  ON public.review_reports (reporter_id);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id
  ON public.saved_jobs (job_id);

CREATE INDEX IF NOT EXISTS idx_shop_members_user_id
  ON public.shop_members (user_id);
