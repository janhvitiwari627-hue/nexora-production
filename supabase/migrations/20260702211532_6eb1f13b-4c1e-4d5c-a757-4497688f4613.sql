
CREATE TABLE public.candidate_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  phone text,
  city text,
  bio text,
  avatar_url text,
  skills text[] NOT NULL DEFAULT '{}',
  experience jsonb NOT NULL DEFAULT '[]'::jsonb,
  education jsonb NOT NULL DEFAULT '[]'::jsonb,
  certifications text[] NOT NULL DEFAULT '{}',
  portfolio_urls text[] NOT NULL DEFAULT '{}',
  video_url text,
  resume_url text,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_submitted boolean NOT NULL DEFAULT false,
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidate_profiles TO authenticated;
GRANT ALL ON public.candidate_profiles TO service_role;

ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own candidate profile"
  ON public.candidate_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated can view submitted candidate profiles"
  ON public.candidate_profiles
  FOR SELECT
  TO authenticated
  USING (is_submitted = true);

CREATE TRIGGER update_candidate_profiles_updated_at
  BEFORE UPDATE ON public.candidate_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
