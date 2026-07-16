
-- =========================================
-- USER_WEBSITES
-- =========================================
CREATE TABLE public.user_websites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  salon_id uuid REFERENCES public.salons(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.website_templates(id),
  template_key text,
  subdomain text UNIQUE,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  draft_updated_at timestamptz NOT NULL DEFAULT now(),
  published_snapshot jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_websites_owner ON public.user_websites(owner_id);
CREATE INDEX idx_user_websites_salon ON public.user_websites(salon_id);
CREATE INDEX idx_user_websites_published ON public.user_websites(is_published) WHERE is_published = true;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_websites TO authenticated;
GRANT SELECT ON public.user_websites TO anon;
GRANT ALL ON public.user_websites TO service_role;

ALTER TABLE public.user_websites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own websites"
  ON public.user_websites FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Public can view published websites"
  ON public.user_websites FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins manage all websites"
  ON public.user_websites FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_user_websites_updated_at
  BEFORE UPDATE ON public.user_websites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- WEBSITE_SECTIONS
-- =========================================
CREATE TABLE public.website_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id uuid NOT NULL REFERENCES public.user_websites(id) ON DELETE CASCADE,
  section_type text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_website_sections_website ON public.website_sections(website_id, sort_order);
CREATE INDEX idx_website_sections_type ON public.website_sections(website_id, section_type);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.website_sections TO authenticated;
GRANT SELECT ON public.website_sections TO anon;
GRANT ALL ON public.website_sections TO service_role;

ALTER TABLE public.website_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own sections"
  ON public.website_sections FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_websites w
     WHERE w.id = website_sections.website_id
       AND w.owner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_websites w
     WHERE w.id = website_sections.website_id
       AND w.owner_id = auth.uid()
  ));

CREATE POLICY "Public can view sections of published websites"
  ON public.website_sections FOR SELECT
  TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_websites w
     WHERE w.id = website_sections.website_id
       AND w.is_published = true
  ));

CREATE POLICY "Admins manage all sections"
  ON public.website_sections FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_website_sections_updated_at
  BEFORE UPDATE ON public.website_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- WEBSITE_THEME
-- =========================================
CREATE TABLE public.website_theme (
  website_id uuid PRIMARY KEY REFERENCES public.user_websites(id) ON DELETE CASCADE,
  primary_color text NOT NULL DEFAULT '#111827',
  secondary_color text NOT NULL DEFAULT '#F59E0B',
  accent_color text NOT NULL DEFAULT '#10B981',
  background_color text NOT NULL DEFAULT '#FFFFFF',
  text_color text NOT NULL DEFAULT '#111827',
  heading_font text NOT NULL DEFAULT 'Inter',
  body_font text NOT NULL DEFAULT 'Inter',
  button_style text NOT NULL DEFAULT 'rounded',
  extras jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.website_theme TO authenticated;
GRANT SELECT ON public.website_theme TO anon;
GRANT ALL ON public.website_theme TO service_role;

ALTER TABLE public.website_theme ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own theme"
  ON public.website_theme FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_websites w
     WHERE w.id = website_theme.website_id
       AND w.owner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_websites w
     WHERE w.id = website_theme.website_id
       AND w.owner_id = auth.uid()
  ));

CREATE POLICY "Public can view theme of published websites"
  ON public.website_theme FOR SELECT
  TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_websites w
     WHERE w.id = website_theme.website_id
       AND w.is_published = true
  ));

CREATE POLICY "Admins manage all themes"
  ON public.website_theme FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_website_theme_updated_at
  BEFORE UPDATE ON public.website_theme
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- WEBSITE_VERSIONS (undo/history)
-- =========================================
CREATE TABLE public.website_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id uuid NOT NULL REFERENCES public.user_websites(id) ON DELETE CASCADE,
  snapshot jsonb NOT NULL,
  note text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_website_versions_website ON public.website_versions(website_id, created_at DESC);

GRANT SELECT, INSERT, DELETE ON public.website_versions TO authenticated;
GRANT ALL ON public.website_versions TO service_role;

