-- Staff extensions
ALTER TABLE public.staff
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS working_hours JSONB;

-- Salon wallets
CREATE TABLE IF NOT EXISTS public.salon_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL UNIQUE REFERENCES public.salons(id) ON DELETE CASCADE,
  available_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  pending_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_earnings NUMERIC(10,2) NOT NULL DEFAULT 0,
  last_withdrawal_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.salon_wallets TO authenticated;
GRANT ALL ON public.salon_wallets TO service_role;
ALTER TABLE public.salon_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners view their wallet" ON public.salon_wallets
  FOR SELECT TO authenticated USING (public.is_salon_owner(auth.uid(), salon_id));
CREATE POLICY "Admins manage wallets" ON public.salon_wallets
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE TRIGGER trg_salon_wallets_updated
  BEFORE UPDATE ON public.salon_wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Withdrawals
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PROCESSING','COMPLETED','REJECTED')),
  bank_account_details JSONB,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.withdrawals TO authenticated;
GRANT ALL ON public.withdrawals TO service_role;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners view their withdrawals" ON public.withdrawals
  FOR SELECT TO authenticated USING (public.is_salon_owner(auth.uid(), salon_id));
CREATE POLICY "Owners request withdrawals" ON public.withdrawals
  FOR INSERT TO authenticated WITH CHECK (public.is_salon_owner(auth.uid(), salon_id));
CREATE POLICY "Admins manage withdrawals" ON public.withdrawals
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX IF NOT EXISTS idx_withdrawals_salon ON public.withdrawals(salon_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);
CREATE TRIGGER trg_withdrawals_updated
  BEFORE UPDATE ON public.withdrawals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Marketing campaigns
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('RETENTION','FESTIVAL','PROMOTION')),
  title TEXT NOT NULL,
  message TEXT,
  target_segment TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','PAUSED','COMPLETED')),
  sent_count INTEGER NOT NULL DEFAULT 0,
  response_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_campaigns TO authenticated;
GRANT ALL ON public.marketing_campaigns TO service_role;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage their campaigns" ON public.marketing_campaigns
  FOR ALL TO authenticated
  USING (public.is_salon_owner(auth.uid(), salon_id))
  WITH CHECK (public.is_salon_owner(auth.uid(), salon_id));
CREATE POLICY "Admins manage all campaigns" ON public.marketing_campaigns
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX IF NOT EXISTS idx_campaigns_salon ON public.marketing_campaigns(salon_id);
CREATE TRIGGER trg_campaigns_updated
  BEFORE UPDATE ON public.marketing_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();