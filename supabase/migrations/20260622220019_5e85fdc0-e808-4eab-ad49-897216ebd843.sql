
-- =====================================================================
-- DISTRICT BUSINESS PARTNER (DBP) BACKEND
-- =====================================================================

-- ---------- ENUMS ----------
DO $$ BEGIN
  CREATE TYPE public.dbp_status AS ENUM ('pending','verified','suspended','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.dbp_tier AS ENUM ('welcome','recognition','growth_builder','platinum','leadership_circle');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.dbp_reward_status AS ENUM ('pending','dispatched','delivered','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.dbp_earning_type AS ENUM ('activation_reward','growth_share','bonus','milestone_bonus');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.dbp_earning_status AS ENUM ('pending','approved','paid','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.dbp_payout_status AS ENUM ('pending','processing','paid','failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.dbp_leaderboard_period AS ENUM ('weekly','monthly','all_time');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================================
-- 1) district_business_partners
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.district_business_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  mobile TEXT,
  email TEXT,
  district TEXT NOT NULL,
  state TEXT,
  pincode TEXT,
  tagline TEXT,
  success_story TEXT,
  photo_url TEXT,
  status public.dbp_status NOT NULL DEFAULT 'pending',
  tier public.dbp_tier NOT NULL DEFAULT 'welcome',
  hall_of_fame BOOLEAN NOT NULL DEFAULT false,
  hall_of_fame_rank INT,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  bank_account JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);
GRANT SELECT ON public.district_business_partners TO anon;
GRANT SELECT, INSERT, UPDATE ON public.district_business_partners TO authenticated;
GRANT ALL ON public.district_business_partners TO service_role;
ALTER TABLE public.district_business_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "DBP: public can view verified partners"
  ON public.district_business_partners FOR SELECT
  USING (status = 'verified');

CREATE POLICY "DBP: owner can view own row"
  ON public.district_business_partners FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "DBP: admin can view all"
  ON public.district_business_partners FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "DBP: user can apply (insert own)"
  ON public.district_business_partners FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "DBP: owner can update own profile fields"
  ON public.district_business_partners FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "DBP: admin can update all"
  ON public.district_business_partners FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Helper: is_district_partner(_user_id, _partner_id)
CREATE OR REPLACE FUNCTION public.is_district_partner(_user_id UUID, _partner_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.district_business_partners
    WHERE id = _partner_id AND user_id = _user_id
  );
$$;

-- =====================================================================
-- 2) partner_shop_mapping (shops onboarded by a partner)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.partner_shop_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.district_business_partners(id) ON DELETE CASCADE,
  salon_id UUID REFERENCES public.salons(id) ON DELETE SET NULL,
  shop_name TEXT NOT NULL,
  owner_name TEXT,
  mobile TEXT,
  area TEXT,
  city TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  activated_at TIMESTAMPTZ,
  revenue_generated NUMERIC(12,2) NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_shop_mapping TO authenticated;
GRANT ALL ON public.partner_shop_mapping TO service_role;
ALTER TABLE public.partner_shop_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mapping: owner manage" ON public.partner_shop_mapping
  FOR ALL TO authenticated
  USING (public.is_district_partner(auth.uid(), partner_id))
  WITH CHECK (public.is_district_partner(auth.uid(), partner_id));

CREATE POLICY "Mapping: admin manage" ON public.partner_shop_mapping
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_partner_shop_mapping_partner ON public.partner_shop_mapping(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_shop_mapping_active ON public.partner_shop_mapping(partner_id, is_active);

-- =====================================================================
-- 3) partner_rewards
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.partner_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.district_business_partners(id) ON DELETE CASCADE,
  reward_code TEXT NOT NULL,
  reward_name TEXT NOT NULL,
  tier public.dbp_tier,
  shops_required INT,
  status public.dbp_reward_status NOT NULL DEFAULT 'pending',
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  dispatched_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  tracking_id TEXT,
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.partner_rewards TO authenticated;
GRANT ALL ON public.partner_rewards TO service_role;
ALTER TABLE public.partner_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rewards: owner view" ON public.partner_rewards
  FOR SELECT TO authenticated
  USING (public.is_district_partner(auth.uid(), partner_id));
CREATE POLICY "Rewards: admin all" ON public.partner_rewards
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_partner_rewards_partner ON public.partner_rewards(partner_id);

