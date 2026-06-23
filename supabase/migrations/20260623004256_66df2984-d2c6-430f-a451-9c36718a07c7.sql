
-- Brands table
CREATE TABLE public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  logo_url TEXT,
  cover_url TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  category TEXT,
  founded_year INT,
  hq_city TEXT,
  hq_state TEXT,
  country TEXT DEFAULT 'India',
  social_instagram TEXT,
  social_facebook TEXT,
  social_youtube TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_sponsored BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.brands TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brands TO authenticated;
GRANT ALL ON public.brands TO service_role;

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands are publicly viewable"
  ON public.brands FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can create their own brand"
  ON public.brands FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update their brand"
  ON public.brands FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can delete their brand"
  ON public.brands FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER set_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX brands_category_idx ON public.brands(category);
CREATE INDEX brands_state_idx ON public.brands(hq_state);

-- Distributors table
CREATE TABLE public.distributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  contact_person TEXT,
  description TEXT,
  logo_url TEXT,
  cover_url TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  gst_number TEXT,
  state TEXT,
  district TEXT,
  city TEXT,
  pincode TEXT,
  address TEXT,
  coverage_states TEXT[] DEFAULT '{}',
  categories TEXT[] DEFAULT '{}',
  brands_handled TEXT[] DEFAULT '{}',
  years_in_business INT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_sponsored BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.distributors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.distributors TO authenticated;
GRANT ALL ON public.distributors TO service_role;

ALTER TABLE public.distributors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Distributors are publicly viewable"
  ON public.distributors FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can create their own distributor"
  ON public.distributors FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update their distributor"
  ON public.distributors FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can delete their distributor"
  ON public.distributors FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER set_distributors_updated_at
  BEFORE UPDATE ON public.distributors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX distributors_state_idx ON public.distributors(state);

-- Brand products
CREATE TABLE public.brand_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  image_url TEXT,
  price NUMERIC(10,2),
  mrp NUMERIC(10,2),
  sku TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.brand_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brand_products TO authenticated;
GRANT ALL ON public.brand_products TO service_role;

ALTER TABLE public.brand_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active products are publicly viewable"
  ON public.brand_products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Brand owners manage their products"
  ON public.brand_products FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.brands b WHERE b.id = brand_id AND b.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.brands b WHERE b.id = brand_id AND b.user_id = auth.uid()));

CREATE TRIGGER set_brand_products_updated_at
  BEFORE UPDATE ON public.brand_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Lead opportunities (inquiries between salons/users and brands/distributors)
CREATE TABLE public.portal_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('brand','distributor')),
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  distributor_id UUID REFERENCES public.distributors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  city TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.portal_leads TO authenticated;
GRANT INSERT ON public.portal_leads TO anon;
GRANT ALL ON public.portal_leads TO service_role;

ALTER TABLE public.portal_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead"
  ON public.portal_leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Target owner views their leads"
  ON public.portal_leads FOR SELECT
  TO authenticated
  USING (
    (brand_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.brands b WHERE b.id = brand_id AND b.user_id = auth.uid()))
    OR (distributor_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.distributors d WHERE d.id = distributor_id AND d.user_id = auth.uid()))
    OR (from_user_id = auth.uid())
  );

CREATE POLICY "Target owner updates lead status"
  ON public.portal_leads FOR UPDATE
  TO authenticated
  USING (
    (brand_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.brands b WHERE b.id = brand_id AND b.user_id = auth.uid()))
    OR (distributor_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.distributors d WHERE d.id = distributor_id AND d.user_id = auth.uid()))
  );

CREATE INDEX portal_leads_brand_idx ON public.portal_leads(brand_id);
CREATE INDEX portal_leads_distributor_idx ON public.portal_leads(distributor_id);
