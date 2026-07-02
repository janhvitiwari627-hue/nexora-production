-- Remove anon SELECT policy on salons: it exposed email/phone/upi_id/owner_name.
-- Public browsing already uses the public_salon_cards view and RPC functions
-- (nearby_salons, shops_search, recommended_salons), which project only safe columns.
DROP POLICY IF EXISTS "Anonymous can read active salon marketing rows" ON public.salons;
REVOKE SELECT ON public.salons FROM anon;