ALTER TABLE public.website_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own versions"
  ON public.website_versions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_websites w
     WHERE w.id = website_versions.website_id
       AND w.owner_id = auth.uid()
  ));

CREATE POLICY "Owners insert own versions"
  ON public.website_versions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_websites w
     WHERE w.id = website_versions.website_id
       AND w.owner_id = auth.uid()
  ));

CREATE POLICY "Owners delete own versions"
  ON public.website_versions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.user_websites w
     WHERE w.id = website_versions.website_id
       AND w.owner_id = auth.uid()
  ));

CREATE POLICY "Admins manage all versions"
  ON public.website_versions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- =========================================
-- MEDIA_LIBRARY
-- =========================================
CREATE TABLE public.media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  website_id uuid REFERENCES public.user_websites(id) ON DELETE SET NULL,
  url text NOT NULL,
  storage_path text,
  file_name text,
  mime_type text,
  size_bytes integer,
  folder text NOT NULL DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_media_library_owner ON public.media_library(owner_id, created_at DESC);
CREATE INDEX idx_media_library_website ON public.media_library(website_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_library TO authenticated;
GRANT ALL ON public.media_library TO service_role;

ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own media"
  ON public.media_library FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Admins manage all media"
  ON public.media_library FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- =========================================
-- Helper: create user website from template
-- =========================================
CREATE OR REPLACE FUNCTION public.create_user_website_from_template(
  _template_id uuid,
  _salon_id uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  tpl public.website_templates%ROWTYPE;
  new_website_id uuid;
  default_sections jsonb;
  section jsonb;
  idx int := 0;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT * INTO tpl FROM public.website_templates WHERE id = _template_id AND is_active = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'Template not found'; END IF;

  -- Verify salon ownership if provided
  IF _salon_id IS NOT NULL AND NOT public.is_salon_owner(uid, _salon_id) THEN
    RAISE EXCEPTION 'Not the owner of this salon';
  END IF;

  INSERT INTO public.user_websites (owner_id, salon_id, template_id, template_key)
  VALUES (uid, _salon_id, tpl.id, tpl.template_key)
  RETURNING id INTO new_website_id;

  -- Default theme row
  INSERT INTO public.website_theme (website_id) VALUES (new_website_id);

  -- Default sections skeleton (empty JSON, owner will fill via editor)
  default_sections := jsonb_build_array(
    jsonb_build_object('type','hero',       'content', jsonb_build_object('heading','Welcome','subheading','','buttonText','Book Now','buttonLink','#services','imageUrl','')),
    jsonb_build_object('type','about',      'content', jsonb_build_object('heading','About Us','body','')),
    jsonb_build_object('type','services',   'content', jsonb_build_object('heading','Our Services','items','[]'::jsonb)),
    jsonb_build_object('type','rate_card',  'content', jsonb_build_object('heading','Rate Card','items','[]'::jsonb)),
    jsonb_build_object('type','packages',   'content', jsonb_build_object('heading','Packages','items','[]'::jsonb)),
    jsonb_build_object('type','offers',     'content', jsonb_build_object('heading','Current Offers','items','[]'::jsonb)),
    jsonb_build_object('type','staff',      'content', jsonb_build_object('heading','Meet the Team','items','[]'::jsonb)),
    jsonb_build_object('type','membership', 'content', jsonb_build_object('heading','Membership','items','[]'::jsonb)),
    jsonb_build_object('type','gallery',    'content', jsonb_build_object('heading','Gallery','images','[]'::jsonb)),
    jsonb_build_object('type','blog',       'content', jsonb_build_object('heading','Blog','posts','[]'::jsonb)),
    jsonb_build_object('type','contact',    'content', jsonb_build_object('heading','Contact Us','phone','','whatsapp','','email','','address','','mapEmbed',''))
  );

  FOR section IN SELECT * FROM jsonb_array_elements(default_sections) LOOP
    INSERT INTO public.website_sections (website_id, section_type, content, sort_order)
    VALUES (new_website_id, section->>'type', section->'content', idx);
    idx := idx + 1;
  END LOOP;

  RETURN new_website_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_user_website_from_template(uuid, uuid) TO authenticated;
