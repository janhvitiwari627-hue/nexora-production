
CREATE INDEX IF NOT EXISTS idx_search_analytics_query
  ON public.search_analytics
  USING GIN (to_tsvector('english', search_query));

CREATE INDEX IF NOT EXISTS idx_customer_insights_churn
  ON public.customer_insights(churn_risk_score DESC)
  WHERE churn_risk_score > 0.7;

CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status
  ON public.marketing_campaigns(status, created_at);

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_entity_status
  ON public.ai_recommendations(entity_type, entity_id, status);
