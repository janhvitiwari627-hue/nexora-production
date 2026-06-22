
-- =========================
-- search_analytics
-- =========================
CREATE TABLE public.search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  search_query TEXT NOT NULL,
  processed_intent JSONB,
  user_location JSONB,
  results_count INTEGER,
  clicked_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.search_analytics TO authenticated;
GRANT ALL ON public.search_analytics TO service_role;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own search analytics"
  ON public.search_analytics FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Users view own search analytics"
  ON public.search_analytics FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Admins view all search analytics"
  ON public.search_analytics FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_search_analytics_user_date ON public.search_analytics(user_id, created_at DESC);
CREATE INDEX idx_search_analytics_session ON public.search_analytics(session_id);

-- =========================
-- customer_insights
-- =========================
CREATE TABLE public.customer_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  last_booking_date DATE,
  avg_booking_frequency INTEGER,
  preferred_services TEXT[],
  preferred_price_range JSONB,
  preferred_areas TEXT[],
  loyalty_score NUMERIC(5,2) DEFAULT 0,
  churn_risk_score NUMERIC(5,2) DEFAULT 0,
  lifetime_value NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT ON public.customer_insights TO authenticated;
GRANT ALL ON public.customer_insights TO service_role;
ALTER TABLE public.customer_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers view own insights"
  ON public.customer_insights FOR SELECT TO authenticated
  USING (customer_id = auth.uid());
CREATE POLICY "Admins manage all insights"
  ON public.customer_insights FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_customer_insights_updated_at
  BEFORE UPDATE ON public.customer_insights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- ai_recommendations
-- =========================
CREATE TABLE public.ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('CUSTOMER','SALON')),
  entity_id UUID NOT NULL,
  recommendation_type TEXT NOT NULL,
  recommendation_data JSONB NOT NULL,
  confidence_score NUMERIC(3,2),
  status TEXT NOT NULL DEFAULT 'GENERATED' CHECK (status IN ('GENERATED','SHOWN','ACCEPTED','REJECTED')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.ai_recommendations TO authenticated;
GRANT ALL ON public.ai_recommendations TO service_role;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customer can view own recommendations"
  ON public.ai_recommendations FOR SELECT TO authenticated
  USING (entity_type = 'CUSTOMER' AND entity_id = auth.uid());
CREATE POLICY "Salon owners view salon recommendations"
  ON public.ai_recommendations FOR SELECT TO authenticated
  USING (entity_type = 'SALON' AND public.is_salon_owner(auth.uid(), entity_id));
CREATE POLICY "Customer updates own recommendation status"
  ON public.ai_recommendations FOR UPDATE TO authenticated
  USING (entity_type = 'CUSTOMER' AND entity_id = auth.uid())
  WITH CHECK (entity_type = 'CUSTOMER' AND entity_id = auth.uid());
CREATE POLICY "Salon owners update salon recommendation status"
  ON public.ai_recommendations FOR UPDATE TO authenticated
  USING (entity_type = 'SALON' AND public.is_salon_owner(auth.uid(), entity_id))
  WITH CHECK (entity_type = 'SALON' AND public.is_salon_owner(auth.uid(), entity_id));
CREATE POLICY "Admins manage all recommendations"
  ON public.ai_recommendations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_ai_recs_entity ON public.ai_recommendations(entity_type, entity_id, created_at DESC);

-- =========================
-- location_history
-- =========================
CREATE TABLE public.location_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude NUMERIC(10,8) NOT NULL,
  longitude NUMERIC(11,8) NOT NULL,
  city TEXT,
  area TEXT,
  accuracy_meters NUMERIC(8,2),
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.location_history TO authenticated;
GRANT ALL ON public.location_history TO service_role;
ALTER TABLE public.location_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own location"
  ON public.location_history FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users view own location"
  ON public.location_history FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Users delete own location"
  ON public.location_history FOR DELETE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Admins view all locations"
  ON public.location_history FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_location_history_user_date ON public.location_history(user_id, detected_at DESC);

-- =========================
-- salon_rankings
-- =========================
CREATE TABLE public.salon_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  category TEXT,
  nexora_score INTEGER NOT NULL,
  ranking INTEGER NOT NULL,
  previous_ranking INTEGER,
  rating_component NUMERIC(5,2),
  booking_component NUMERIC(5,2),
  retention_component NUMERIC(5,2),
  activity_component NUMERIC(5,2),
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uq_salon_rankings_salon_city_cat
  ON public.salon_rankings(salon_id, city, COALESCE(category, ''));
GRANT SELECT ON public.salon_rankings TO anon, authenticated;
GRANT ALL ON public.salon_rankings TO service_role;
ALTER TABLE public.salon_rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rankings publicly viewable"
  ON public.salon_rankings FOR SELECT
  USING (true);
CREATE POLICY "Admins manage rankings"
  ON public.salon_rankings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_salon_rankings_city_score ON public.salon_rankings(city, nexora_score DESC);

-- =========================
-- voice_searches
-- =========================
CREATE TABLE public.voice_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  audio_duration_seconds INTEGER,
  transcribed_text TEXT,
  search_intent JSONB,
  confidence_score NUMERIC(3,2),
  results_returned INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.voice_searches TO authenticated;
GRANT ALL ON public.voice_searches TO service_role;
ALTER TABLE public.voice_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own voice search"
  ON public.voice_searches FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Users view own voice search"
  ON public.voice_searches FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Admins view all voice searches"
  ON public.voice_searches FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_voice_searches_user_date ON public.voice_searches(user_id, created_at DESC);
