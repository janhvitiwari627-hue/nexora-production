
ALTER TABLE public.district_business_partners DROP COLUMN IF EXISTS bank_account;

DROP POLICY IF EXISTS "Admins can view all leads" ON public.portal_leads;
CREATE POLICY "Admins can view all leads"
  ON public.portal_leads FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can view active promotions" ON public.promotions;
DROP POLICY IF EXISTS "Authenticated can view promotions" ON public.promotions;
CREATE POLICY "Anyone can view active promotions"
  ON public.promotions FOR SELECT
  TO anon
  USING (status = 'active');
CREATE POLICY "Authenticated can view promotions"
  ON public.promotions FOR SELECT
  TO authenticated
  USING (
    status = 'active'
    OR EXISTS (SELECT 1 FROM public.brands b WHERE b.id = promotions.brand_id AND b.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

DROP POLICY IF EXISTS "Admins manage templates" ON public.website_templates;
CREATE POLICY "Admins manage templates"
  ON public.website_templates FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

REVOKE SELECT ON public.salons FROM anon;
GRANT SELECT (
  id, name, category, rating, reviews_count, price_range, discount, location, distance,
  description, is_verified, image_url, created_at, updated_at, latitude, longitude, slug,
  address, phone, gallery_images, tagline, brand_primary, brand_secondary, theme, custom_css,
  seo_title, seo_description, hours, city, pincode, whatsapp, website_url, logo_url,
  cover_image_url, amenities, is_home_service, is_active, nexora_score, rank_in_city,
  selected_template_id, website_created, selected_template_key
) ON public.salons TO anon;
