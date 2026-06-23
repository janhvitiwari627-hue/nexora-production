
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS block text,
  ADD COLUMN IF NOT EXISTS pincode text;
