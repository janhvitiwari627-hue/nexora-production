ALTER TABLE public.salon_owners
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);

-- Grandfather any existing links so current owners keep access
UPDATE public.salon_owners SET is_approved = true, approved_at = now() WHERE is_approved = false;

-- Existing is_salon_owner is used in RLS across services/staff/etc.
-- Tighten it to require approval. SECURITY DEFINER keeps the old contract.
CREATE OR REPLACE FUNCTION public.is_salon_owner(_user_id uuid, _salon_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.salon_owners
    WHERE user_id = _user_id
      AND salon_id = _salon_id
      AND is_approved = true
  )
$function$;

CREATE INDEX IF NOT EXISTS idx_salon_owners_approval ON public.salon_owners(is_approved);