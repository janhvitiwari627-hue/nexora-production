ALTER TABLE public.website_templates
  ADD COLUMN IF NOT EXISTS template_key text,
  ADD COLUMN IF NOT EXISTS theme_type text,
  ADD COLUMN IF NOT EXISTS primary_color text,
  ADD COLUMN IF NOT EXISTS secondary_color text,
  ADD COLUMN IF NOT EXISTS background_color text,
  ADD COLUMN IF NOT EXISTS card_color text,
  ADD COLUMN IF NOT EXISTS text_color text,
  ADD COLUMN IF NOT EXISTS hero_type text,
  ADD COLUMN IF NOT EXISTS template_config_json jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.website_templates
SET template_key = COALESCE(template_key, template_slug)
WHERE template_key IS NULL;

ALTER TABLE public.website_templates
  ALTER COLUMN template_key SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS website_templates_template_key_key
  ON public.website_templates (template_key);

ALTER TABLE public.salon_owners
  ADD COLUMN IF NOT EXISTS selected_template_id uuid REFERENCES public.website_templates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS selected_template_key text;

ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS selected_template_key text;

GRANT SELECT ON public.website_templates TO anon;
GRANT SELECT ON public.website_templates TO authenticated;
GRANT ALL ON public.website_templates TO service_role;
GRANT SELECT, UPDATE ON public.salon_owners TO authenticated;
GRANT ALL ON public.salon_owners TO service_role;
GRANT SELECT, UPDATE ON public.salons TO authenticated;
GRANT ALL ON public.salons TO service_role;