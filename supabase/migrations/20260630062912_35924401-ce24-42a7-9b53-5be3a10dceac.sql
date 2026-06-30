
-- Hide private contact columns of salons from anonymous (public) viewers.
-- Authenticated users (including the owner via RLS-managed views) keep access.
REVOKE SELECT (phone, email, whatsapp) ON public.salons FROM anon;
