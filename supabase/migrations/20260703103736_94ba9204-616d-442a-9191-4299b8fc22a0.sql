-- Tighten Growth Partner RLS + add audit logging for commission/payout changes

-- 1) partner_payouts: partner can view own payouts (was admin-only, so partners couldn't even see their history)
CREATE POLICY "Payouts: owner view"
  ON public.partner_payouts
  FOR SELECT
  TO authenticated
  USING (public.is_district_partner(auth.uid(), partner_id));

-- 2) partner_shop_mapping: replace overly-permissive owner ALL with granular policies
--    Partner can: view own mappings, add new shops they onboard.
--    Partner cannot: approve/verify (update), delete active shops.
DROP POLICY IF EXISTS "Mapping: owner manage" ON public.partner_shop_mapping;

CREATE POLICY "Mapping: owner view"
  ON public.partner_shop_mapping
  FOR SELECT
  TO authenticated
  USING (public.is_district_partner(auth.uid(), partner_id));

CREATE POLICY "Mapping: owner insert lead"
  ON public.partner_shop_mapping
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_district_partner(auth.uid(), partner_id)
    AND COALESCE(is_active, false) = false        -- partner cannot self-approve to active
  );

CREATE POLICY "Mapping: owner delete inactive"
  ON public.partner_shop_mapping
  FOR DELETE
  TO authenticated
  USING (
    public.is_district_partner(auth.uid(), partner_id)
    AND COALESCE(is_active, false) = false        -- cannot delete active shops
  );
-- Note: no partner UPDATE policy — only admin (via existing "Mapping: admin manage") can approve/modify.

-- 3) Audit trigger function — writes structured entry to audit_logs on commission/payout changes
CREATE OR REPLACE FUNCTION public.log_partner_financial_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action text;
  v_row jsonb;
  v_old  jsonb;
BEGIN
  v_action := lower(TG_OP);
  v_row := CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END;
  v_old := CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END;

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    TG_TABLE_NAME || '.' || v_action,
    TG_TABLE_NAME,
    COALESCE((v_row->>'id')::uuid, gen_random_uuid()),
    jsonb_build_object(
      'op', TG_OP,
      'new', v_row,
      'old', v_old
    )
  );

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

-- 4) Attach audit triggers to commission + payout tables
DROP TRIGGER IF EXISTS partner_earnings_audit ON public.partner_earnings;
CREATE TRIGGER partner_earnings_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.partner_earnings
  FOR EACH ROW EXECUTE FUNCTION public.log_partner_financial_change();

DROP TRIGGER IF EXISTS partner_payouts_audit ON public.partner_payouts;
CREATE TRIGGER partner_payouts_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.partner_payouts
  FOR EACH ROW EXECUTE FUNCTION public.log_partner_financial_change();

-- Bonus: audit approval/verification changes on shop mappings too
DROP TRIGGER IF EXISTS partner_shop_mapping_audit ON public.partner_shop_mapping;
CREATE TRIGGER partner_shop_mapping_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.partner_shop_mapping
  FOR EACH ROW EXECUTE FUNCTION public.log_partner_financial_change();