-- =====================================================================
-- 4) partner_earnings
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.partner_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.district_business_partners(id) ON DELETE CASCADE,
  shop_id UUID REFERENCES public.partner_shop_mapping(id) ON DELETE SET NULL,
  type public.dbp_earning_type NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  share_rate NUMERIC(5,4),
  source_revenue NUMERIC(12,2),
  period_start DATE,
  period_end DATE,
  status public.dbp_earning_status NOT NULL DEFAULT 'pending',
  payout_id UUID,
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.partner_earnings TO authenticated;
GRANT ALL ON public.partner_earnings TO service_role;
ALTER TABLE public.partner_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Earnings: owner view" ON public.partner_earnings
  FOR SELECT TO authenticated
  USING (public.is_district_partner(auth.uid(), partner_id));
CREATE POLICY "Earnings: admin all" ON public.partner_earnings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_partner_earnings_partner ON public.partner_earnings(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_earnings_status ON public.partner_earnings(status);

-- =====================================================================
-- 5) partner_milestones
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.partner_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.district_business_partners(id) ON DELETE CASCADE,
  milestone_code TEXT NOT NULL,
  shops_required INT NOT NULL,
  tier public.dbp_tier,
  unlocked BOOLEAN NOT NULL DEFAULT false,
  unlocked_at TIMESTAMPTZ,
  reward_id UUID REFERENCES public.partner_rewards(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (partner_id, milestone_code)
);
GRANT SELECT ON public.partner_milestones TO authenticated;
GRANT ALL ON public.partner_milestones TO service_role;
ALTER TABLE public.partner_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Milestones: owner view" ON public.partner_milestones
  FOR SELECT TO authenticated
  USING (public.is_district_partner(auth.uid(), partner_id));
CREATE POLICY "Milestones: admin all" ON public.partner_milestones
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =====================================================================
-- 6) partner_hall_of_fame
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.partner_hall_of_fame (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.district_business_partners(id) ON DELETE CASCADE,
  rank INT NOT NULL,
  category TEXT NOT NULL DEFAULT 'overall',
  active_shops INT NOT NULL DEFAULT 0,
  revenue_generated NUMERIC(14,2) NOT NULL DEFAULT 0,
  achievements JSONB NOT NULL DEFAULT '[]'::jsonb,
  success_story TEXT,
  badge TEXT,
  featured_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  featured_to TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.partner_hall_of_fame TO anon, authenticated;
GRANT ALL ON public.partner_hall_of_fame TO service_role;
ALTER TABLE public.partner_hall_of_fame ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HoF: public view" ON public.partner_hall_of_fame
  FOR SELECT USING (true);
CREATE POLICY "HoF: admin manage" ON public.partner_hall_of_fame
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_hof_rank ON public.partner_hall_of_fame(category, rank);

-- =====================================================================
-- 7) partner_leaderboard
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.partner_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.district_business_partners(id) ON DELETE CASCADE,
  period public.dbp_leaderboard_period NOT NULL,
  period_start DATE,
  period_end DATE,
  scope TEXT NOT NULL DEFAULT 'national',
  district TEXT,
  state TEXT,
  rank INT NOT NULL,
  active_shops INT NOT NULL DEFAULT 0,
  revenue_generated NUMERIC(14,2) NOT NULL DEFAULT 0,
  partner_earnings NUMERIC(12,2) NOT NULL DEFAULT 0,
  score NUMERIC(12,2) NOT NULL DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.partner_leaderboard TO anon, authenticated;
GRANT ALL ON public.partner_leaderboard TO service_role;
ALTER TABLE public.partner_leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "LB: public view" ON public.partner_leaderboard
  FOR SELECT USING (true);
CREATE POLICY "LB: admin manage" ON public.partner_leaderboard
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_lb_period_rank ON public.partner_leaderboard(period, scope, rank);

-- =====================================================================
-- 8) partner_payouts
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.partner_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.district_business_partners(id) ON DELETE CASCADE,
  cycle_start DATE NOT NULL,
  cycle_end DATE NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  earnings_count INT NOT NULL DEFAULT 0,
  status public.dbp_payout_status NOT NULL DEFAULT 'pending',
  utr TEXT,
  bank_account JSONB,
  processed_at TIMESTAMPTZ,
  failure_reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.partner_payouts TO authenticated;
GRANT ALL ON public.partner_payouts TO service_role;
ALTER TABLE public.partner_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Payouts: owner view" ON public.partner_payouts
  FOR SELECT TO authenticated
  USING (public.is_district_partner(auth.uid(), partner_id));
CREATE POLICY "Payouts: admin all" ON public.partner_payouts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_payouts_partner ON public.partner_payouts(partner_id, cycle_end DESC);

