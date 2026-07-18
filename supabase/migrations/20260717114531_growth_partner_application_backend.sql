-- Secure Growth Partner application workflow and private KYC documents.
-- Applicants must be signed in. No anonymous user can read personal or KYC data.

CREATE TABLE IF NOT EXISTS public.growth_partner_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL CHECK (char_length(trim(full_name)) BETWEEN 2 AND 100),
  mobile text NOT NULL CHECK (char_length(trim(mobile)) BETWEEN 7 AND 20),
  whatsapp_number text NOT NULL CHECK (char_length(trim(whatsapp_number)) BETWEEN 7 AND 20),
  email text NOT NULL CHECK (char_length(trim(email)) BETWEEN 5 AND 255),
  state text NOT NULL CHECK (char_length(trim(state)) BETWEEN 2 AND 80),
  district text NOT NULL CHECK (char_length(trim(district)) BETWEEN 2 AND 80),
  city text NOT NULL CHECK (char_length(trim(city)) BETWEEN 2 AND 80),
  current_work_type text NOT NULL CHECK (char_length(trim(current_work_type)) BETWEEN 2 AND 100),
  beauty_industry_experience text NOT NULL CHECK (char_length(trim(beauty_industry_experience)) BETWEEN 2 AND 500),
  salons_in_network integer NOT NULL DEFAULT 0 CHECK (salons_in_network >= 0 AND salons_in_network <= 100000),
  kyc_path text NOT NULL,
  terms_accepted_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected')),
  reviewer_note text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS growth_partner_applications_status_created_idx
  ON public.growth_partner_applications (status, created_at DESC);

ALTER TABLE public.growth_partner_applications ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.growth_partner_applications TO authenticated;

CREATE POLICY "Growth partner applicant reads own application"
  ON public.growth_partner_applications FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Growth partner admins read all applications"
  ON public.growth_partner_applications FOR SELECT TO authenticated
  USING (public.has_role((select auth.uid()), 'admin'));

CREATE POLICY "Growth partner applicant creates own application"
  ON public.growth_partner_applications FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Growth partner admins review applications"
  ON public.growth_partner_applications FOR UPDATE TO authenticated
  USING (public.has_role((select auth.uid()), 'admin'))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'));

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'partner-kyc',
  'partner-kyc',
  false,
  5242880,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Growth partner applicant uploads own KYC"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'partner-kyc'
    AND (storage.foldername(name))[1] = (select auth.uid()::text)
  );

CREATE POLICY "Growth partner applicant reads own KYC"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'partner-kyc'
    AND (
      (storage.foldername(name))[1] = (select auth.uid()::text)
      OR public.has_role((select auth.uid()), 'admin')
    )
  );

CREATE POLICY "Growth partner applicant replaces own KYC"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'partner-kyc'
    AND (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  WITH CHECK (
    bucket_id = 'partner-kyc'
    AND (storage.foldername(name))[1] = (select auth.uid()::text)
  );

CREATE POLICY "Growth partner applicant deletes own KYC"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'partner-kyc'
    AND (storage.foldername(name))[1] = (select auth.uid()::text)
  );
