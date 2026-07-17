
CREATE OR REPLACE FUNCTION public.review_partner_application(
  _partner_id uuid,
  _approve boolean,
  _reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p public.district_business_partners%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT * INTO p FROM public.district_business_partners
   WHERE id = _partner_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Application not found'; END IF;

  IF _approve THEN
    UPDATE public.district_business_partners
       SET status = 'verified',
           verified_at = now(),
           verified_by = auth.uid(),
           rejection_reason = NULL,
           updated_at = now()
     WHERE id = _partner_id;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (p.user_id, 'growth_partner'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    UPDATE public.district_business_partners
       SET status = 'rejected',
           rejection_reason = NULLIF(trim(coalesce(_reason, '')), ''),
           updated_at = now()
     WHERE id = _partner_id;
  END IF;

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    CASE WHEN _approve THEN 'admin.approve_partner' ELSE 'admin.reject_partner' END,
    'district_business_partner',
    _partner_id,
    jsonb_build_object('user_id', p.user_id, 'reason', _reason)
  );

  RETURN jsonb_build_object('ok', true, 'approved', _approve);
END;
$$;

GRANT EXECUTE ON FUNCTION public.review_partner_application(uuid, boolean, text) TO authenticated;