-- =====================================================================
-- 9) partner_activity_logs
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.partner_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.district_business_partners(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.partner_activity_logs TO authenticated;
GRANT ALL ON public.partner_activity_logs TO service_role;
ALTER TABLE public.partner_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Logs: owner view" ON public.partner_activity_logs
  FOR SELECT TO authenticated
  USING (public.is_district_partner(auth.uid(), partner_id));
CREATE POLICY "Logs: admin view" ON public.partner_activity_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Logs: admin insert" ON public.partner_activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_logs_partner ON public.partner_activity_logs(partner_id, created_at DESC);

-- =====================================================================
-- 10) partner_referrals
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.partner_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_partner_id UUID NOT NULL REFERENCES public.district_business_partners(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referred_partner_id UUID REFERENCES public.district_business_partners(id) ON DELETE SET NULL,
  referred_name TEXT,
  referred_mobile TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reward_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.partner_referrals TO authenticated;
GRANT ALL ON public.partner_referrals TO service_role;
ALTER TABLE public.partner_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Referrals: owner view" ON public.partner_referrals
  FOR SELECT TO authenticated
  USING (public.is_district_partner(auth.uid(), referrer_partner_id));
CREATE POLICY "Referrals: owner insert" ON public.partner_referrals
  FOR INSERT TO authenticated
  WITH CHECK (public.is_district_partner(auth.uid(), referrer_partner_id));
CREATE POLICY "Referrals: admin all" ON public.partner_referrals
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =====================================================================
-- 11) partner_dashboard_metrics (cached KPIs)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.partner_dashboard_metrics (
  partner_id UUID PRIMARY KEY REFERENCES public.district_business_partners(id) ON DELETE CASCADE,
  total_shops INT NOT NULL DEFAULT 0,
  active_shops INT NOT NULL DEFAULT 0,
  revenue_generated NUMERIC(14,2) NOT NULL DEFAULT 0,
  nexora_earnings NUMERIC(14,2) NOT NULL DEFAULT 0,
  partner_earnings NUMERIC(14,2) NOT NULL DEFAULT 0,
  pending_earnings NUMERIC(14,2) NOT NULL DEFAULT 0,
  lifetime_earnings NUMERIC(14,2) NOT NULL DEFAULT 0,
  current_week_payout NUMERIC(12,2) NOT NULL DEFAULT 0,
  current_month_payout NUMERIC(12,2) NOT NULL DEFAULT 0,
  district_rank INT,
  hall_of_fame_rank INT,
  next_milestone TEXT,
  next_milestone_shops INT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.partner_dashboard_metrics TO authenticated;
GRANT ALL ON public.partner_dashboard_metrics TO service_role;
ALTER TABLE public.partner_dashboard_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Metrics: owner view" ON public.partner_dashboard_metrics
  FOR SELECT TO authenticated
  USING (public.is_district_partner(auth.uid(), partner_id));
CREATE POLICY "Metrics: admin all" ON public.partner_dashboard_metrics
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =====================================================================
-- updated_at triggers
-- =====================================================================
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'district_business_partners','partner_shop_mapping','partner_rewards',
    'partner_earnings','partner_milestones','partner_hall_of_fame',
    'partner_payouts','partner_referrals'
  ]) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated ON public.%I', t, t);
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()',
      t, t
    );
  END LOOP;
END $$;

