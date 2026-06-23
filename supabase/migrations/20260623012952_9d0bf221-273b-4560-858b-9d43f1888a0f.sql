
CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.brand_products(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_category TEXT,
  target_state TEXT,
  target_district TEXT,
  budget NUMERIC(10,2),
  banner_url TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  impressions INT NOT NULL DEFAULT 0,
  clicks INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.promotions TO authenticated;
GRANT SELECT ON public.promotions TO anon;
GRANT ALL ON public.promotions TO service_role;

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active promotions"
  ON public.promotions FOR SELECT
  USING (status = 'active' OR EXISTS (
    SELECT 1 FROM public.brands b WHERE b.id = promotions.brand_id AND b.user_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Brand owners can insert promotions"
  ON public.promotions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.brands b WHERE b.id = brand_id AND b.user_id = auth.uid()
  ));

CREATE POLICY "Brand owners can update their promotions"
  ON public.promotions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.brands b WHERE b.id = brand_id AND b.user_id = auth.uid()
  ));

CREATE POLICY "Brand owners can delete their promotions"
  ON public.promotions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.brands b WHERE b.id = brand_id AND b.user_id = auth.uid()
  ));

CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_promotions_brand ON public.promotions(brand_id);
CREATE INDEX idx_promotions_status ON public.promotions(status);
