
-- Drop anon read on partner table and supporting view; partner public
-- profile is not part of V1 and re-enables on a stricter contract in V2.
DROP POLICY IF EXISTS "DBP: anon can view verified via view" ON public.district_business_partners;
REVOKE ALL ON public.district_business_partners FROM anon;
DROP VIEW IF EXISTS public.public_dbp_profiles;
