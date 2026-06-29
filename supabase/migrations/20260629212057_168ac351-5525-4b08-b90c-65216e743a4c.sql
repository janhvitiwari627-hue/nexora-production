
-- 1) Add referred_by_user_id to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referred_by_user_id UUID
  REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_referred_by_user_id
  ON public.profiles(referred_by_user_id);

-- 2) Update handle_new_user trigger to also resolve referral code -> user id
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_referral_code TEXT;
  new_nexora_id TEXT;
  assigned_role public.app_role;
  role_text TEXT;
  ref_code TEXT;
  ref_user_id UUID;
BEGIN
  new_referral_code := public.generate_referral_code();
  new_nexora_id := 'NX' || to_char(NOW(), 'YYMM') ||
                   lpad((floor(random() * 100000))::TEXT, 5, '0');

  role_text := NEW.raw_user_meta_data ->> 'role';
  IF role_text IN ('customer','owner','growth_partner','district_partner','distributor') THEN
    assigned_role := role_text::public.app_role;
  ELSE
    assigned_role := 'customer';
  END IF;

  ref_code := NULLIF(trim(NEW.raw_user_meta_data ->> 'referred_by'), '');
  IF ref_code IS NOT NULL THEN
    SELECT id INTO ref_user_id FROM public.profiles
     WHERE upper(referral_code) = upper(ref_code) LIMIT 1;
  END IF;

  INSERT INTO public.profiles (
    id, full_name, email, mobile, referral_code,
    referred_by, referred_by_user_id, nexora_id
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email,
    NEW.raw_user_meta_data ->> 'mobile',
    new_referral_code,
    ref_code,
    ref_user_id,
    new_nexora_id
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, assigned_role);

  RETURN NEW;
END;
$function$;

-- 3) Backfill referred_by_user_id for existing rows where referred_by code matches
UPDATE public.profiles p
   SET referred_by_user_id = r.id
  FROM public.profiles r
 WHERE p.referred_by_user_id IS NULL
   AND p.referred_by IS NOT NULL
   AND upper(p.referred_by) = upper(r.referral_code)
   AND p.id <> r.id;

-- 4) Patch validate_booking trigger: block status='confirmed' without payment_status='paid'
CREATE OR REPLACE FUNCTION public.validate_booking()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status NOT IN ('pending','confirmed','completed','cancelled','no_show','expired') THEN
    RAISE EXCEPTION 'Invalid booking status: %', NEW.status;
  END IF;
  IF NEW.payment_status NOT IN ('pending','paid','refunded','failed') THEN
    RAISE EXCEPTION 'Invalid payment_status: %', NEW.payment_status;
  END IF;

  -- Hard block: cannot promote to confirmed without paid advance.
  IF NEW.status = 'confirmed' AND NEW.payment_status <> 'paid' THEN
    RAISE EXCEPTION 'Cannot confirm booking before advance payment is paid';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.booking_date < CURRENT_DATE THEN
      RAISE EXCEPTION 'Booking date must not be in the past';
    END IF;
    IF NEW.booking_date > CURRENT_DATE + INTERVAL '30 days' THEN
      RAISE EXCEPTION 'Booking date must be within 30 days';
    END IF;
    IF NEW.booking_reference IS NULL THEN
      NEW.booking_reference := public.generate_booking_reference();
    END IF;
  END IF;

  IF NEW.advance_amount IS NULL THEN
    NEW.advance_amount := round(NEW.price * 0.25, 2);
  END IF;

  IF NEW.payment_status = 'pending' AND NEW.payment_deadline IS NULL THEN
    NEW.payment_deadline := now() + INTERVAL '15 minutes';
  END IF;

  IF TG_OP = 'UPDATE'
     AND NEW.status = 'cancelled'
     AND OLD.status <> 'cancelled' THEN
    IF NEW.cancelled_at IS NULL THEN
      NEW.cancelled_at := now();
    END IF;
    IF NEW.cancelled_by IS NULL THEN
      NEW.cancelled_by := auth.uid();
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;
