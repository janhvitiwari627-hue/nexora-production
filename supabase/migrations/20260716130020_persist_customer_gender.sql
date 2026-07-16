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
  gender_text TEXT;
  ref_code TEXT;
  ref_user_id UUID;
  tries INT := 0;
BEGIN
  LOOP
    new_referral_code := public.generate_referral_code();
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE referral_code = new_referral_code
    );
    tries := tries + 1;
    IF tries > 10 THEN
      new_referral_code := 'NX' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
      EXIT;
    END IF;
  END LOOP;

  tries := 0;
  LOOP
    new_nexora_id := 'NX' || to_char(NOW(), 'YYMM') ||
                     lpad((floor(random() * 100000))::TEXT, 5, '0');
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE nexora_id = new_nexora_id
    );
    tries := tries + 1;
    IF tries > 10 THEN
      new_nexora_id := 'NX' || to_char(NOW(), 'YYMMDD') ||
                       upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
      EXIT;
    END IF;
  END LOOP;

  role_text := NEW.raw_user_meta_data ->> 'role';
  IF role_text IN (
    'customer',
    'owner',
    'shop_owner',
    'growth_partner',
    'district_partner',
    'distributor',
    'brand'
  ) THEN
    assigned_role := role_text::public.app_role;
  ELSE
    assigned_role := 'customer';
  END IF;

  gender_text := lower(NULLIF(trim(NEW.raw_user_meta_data ->> 'gender'), ''));
  IF gender_text NOT IN ('male', 'female') THEN
    gender_text := NULL;
  END IF;

  ref_code := NULLIF(trim(NEW.raw_user_meta_data ->> 'referred_by'), '');
  IF ref_code IS NOT NULL THEN
    SELECT id INTO ref_user_id
    FROM public.profiles
    WHERE upper(referral_code) = upper(ref_code)
    LIMIT 1;
  END IF;

  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    mobile,
    gender,
    referral_code,
    referred_by,
    referred_by_user_id,
    nexora_id
  )
  VALUES (
    NEW.id,
    NULLIF(trim(NEW.raw_user_meta_data ->> 'full_name'), ''),
    NEW.email,
    NULLIF(trim(NEW.raw_user_meta_data ->> 'mobile'), ''),
    gender_text,
    new_referral_code,
    ref_code,
    ref_user_id,
    new_nexora_id
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    mobile = COALESCE(EXCLUDED.mobile, public.profiles.mobile),
    gender = COALESCE(EXCLUDED.gender, public.profiles.gender),
    updated_at = now();

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
