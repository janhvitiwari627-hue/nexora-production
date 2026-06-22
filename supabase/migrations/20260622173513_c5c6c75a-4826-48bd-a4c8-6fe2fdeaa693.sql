
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT UNIQUE NOT NULL DEFAULT ('TXN-' || to_char(now(),'YYMMDD') || '-' || substr(md5(random()::text), 1, 8)),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  salon_id UUID REFERENCES public.salons(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_method TEXT,
  payment_type TEXT CHECK (payment_type IN ('ADVANCE','REMAINING','FULL','QR_PAYMENT')) DEFAULT 'ADVANCE',
  status TEXT CHECK (status IN ('CREATED','PENDING','SUCCESS','FAILED','CANCELLED','REFUNDED')) DEFAULT 'CREATED',
  gateway_response JSONB,
  failure_reason TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers view own payments" ON public.payments
  FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Customers insert own payments" ON public.payments
  FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Salon owners view salon payments" ON public.payments
  FOR SELECT TO authenticated USING (public.is_salon_owner(auth.uid(), salon_id));
CREATE INDEX idx_payments_customer_status ON public.payments(customer_id, status);
CREATE INDEX idx_payments_salon_date ON public.payments(salon_id, created_at DESC);
CREATE INDEX idx_payments_booking ON public.payments(booking_id);

CREATE TABLE public.qr_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code TEXT UNIQUE NOT NULL,
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  amount NUMERIC(10,2),
  status TEXT CHECK (status IN ('GENERATED','SCANNED','PAID','EXPIRED')) DEFAULT 'GENERATED',
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '15 minutes'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.qr_payments TO authenticated;
GRANT ALL ON public.qr_payments TO service_role;
ALTER TABLE public.qr_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers view own qr payments" ON public.qr_payments
  FOR SELECT TO authenticated USING (customer_id = auth.uid() OR public.is_salon_owner(auth.uid(), salon_id));
CREATE POLICY "Customers update own qr payments" ON public.qr_payments
  FOR UPDATE TO authenticated USING (customer_id = auth.uid()) WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Salon owners create qr payments" ON public.qr_payments
  FOR INSERT TO authenticated WITH CHECK (public.is_salon_owner(auth.uid(), salon_id));
CREATE INDEX idx_qr_payments_code ON public.qr_payments(qr_code);

CREATE TABLE public.rewards_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  reward_type TEXT CHECK (reward_type IN ('CASHBACK','POINTS','REFERRAL_BONUS')) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  percentage NUMERIC(5,2),
  status TEXT CHECK (status IN ('EARNED','REDEEMED','EXPIRED')) DEFAULT 'EARNED',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.rewards_ledger TO authenticated;
GRANT ALL ON public.rewards_ledger TO service_role;
ALTER TABLE public.rewards_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers view own rewards" ON public.rewards_ledger
  FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE INDEX idx_rewards_customer ON public.rewards_ledger(customer_id, status);
