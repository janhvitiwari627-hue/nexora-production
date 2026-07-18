-- Storage public URLs do not require broad SELECT policies. Removing these
-- prevents bucket-wide listing while preserving public object delivery.
DROP POLICY IF EXISTS "Avatars are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Public reads avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public read salon-media" ON storage.objects;
DROP POLICY IF EXISTS "Public reads salon media" ON storage.objects;
DROP POLICY IF EXISTS "Public reads review media" ON storage.objects;

-- Internal-only SECURITY DEFINER functions: triggers, cron and trusted server
-- routes use postgres/service_role and browser roles must never call them.
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_email(text,bigint) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enqueue_email(text,jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.move_to_dlq(text,text,bigint,jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.read_email_batch(text,integer,integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_partner_financial_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recompute_partner_leaderboard(public.dbp_leaderboard_period) FROM PUBLIC, anon, authenticated;

-- Anonymous users must never execute administrative review actions.
REVOKE ALL ON FUNCTION public.review_partner_application(uuid,boolean,text) FROM PUBLIC, anon;

-- Legitimate browser RPCs retain authenticated EXECUTE because application
-- flows use them. Pin lookup order to trusted schemas.
ALTER FUNCTION public.complete_owner_salon_setup(uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.create_user_website_from_template(uuid,uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_at_risk_customers(uuid,integer) SET search_path = pg_catalog, public;
ALTER FUNCTION public.has_role(uuid,public.app_role) SET search_path = pg_catalog, public;
ALTER FUNCTION public.is_district_partner(uuid,uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.is_salon_owner(uuid,uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.is_shop_member(uuid,uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.is_shop_member_biz(uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.is_shop_owner_biz(uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.is_super_admin() SET search_path = pg_catalog, public;
ALTER FUNCTION public.is_super_admin(uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.list_pending_owner_salons() SET search_path = pg_catalog, public;
ALTER FUNCTION public.list_salon_staff(uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.owner_transition_booking(uuid,text,date,time without time zone,text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.recompute_partner_dashboard_metrics(uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.register_owner_business(text,text,text,text,text,text,text,text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.reply_to_salon_review(uuid,text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.request_withdrawal(uuid,numeric,jsonb) SET search_path = pg_catalog, public;
ALTER FUNCTION public.review_owner_salon(uuid,boolean) SET search_path = pg_catalog, public;
ALTER FUNCTION public.review_partner_application(uuid,boolean,text) SET search_path = pg_catalog, public;

-- Add covering indexes for foreign keys that currently have no index containing
-- all FK columns. Existing indexes are preserved and never dropped.
DO $$
DECLARE
  fk record;
  index_name text;
BEGIN
  FOR fk IN
    SELECT
      c.oid,
      n.nspname AS schema_name,
      t.relname AS table_name,
      c.conname,
      c.conrelid,
      c.conkey,
      string_agg(quote_ident(a.attname), ', ' ORDER BY u.ord) AS columns_sql
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    CROSS JOIN LATERAL unnest(c.conkey) WITH ORDINALITY AS u(attnum, ord)
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = u.attnum
    WHERE c.contype = 'f'
      AND n.nspname = 'public'
      AND NOT EXISTS (
        SELECT 1
        FROM pg_index i
        WHERE i.indrelid = c.conrelid
          AND i.indisvalid
          AND c.conkey <@ (i.indkey::smallint[])
      )
    GROUP BY c.oid, n.nspname, t.relname, c.conname, c.conrelid, c.conkey
  LOOP
    index_name := left('idx_' || fk.table_name || '_' || replace(fk.conname, fk.table_name || '_', ''), 63);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I.%I (%s)',
      index_name, fk.schema_name, fk.table_name, fk.columns_sql);
  END LOOP;
END
$$;