-- =====================================================================
-- recompute_partner_dashboard_metrics(_partner_id)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.recompute_partner_dashboard_metrics(_partner_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_total INT; v_active INT;
  v_revenue NUMERIC(14,2);
  v_nexora NUMERIC(14,2);
  v_partner NUMERIC(14,2);
  v_pending NUMERIC(14,2);
  v_lifetime NUMERIC(14,2);
  v_week NUMERIC(12,2);
  v_month NUMERIC(12,2);
  v_district TEXT;
  v_rank INT;
  v_hof_rank INT;
BEGIN
  SELECT COUNT(*) FILTER (WHERE TRUE),
         COUNT(*) FILTER (WHERE is_active),
         COALESCE(SUM(revenue_generated),0)
    INTO v_total, v_active, v_revenue
    FROM public.partner_shop_mapping
   WHERE partner_id = _partner_id;

  SELECT COALESCE(SUM(amount) FILTER (WHERE status IN ('approved','paid')), 0),
         COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0),
         COALESCE(SUM(amount) FILTER (WHERE status = 'paid'), 0)
    INTO v_partner, v_pending, v_lifetime
    FROM public.partner_earnings
   WHERE partner_id = _partner_id;

  v_nexora := GREATEST(v_revenue - v_partner, 0);

  SELECT COALESCE(SUM(amount),0) INTO v_week
    FROM public.partner_payouts
   WHERE partner_id = _partner_id
     AND cycle_end >= date_trunc('week', now())::date;

  SELECT COALESCE(SUM(amount),0) INTO v_month
    FROM public.partner_payouts
   WHERE partner_id = _partner_id
     AND cycle_end >= date_trunc('month', now())::date;

  SELECT district INTO v_district FROM public.district_business_partners WHERE id = _partner_id;

  SELECT rnk INTO v_rank FROM (
    SELECT dbp.id,
           ROW_NUMBER() OVER (ORDER BY COALESCE(m.active_shops,0) DESC, COALESCE(m.revenue_generated,0) DESC) AS rnk
      FROM public.district_business_partners dbp
      LEFT JOIN public.partner_dashboard_metrics m ON m.partner_id = dbp.id
     WHERE dbp.district = v_district AND dbp.status = 'verified'
  ) s WHERE s.id = _partner_id;

  SELECT rank INTO v_hof_rank FROM public.partner_hall_of_fame
   WHERE partner_id = _partner_id ORDER BY rank ASC LIMIT 1;

  INSERT INTO public.partner_dashboard_metrics AS m (
    partner_id, total_shops, active_shops, revenue_generated,
    nexora_earnings, partner_earnings, pending_earnings, lifetime_earnings,
    current_week_payout, current_month_payout, district_rank, hall_of_fame_rank, updated_at
  ) VALUES (
    _partner_id, v_total, v_active, v_revenue,
    v_nexora, v_partner, v_pending, v_lifetime,
    v_week, v_month, v_rank, v_hof_rank, now()
  )
  ON CONFLICT (partner_id) DO UPDATE SET
    total_shops = EXCLUDED.total_shops,
    active_shops = EXCLUDED.active_shops,
    revenue_generated = EXCLUDED.revenue_generated,
    nexora_earnings = EXCLUDED.nexora_earnings,
    partner_earnings = EXCLUDED.partner_earnings,
    pending_earnings = EXCLUDED.pending_earnings,
    lifetime_earnings = EXCLUDED.lifetime_earnings,
    current_week_payout = EXCLUDED.current_week_payout,
    current_month_payout = EXCLUDED.current_month_payout,
    district_rank = EXCLUDED.district_rank,
    hall_of_fame_rank = EXCLUDED.hall_of_fame_rank,
    updated_at = now();
END;
$$;

-- =====================================================================
-- recompute_partner_leaderboard(_period)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.recompute_partner_leaderboard(_period public.dbp_leaderboard_period)
RETURNS INT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_start DATE; v_end DATE; affected INT;
BEGIN
  IF _period = 'weekly' THEN
    v_start := date_trunc('week', now())::date;
    v_end   := (v_start + INTERVAL '6 days')::date;
  ELSIF _period = 'monthly' THEN
    v_start := date_trunc('month', now())::date;
    v_end   := (date_trunc('month', now()) + INTERVAL '1 month - 1 day')::date;
  ELSE
    v_start := NULL; v_end := NULL;
  END IF;

  DELETE FROM public.partner_leaderboard
   WHERE period = _period
     AND COALESCE(period_start, DATE '1970-01-01') = COALESCE(v_start, DATE '1970-01-01');

  WITH base AS (
    SELECT dbp.id AS partner_id, dbp.district, dbp.state,
           COALESCE(m.active_shops,0) AS active_shops,
           COALESCE(m.revenue_generated,0) AS revenue_generated,
           COALESCE(m.partner_earnings,0) AS partner_earnings,
           (COALESCE(m.active_shops,0) * 100 + COALESCE(m.revenue_generated,0) / 1000.0) AS score
      FROM public.district_business_partners dbp
      LEFT JOIN public.partner_dashboard_metrics m ON m.partner_id = dbp.id
     WHERE dbp.status = 'verified'
  ),
  ranked AS (
    SELECT *, ROW_NUMBER() OVER (ORDER BY score DESC, active_shops DESC) AS rnk
      FROM base
  )
  INSERT INTO public.partner_leaderboard
    (partner_id, period, period_start, period_end, scope, district, state,
     rank, active_shops, revenue_generated, partner_earnings, score)
  SELECT partner_id, _period, v_start, v_end, 'national', district, state,
         rnk, active_shops, revenue_generated, partner_earnings, score
    FROM ranked;

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;
