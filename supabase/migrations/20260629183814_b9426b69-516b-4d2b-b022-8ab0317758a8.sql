-- Fix permission denied: expose safe public views to anon/authenticated without granting access to base salons table.
ALTER VIEW public.public_salon_cards SET (security_invoker = false);
ALTER VIEW public.public_dbp_profiles SET (security_invoker = false);

GRANT SELECT ON public.public_salon_cards TO anon, authenticated;
GRANT SELECT ON public.public_dbp_profiles TO anon, authenticated;

-- Services and reviews already have permissive public SELECT RLS policies; grant Data API access.
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;

GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

-- Salons base table: authenticated + service_role only (PII protected; public goes through view).
GRANT SELECT, INSERT, UPDATE, DELETE ON public.salons TO authenticated;
GRANT ALL ON public.salons TO service_role;