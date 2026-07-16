-- One-time Lovable Cloud authentication reset.
--
-- Most user-owned rows are removed automatically through ON DELETE CASCADE.
-- These four nullable audit/approval columns use PostgreSQL's default
-- ON DELETE NO ACTION, so detach them before removing the auth identities.
UPDATE public.salon_owners
SET approved_by = NULL
WHERE approved_by IS NOT NULL;

UPDATE public.bookings
SET cancelled_by = NULL
WHERE cancelled_by IS NOT NULL;

UPDATE public.district_business_partners
SET verified_by = NULL
WHERE verified_by IS NOT NULL;

UPDATE public.partner_activity_logs
SET actor_id = NULL
WHERE actor_id IS NOT NULL;

-- Deleting from auth.users also removes profiles, roles, sessions,
-- identities, and all application rows whose foreign keys cascade.
DELETE FROM auth.users;
