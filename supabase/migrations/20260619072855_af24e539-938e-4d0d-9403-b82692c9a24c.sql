-- =====================================================================
-- Phase 5.1 — Auth foundation: profiles + roles + signup trigger
-- =====================================================================

-- 1. Role enum (separate from profiles to prevent privilege escalation)
CREATE TYPE public.app_role AS ENUM (
  'customer',
  'owner',
  'admin',
  'growth_partner',
  'district_partner',
  'distributor'
);

-- =====================================================================
-- 2. profiles table
-- =====================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  username TEXT UNIQUE,
  mobile TEXT UNIQUE,
  email TEXT,
  gender TEXT,
  date_of_birth DATE,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  avatar_url TEXT,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  nexora_id TEXT UNIQUE,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 3. user_roles table (canonical role storage)
-- =====================================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 4. has_role() — SECURITY DEFINER, avoids recursive RLS
-- =====================================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- =====================================================================
-- 5. RLS policies
-- =====================================================================

-- profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================================
-- 6. updated_at trigger
-- =====================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================================
-- 7. Referral code generator (6-char base32, collision-safe loop)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  code TEXT;
  exists_already BOOLEAN;
BEGIN
  LOOP
    code := upper(substr(encode(gen_random_bytes(5), 'base32'), 1, 6));
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = code) INTO exists_already;
    IF NOT exists_already THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$;

-- =====================================================================
-- 8. handle_new_user() — auto-create profile + assign default role
-- =====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_referral_code TEXT;
  new_nexora_id TEXT;
  assigned_role public.app_role;
  role_text TEXT;
BEGIN
  new_referral_code := public.generate_referral_code();
  new_nexora_id := 'NX' || to_char(NOW(), 'YYMM') ||
                   lpad((floor(random() * 100000))::TEXT, 5, '0');

  -- Allow signup metadata to request a role: { data: { role: 'owner' } }
  -- Default to customer; admin can never be self-assigned.
  role_text := NEW.raw_user_meta_data ->> 'role';
  IF role_text IN ('customer','owner','growth_partner','district_partner','distributor') THEN
    assigned_role := role_text::public.app_role;
  ELSE
    assigned_role := 'customer';
  END IF;

  INSERT INTO public.profiles (id, full_name, email, mobile, referral_code, referred_by, nexora_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email,
    NEW.raw_user_meta_data ->> 'mobile',
    new_referral_code,
    NEW.raw_user_meta_data ->> 'referred_by',
    new_nexora_id
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, assigned_role);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
