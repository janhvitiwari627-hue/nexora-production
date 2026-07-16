-- Complete the Salon Owner live-data path on Lovable Cloud.

-- Salon website media is intentionally public, while object writes stay
-- restricted by the existing owner-folder storage policies.
UPDATE storage.buckets
SET public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY[
      'image/jpeg', 'image/png', 'image/webp',
      'video/mp4', 'video/webm'
    ]
WHERE id = 'salon-media';

-- Every salon has a wallet row. Owners may create the zero-balance row for a
-- salon they own, but only trusted payment/admin workflows may change balances.
INSERT INTO public.salon_wallets (salon_id)
SELECT s.id
FROM public.salons s
WHERE s.deleted_at IS NULL
ON CONFLICT (salon_id) DO NOTHING;

DROP POLICY IF EXISTS "Owners initialize their wallet" ON public.salon_wallets;
CREATE POLICY "Owners initialize their wallet"
ON public.salon_wallets FOR INSERT
TO authenticated
WITH CHECK (public.is_salon_owner((SELECT auth.uid()), salon_id));

GRANT SELECT, INSERT ON public.salon_wallets TO authenticated;
GRANT SELECT ON public.wallet_transactions TO authenticated;
GRANT SELECT, INSERT ON public.withdrawals TO authenticated;

-- Owner replies are written through a role-checked RPC. Owners never receive a
-- broad UPDATE grant on customer review ratings/comments.
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS owner_reply text,
  ADD COLUMN IF NOT EXISTS owner_replied_at timestamptz;

DROP POLICY IF EXISTS "Owners read their salon reviews" ON public.reviews;
CREATE POLICY "Owners read their salon reviews"
ON public.reviews FOR SELECT
TO authenticated
USING (public.is_salon_owner((SELECT auth.uid()), salon_id));

CREATE OR REPLACE FUNCTION public.reply_to_salon_review(
  _review_id uuid,
  _reply text
) RETURNS public.reviews
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  review_row public.reviews%ROWTYPE;
BEGIN
  SELECT * INTO review_row
  FROM public.reviews
  WHERE id = _review_id
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'Review not found'; END IF;
  IF auth.uid() IS NULL OR NOT public.is_salon_owner(auth.uid(), review_row.salon_id) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  IF length(trim(coalesce(_reply, ''))) < 1 OR length(_reply) > 1000 THEN
    RAISE EXCEPTION 'Reply must be between 1 and 1000 characters';
  END IF;

  UPDATE public.reviews
  SET owner_reply = trim(_reply), owner_replied_at = now(), updated_at = now()
  WHERE id = _review_id
  RETURNING * INTO review_row;

  RETURN review_row;
END;
$$;

REVOKE ALL ON FUNCTION public.reply_to_salon_review(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reply_to_salon_review(uuid,text) TO authenticated;
GRANT SELECT (id, salon_id, user_id, rating, comment, created_at, updated_at,
              owner_reply, owner_replied_at)
ON public.reviews TO authenticated;

-- Live owner screens refresh immediately after a safe row-level change.
DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'salons', 'services', 'reviews', 'salon_wallets',
    'wallet_transactions', 'withdrawals'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = table_name
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', table_name);
    END IF;
  END LOOP;
END;
$$;
