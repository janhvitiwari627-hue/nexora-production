
ALTER TABLE public.brands
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS owner_name text,
  ADD COLUMN IF NOT EXISTS gst_number text,
  ADD COLUMN IF NOT EXISTS pan_number text,
  ADD COLUMN IF NOT EXISTS business_type text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS pincode text,
  ADD COLUMN IF NOT EXISTS document_urls text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS gallery_urls text[] DEFAULT '{}'::text[];

ALTER TABLE public.distributors
  ADD COLUMN IF NOT EXISTS owner_name text,
  ADD COLUMN IF NOT EXISTS pan_number text,
  ADD COLUMN IF NOT EXISTS business_type text,
  ADD COLUMN IF NOT EXISTS document_urls text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS gallery_urls text[] DEFAULT '{}'::text[];
