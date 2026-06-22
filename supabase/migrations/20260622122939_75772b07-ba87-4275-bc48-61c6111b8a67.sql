ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS pincode TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS is_home_service BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS is_home_service BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_salons_city ON public.salons(city);
CREATE INDEX IF NOT EXISTS idx_salons_active ON public.salons(is_active);