-- Nexora Foundation (Additive Only)
-- Skipped existing: profiles, shops, services, bookings, reviews, referrals, staff, salon_wallets, payments, website_templates, user_roles
-- Creates new: templates, shop_staff, wallets, transactions, rewards, admin_roles + 5 new enums

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ ENUMS ============
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('super_admin','shop_owner','shop_manager','staff','customer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.booking_status AS ENUM ('pending','confirmed','completed','cancelled','no_show');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.transaction_status AS ENUM ('pending','success','failed','refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.transaction_type AS ENUM ('qr_payment','booking_payment','platform_commission','owner_payout','refund','reward_credit','referral_bonus');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.reward_type AS ENUM ('points','cashback','referral','membership','admin_bonus');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ TEMPLATES ============
CREATE TABLE IF NOT EXISTS public.templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  theme_config jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.templates TO anon, authenticated;
GRANT ALL ON public.templates TO service_role;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "templates_public_read" ON public.templates;
CREATE POLICY "templates_public_read" ON public.templates FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "templates_admin_manage" ON public.templates;
CREATE POLICY "templates_admin_manage" ON public.templates FOR ALL
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

-- ============ SHOP_STAFF ============
CREATE TABLE IF NOT EXISTS public.shop_staff (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  phone text,
  job_title text,
  photo_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.shop_staff TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shop_staff TO authenticated;
GRANT ALL ON public.shop_staff TO service_role;
ALTER TABLE public.shop_staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shop_staff_public_read" ON public.shop_staff;
CREATE POLICY "shop_staff_public_read" ON public.shop_staff FOR SELECT
  USING (is_active = true AND EXISTS (SELECT 1 FROM public.shops s WHERE s.id = shop_staff.shop_id));
DROP POLICY IF EXISTS "shop_staff_admin_manage" ON public.shop_staff;
CREATE POLICY "shop_staff_admin_manage" ON public.shop_staff FOR ALL
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

-- ============ WALLETS (new; existing salon_wallets untouched) ============
CREATE TABLE IF NOT EXISTS public.wallets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id uuid UNIQUE REFERENCES public.shops(id) ON DELETE CASCADE,
  available_balance numeric DEFAULT 0,
  pending_balance numeric DEFAULT 0,
  lifetime_earned numeric DEFAULT 0,
  reserve_amount numeric DEFAULT 100,
  currency text DEFAULT 'INR',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wallets TO authenticated;
GRANT ALL ON public.wallets TO service_role;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wallets_admin_manage" ON public.wallets;
CREATE POLICY "wallets_admin_manage" ON public.wallets FOR ALL
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
DROP POLICY IF EXISTS "wallets_owner_read" ON public.wallets;
CREATE POLICY "wallets_owner_read" ON public.wallets FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.shops s WHERE s.id = wallets.shop_id));

-- ============ TRANSACTIONS (new) ============
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id uuid REFERENCES public.shops(id) ON DELETE SET NULL,
  wallet_id uuid REFERENCES public.wallets(id) ON DELETE SET NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  type public.transaction_type NOT NULL,
  status public.transaction_status DEFAULT 'pending',
  amount numeric DEFAULT 0,
  platform_fee numeric DEFAULT 0,
  net_amount numeric DEFAULT 0,
  gateway_reference text,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transactions_customer_read" ON public.transactions;
CREATE POLICY "transactions_customer_read" ON public.transactions FOR SELECT
  USING (auth.uid() = customer_id);
DROP POLICY IF EXISTS "transactions_admin_manage" ON public.transactions;
CREATE POLICY "transactions_admin_manage" ON public.transactions FOR ALL
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

-- ============ REWARDS (new; existing rewards_ledger untouched) ============
CREATE TABLE IF NOT EXISTS public.rewards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  shop_id uuid REFERENCES public.shops(id) ON DELETE SET NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  reward_type public.reward_type DEFAULT 'points',
  points integer DEFAULT 0,
  amount numeric DEFAULT 0,
  description text,
  expires_at timestamptz,
  is_used boolean DEFAULT false,
  used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rewards TO authenticated;
GRANT ALL ON public.rewards TO service_role;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rewards_customer_read" ON public.rewards;
CREATE POLICY "rewards_customer_read" ON public.rewards FOR SELECT
  USING (auth.uid() = customer_id);
DROP POLICY IF EXISTS "rewards_admin_manage" ON public.rewards;
CREATE POLICY "rewards_admin_manage" ON public.rewards FOR ALL
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

-- ============ ADMIN_ROLES ============
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_name text NOT NULL,
  permissions jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_roles TO authenticated;
GRANT ALL ON public.admin_roles TO service_role;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_roles_self_read" ON public.admin_roles;
CREATE POLICY "admin_roles_self_read" ON public.admin_roles FOR SELECT
  USING (auth.uid() = profile_id);
DROP POLICY IF EXISTS "admin_roles_admin_manage" ON public.admin_roles;
CREATE POLICY "admin_roles_admin_manage" ON public.admin_roles FOR ALL
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

-- ============ updated_at TRIGGERS (function already exists) ============
DROP TRIGGER IF EXISTS trg_templates_updated_at ON public.templates;
CREATE TRIGGER trg_templates_updated_at BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_shop_staff_updated_at ON public.shop_staff;
CREATE TRIGGER trg_shop_staff_updated_at BEFORE UPDATE ON public.shop_staff
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_wallets_updated_at ON public.wallets;
CREATE TRIGGER trg_wallets_updated_at BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_transactions_updated_at ON public.transactions;
CREATE TRIGGER trg_transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_rewards_updated_at ON public.rewards;
CREATE TRIGGER trg_rewards_updated_at BEFORE UPDATE ON public.rewards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_admin_roles_updated_at ON public.admin_roles;
CREATE TRIGGER trg_admin_roles_updated_at BEFORE UPDATE ON public.admin_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ AUTO-CREATE WALLET ON NEW SHOP ============
CREATE OR REPLACE FUNCTION public.create_wallet_for_shop()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.wallets (shop_id) VALUES (NEW.id)
  ON CONFLICT (shop_id) DO NOTHING;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_shops_create_wallet ON public.shops;
CREATE TRIGGER trg_shops_create_wallet AFTER INSERT ON public.shops
  FOR EACH ROW EXECUTE FUNCTION public.create_wallet_for_shop();

-- ============ SEED TEMPLATES ============
INSERT INTO public.templates (template_key, name, description) VALUES
  ('royal-luxe','Royal Luxe','Luxury black and gold premium salon template.'),
  ('modern-salon','Modern Salon','Clean modern professional salon template.'),
  ('professional-beauty','Professional Beauty','Light premium beauty, spa and wellness template.')
ON CONFLICT (template_key) DO NOTHING;