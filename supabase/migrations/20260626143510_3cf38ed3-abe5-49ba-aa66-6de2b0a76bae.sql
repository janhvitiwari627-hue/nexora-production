
-- 1) brands PII
DROP POLICY IF EXISTS "Brands are publicly viewable" ON public.brands;

CREATE POLICY "Owners view their brand"
  ON public.brands FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view brands"
  ON public.brands FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE VIEW public.brands_public
WITH (security_invoker = true) AS
SELECT id, slug, name, tagline, description, logo_url, cover_url, website,
       category, founded_year, hq_city, hq_state, country,
       social_instagram, social_facebook, social_youtube,
       is_featured, is_sponsored, status, created_at, gallery_urls, company_name
FROM public.brands
WHERE status = 'active';

GRANT SELECT ON public.brands_public TO anon, authenticated;

-- 2) distributors PII
DROP POLICY IF EXISTS "Distributors are publicly viewable" ON public.distributors;

CREATE POLICY "Owners view their distributor"
  ON public.distributors FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view distributors"
  ON public.distributors FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE VIEW public.distributors_public
WITH (security_invoker = true) AS
SELECT id, slug, company_name, description, logo_url, cover_url, website,
       state, district, city,
       coverage_states, coverage_districts, categories, brands_handled,
       years_in_business, is_featured, is_sponsored, status, created_at,
       gallery_urls
FROM public.distributors
WHERE status = 'active';

GRANT SELECT ON public.distributors_public TO anon, authenticated;

-- 3) partner_hall_of_fame
DROP POLICY IF EXISTS "HoF: public view" ON public.partner_hall_of_fame;

CREATE POLICY "HoF: authenticated view"
  ON public.partner_hall_of_fame FOR SELECT
  TO authenticated
  USING (true);

CREATE OR REPLACE VIEW public.partner_hall_of_fame_public
WITH (security_invoker = true) AS
SELECT id, partner_id, rank, category, active_shops,
       achievements, success_story, badge,
       featured_from, featured_to, created_at, updated_at
FROM public.partner_hall_of_fame;

GRANT SELECT ON public.partner_hall_of_fame_public TO anon, authenticated;

-- 4) partner_leaderboard
DROP POLICY IF EXISTS "LB: public view" ON public.partner_leaderboard;

CREATE POLICY "LB: authenticated view"
  ON public.partner_leaderboard FOR SELECT
  TO authenticated
  USING (true);

CREATE OR REPLACE VIEW public.partner_leaderboard_public
WITH (security_invoker = true) AS
SELECT id, partner_id, period, period_start, period_end, scope,
       district, state, rank, active_shops, score, computed_at, created_at
FROM public.partner_leaderboard;

GRANT SELECT ON public.partner_leaderboard_public TO anon, authenticated;

-- 5) rewards_ledger admin policy
CREATE POLICY "Admins manage rewards"
  ON public.rewards_ledger FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 6) staff: drop redundant SELECT policy
DROP POLICY IF EXISTS "Staff readable by salon owners and admins" ON public.staff;

-- 7) Tighten always-true INSERT policy on portal_leads
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.portal_leads;

CREATE POLICY "Anyone can submit a lead"
  ON public.portal_leads FOR INSERT
  WITH CHECK (
    target_type IN ('brand','distributor')
    AND length(coalesce(name,'')) BETWEEN 1 AND 200
    AND length(coalesce(message,'')) BETWEEN 1 AND 2000
    AND status = 'new'
    AND (
      (target_type = 'brand' AND brand_id IS NOT NULL AND distributor_id IS NULL
       AND EXISTS (SELECT 1 FROM public.brands b WHERE b.id = brand_id AND b.status='active'))
      OR
      (target_type = 'distributor' AND distributor_id IS NOT NULL AND brand_id IS NULL
       AND EXISTS (SELECT 1 FROM public.distributors d WHERE d.id = distributor_id AND d.status='active'))
    )
    AND (from_user_id IS NULL OR from_user_id = auth.uid())
  );

-- 8) Revoke EXECUTE from anon on SECURITY DEFINER functions that shouldn't be public
REVOKE EXECUTE ON FUNCTION public.recompute_partner_dashboard_metrics(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.recompute_partner_leaderboard(dbp_leaderboard_period) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.list_salon_staff(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_district_partner(uuid, uuid) FROM anon, public;
