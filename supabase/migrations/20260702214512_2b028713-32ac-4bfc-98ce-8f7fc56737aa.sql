
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS job_role TEXT,
  ADD COLUMN IF NOT EXISTS work_location TEXT,
  ADD COLUMN IF NOT EXISTS contact_person TEXT,
  ADD COLUMN IF NOT EXISTS contact_mobile TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
  ADD COLUMN IF NOT EXISTS interview_mode TEXT,
  ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.salons(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS jobs_shop_id_idx ON public.jobs(shop_id);
