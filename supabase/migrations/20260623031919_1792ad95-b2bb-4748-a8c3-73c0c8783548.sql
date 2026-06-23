
-- 1) website_templates catalogue
CREATE TABLE public.website_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text NOT NULL,
  category text NOT NULL,
  preview_image text,
  template_slug text NOT NULL UNIQUE,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.website_templates TO anon, authenticated;
GRANT ALL ON public.website_templates TO service_role;

ALTER TABLE public.website_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active templates are public"
  ON public.website_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage templates"
  ON public.website_templates FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_website_templates_updated_at
BEFORE UPDATE ON public.website_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) salons — track template choice & website-created flag
ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS selected_template_id uuid REFERENCES public.website_templates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS website_created boolean NOT NULL DEFAULT false;

-- 3) Seed initial templates
INSERT INTO public.website_templates (template_name, category, template_slug, preview_image, description, sort_order) VALUES
  ('Royal Luxe',        'Salon',            'royal-luxe',        'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=70', 'Luxury black & gold. Full-screen hero, glassmorphism cards, premium animations.', 10),
  ('Beauty Blossom',    'Beauty Parlour',   'beauty-blossom',    'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=1200&q=70', 'Soft pink & rose gold. Instagram-style portfolio, elegant typography.', 20),
  ('Serene Spa',        'Spa',              'serene-spa',        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=70', 'Calm palette, soft gradients, mindful spacing for spa & wellness.', 30),
  ('Ink Canvas',        'Tattoo Studio',    'ink-canvas',        'https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?w=1200&q=70', 'Gallery-first layout to showcase artist portfolios.', 40),
  ('Nail Atelier',      'Nail Studio',      'nail-atelier',      'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&q=70', 'Playful pastels and grid-based service showcase.', 50),
  ('Glow Studio',       'Makeup Studio',    'glow-studio',       'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&q=70', 'High-fashion editorial layout with bold typography.', 60),
  ('Urban Pro',         'Barber Shop',      'urban-pro',         'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=70', 'Bold red & white. Service-first layout, fast booking focus.', 70),
  ('Multi Service Hub', 'Multi-Service',    'multi-service-hub', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&q=70', 'Flexible sections for clinics, massage & multi-service businesses.', 80);
