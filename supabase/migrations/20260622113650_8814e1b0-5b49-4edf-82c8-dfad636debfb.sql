
ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT '{}'::text[];

-- Backfill slugs from name where missing
UPDATE public.salons
SET slug = lower(regexp_replace(regexp_replace(coalesce(name,'salon-' || substr(id::text,1,8)), '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'))
       || '-' || substr(id::text, 1, 6)
WHERE slug IS NULL;

ALTER TABLE public.salons ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS salons_slug_unique ON public.salons(slug);
