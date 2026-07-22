ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_language text NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'Asia/Kolkata';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND conname = 'profiles_preferred_language_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_preferred_language_check
      CHECK (preferred_language IN ('en', 'hi'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND conname = 'profiles_timezone_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_timezone_check
      CHECK (
        timezone IN (
          'Asia/Kolkata',
          'Asia/Dubai',
          'Asia/Singapore',
          'Europe/London',
          'America/New_York'
        )
      );
  END IF;
END;
$$;

COMMENT ON COLUMN public.profiles.preferred_language IS
  'Customer UI language preference: en or hi.';
COMMENT ON COLUMN public.profiles.timezone IS
  'Customer IANA timezone used to format regional dates and times.';

GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;

NOTIFY pgrst, 'reload schema';
