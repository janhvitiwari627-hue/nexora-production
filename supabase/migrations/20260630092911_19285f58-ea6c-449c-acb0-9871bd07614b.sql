ALTER VIEW public.public_salon_cards SET (security_invoker = off);
GRANT SELECT ON public.public_salon_cards TO anon, authenticated;