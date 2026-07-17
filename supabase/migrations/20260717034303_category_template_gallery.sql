CREATE TABLE IF NOT EXISTS public.website_template_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.website_template_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active website template categories are readable"
  ON public.website_template_categories FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins manage website template categories"
  ON public.website_template_categories FOR ALL
  TO authenticated
  USING (public.has_role((select auth.uid()), 'admin'::app_role))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'::app_role));

GRANT SELECT ON public.website_template_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.website_template_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.website_templates TO authenticated;

ALTER TABLE public.website_templates
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.website_template_categories(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS preview_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS theme_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS section_schema jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

ALTER TABLE public.user_websites
  ADD COLUMN IF NOT EXISTS business_category_id uuid REFERENCES public.website_template_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS business_category text;

CREATE INDEX IF NOT EXISTS idx_website_template_categories_active_sort
  ON public.website_template_categories(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_website_templates_category_active_sort
  ON public.website_templates(category_id, is_active, sort_order);

INSERT INTO public.website_template_categories (name, slug, icon, sort_order) VALUES
  ('Hair Salon', 'hair-salon', 'scissors', 10),
  ('Beauty Parlour', 'beauty-parlour', 'sparkles', 20),
  ('Spa', 'spa', 'leaf', 30),
  ('Tattoo', 'tattoo', 'pen-tool', 40),
  ('Nail Art', 'nail-art', 'palette', 50),
  ('Massage', 'massage', 'heart-handshake', 60),
  ('Barber', 'barber', 'badge', 70)
ON CONFLICT (slug) DO UPDATE SET
  name = excluded.name,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  is_active = true;

WITH seed(name, slug, category, description, image, primary_color, secondary_color, background_color, text_color, sort_order) AS (VALUES
  ('Modern Hair Studio', 'modern-hair-studio', 'Hair Salon', 'Bright split-hero layout for modern cuts, colour and stylists.', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=75', '#4F46E5', '#F59E0B', '#F8FAFC', '#0F172A', 101),
  ('Luxury Hair Lounge', 'luxury-hair-lounge', 'Hair Salon', 'Editorial black-and-gold experience for premium hair lounges.', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=75', '#D4AF37', '#F5E6C8', '#0B0B0B', '#FFFFFF', 102),
  ('Unisex Salon Pro', 'unisex-salon-pro', 'Hair Salon', 'Fast service-first booking layout for busy unisex salons.', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=75', '#0F766E', '#FB7185', '#F0FDFA', '#134E4A', 103),
  ('Bridal Beauty Studio', 'bridal-beauty-studio', 'Beauty Parlour', 'Bridal package-led design with portfolios and consultation CTA.', 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1000&q=75', '#BE185D', '#F9A8D4', '#FFF7FA', '#3F1630', 201),
  ('Elegant Beauty Parlour', 'elegant-beauty-parlour', 'Beauty Parlour', 'Soft, trusted and service-rich layout for neighbourhood parlours.', 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1000&q=75', '#9D174D', '#FBCFE8', '#FFFBFE', '#4A1735', 202),
  ('Makeup Artist Portfolio', 'makeup-artist-portfolio', 'Beauty Parlour', 'Visual portfolio-first layout for makeup artists and studios.', 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1000&q=75', '#111827', '#E11D48', '#F5F3EE', '#1A1A1A', 203),
  ('Luxury Wellness Spa', 'luxury-wellness-spa', 'Spa', 'Immersive wellness journey with therapies, packages and membership.', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=75', '#365314', '#D9F99D', '#F7FEE7', '#1A2E05', 301),
  ('Ayurveda & Relaxation', 'ayurveda-relaxation', 'Spa', 'Warm natural design for Ayurveda rituals and healing packages.', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=75', '#92400E', '#FDE68A', '#FFFBEB', '#451A03', 302),
  ('Minimal Spa Retreat', 'minimal-spa-retreat', 'Spa', 'Calm whitespace-led layout focused on therapies and easy booking.', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=75', '#0F766E', '#99F6E4', '#F8FAFC', '#134E4A', 303),
  ('Dark Ink Studio', 'dark-ink-studio', 'Tattoo', 'Bold dark portfolio with tattoo styles, artists and aftercare.', 'https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?auto=format&fit=crop&w=1000&q=75', '#EF4444', '#A3A3A3', '#09090B', '#FAFAFA', 401),
  ('Urban Tattoo Artist', 'urban-tattoo-artist', 'Tattoo', 'Street-inspired artist profile with flash gallery and booking.', 'https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?auto=format&fit=crop&w=1000&q=75', '#7C3AED', '#22D3EE', '#111827', '#F9FAFB', 402),
  ('Premium Tattoo Portfolio', 'premium-tattoo-portfolio', 'Tattoo', 'Refined monochrome showcase for premium custom tattoo work.', 'https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?auto=format&fit=crop&w=1000&q=75', '#F5F5F4', '#A8A29E', '#1C1917', '#FAFAF9', 403),
  ('Pastel Nail Studio', 'pastel-nail-studio', 'Nail Art', 'Playful pastel grid for nail designs, services and packages.', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1000&q=75', '#A855F7', '#F9A8D4', '#FDF4FF', '#581C87', 501),
  ('Luxury Nail Bar', 'luxury-nail-bar', 'Nail Art', 'Polished editorial layout for premium nail bars and memberships.', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1000&q=75', '#C084FC', '#FDE68A', '#18181B', '#FAFAFA', 502),
  ('Creative Nail Artist', 'creative-nail-artist', 'Nail Art', 'Portfolio-first creator page for custom nail artists.', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1000&q=75', '#DB2777', '#22D3EE', '#FFF1F2', '#4C0519', 503),
  ('Therapeutic Massage', 'therapeutic-massage', 'Massage', 'Clinical-trust layout for therapeutic massage and recovery.', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1000&q=75', '#0369A1', '#BAE6FD', '#F0F9FF', '#0C4A6E', 601),
  ('Relaxation Massage Center', 'relaxation-massage-center', 'Massage', 'Warm calming design for relaxation and wellness packages.', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1000&q=75', '#A16207', '#FDE68A', '#FFFBEB', '#422006', 602),
  ('Premium Body Wellness', 'premium-body-wellness', 'Massage', 'Luxury membership-focused body wellness experience.', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1000&q=75', '#C4B5FD', '#FBCFE8', '#171024', '#FAF5FF', 603),
  ('Classic Barber Shop', 'classic-barber-shop', 'Barber', 'Traditional shopfront layout with price list and barber team.', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=75', '#B91C1C', '#F5F5F4', '#1C1917', '#FAFAF9', 701),
  ('Modern Men''s Grooming', 'modern-mens-grooming', 'Barber', 'Clean modern booking layout for cuts, fades and grooming.', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=75', '#2563EB', '#93C5FD', '#F8FAFC', '#0F172A', 702),
  ('Royal Beard & Hair Studio', 'royal-beard-hair-studio', 'Barber', 'Royal dark-and-gold brand experience for premium grooming.', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=75', '#D4AF37', '#FDE68A', '#0C0A09', '#FAFAF9', 703)
)
INSERT INTO public.website_templates (
  template_name, category, category_id, template_slug, template_key, description,
  preview_image, thumbnail_url, primary_color, secondary_color, background_color,
  text_color, template_config_json, preview_data, theme_config, section_schema,
  is_active, sort_order
)
SELECT
  seed.name, seed.category, category.id, seed.slug, seed.slug, seed.description,
  seed.image, seed.image, seed.primary_color, seed.secondary_color, seed.background_color,
  seed.text_color, jsonb_build_object('catalog_version', 1),
  jsonb_build_object('business_category', seed.category),
  jsonb_build_object('primary', seed.primary_color, 'secondary', seed.secondary_color, 'background', seed.background_color, 'text', seed.text_color),
  '[]'::jsonb, true, seed.sort_order
FROM seed
JOIN public.website_template_categories category ON category.name = seed.category
ON CONFLICT (template_key) DO UPDATE SET
  template_name = excluded.template_name,
  category = excluded.category,
  category_id = excluded.category_id,
  description = excluded.description,
  preview_image = excluded.preview_image,
  thumbnail_url = excluded.thumbnail_url,
  primary_color = excluded.primary_color,
  secondary_color = excluded.secondary_color,
  background_color = excluded.background_color,
  text_color = excluded.text_color,
  theme_config = excluded.theme_config,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();

UPDATE public.user_websites website
SET business_category_id = category.id
FROM public.website_template_categories category
WHERE website.business_category_id IS NULL
  AND website.business_category = category.name;

WITH distinct_thumbnails(slug, image) AS (VALUES
  ('luxury-hair-lounge', 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1000&q=75'),
  ('unisex-salon-pro', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=75'),
  ('elegant-beauty-parlour', 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1000&q=75'),
  ('makeup-artist-portfolio', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=75'),
  ('ayurveda-relaxation', 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1000&q=75'),
  ('minimal-spa-retreat', 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1000&q=75'),
  ('urban-tattoo-artist', 'https://images.unsplash.com/photo-1542727365-19732a80dcfd?auto=format&fit=crop&w=1000&q=75'),
  ('premium-tattoo-portfolio', 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=1000&q=75'),
  ('luxury-nail-bar', 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=1000&q=75'),
  ('creative-nail-artist', 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=1000&q=75'),
  ('relaxation-massage-center', 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=1000&q=75'),
  ('premium-body-wellness', 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1000&q=75'),
  ('modern-mens-grooming', 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1000&q=75'),
  ('royal-beard-hair-studio', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1000&q=75')
)
UPDATE public.website_templates template
SET preview_image = distinct_thumbnails.image,
    thumbnail_url = distinct_thumbnails.image
FROM distinct_thumbnails
WHERE template.template_key = distinct_thumbnails.slug;
