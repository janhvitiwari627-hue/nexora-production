
-- 1) wallets_owner_read_no_ownership_check — lock down (V2 feature)
DROP POLICY IF EXISTS wallets_owner_read ON public.wallets;
-- admin manage policy remains; no other read access until V2 ownership join is wired.

-- 2) SUPA_security_definer_view — switch public views to invoker
ALTER VIEW public.public_salon_cards SET (security_invoker = on);
ALTER VIEW public.public_dbp_profiles SET (security_invoker = on);

-- Ensure anon/authenticated can read base tables through invoker views.
-- RLS already restricts rows: salons has "Salons are publicly viewable",
-- DBP has "DBP: anon can view verified via view".
GRANT SELECT ON public.salons TO anon, authenticated;
GRANT SELECT ON public.district_business_partners TO anon, authenticated;
GRANT SELECT ON public.public_salon_cards TO anon, authenticated;
GRANT SELECT ON public.public_dbp_profiles TO anon, authenticated;

-- 3) shop_staff_public_read_phone_exposed — drop public read on legacy table.
-- V1 uses public.staff (not shop_staff). Owners/admins still managed via
-- shop_staff_admin_manage policy.
DROP POLICY IF EXISTS shop_staff_public_read ON public.shop_staff;
