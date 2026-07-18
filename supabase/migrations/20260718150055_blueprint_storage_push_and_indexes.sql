CREATE TABLE IF NOT EXISTS public.push_device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  platform text NOT NULL CHECK (platform IN ('web','android','ios')),
  device_name text,
  is_active boolean NOT NULL DEFAULT true,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS push_device_tokens_user_idx ON public.push_device_tokens(user_id, is_active);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_device_tokens TO authenticated;
GRANT ALL ON public.push_device_tokens TO service_role;
ALTER TABLE public.push_device_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own push devices" ON public.push_device_tokens FOR ALL TO authenticated
  USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));

INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES
 ('avatars','avatars',true,5242880,ARRAY['image/jpeg','image/png','image/webp']),
 ('salon-media','salon-media',true,26214400,ARRAY['image/jpeg','image/png','image/webp','video/mp4']),
 ('review-media','review-media',true,10485760,ARRAY['image/jpeg','image/png','image/webp','video/mp4'])
ON CONFLICT (id) DO UPDATE SET
  file_size_limit=EXCLUDED.file_size_limit,
  allowed_mime_types=EXCLUDED.allowed_mime_types;

CREATE POLICY "Public reads avatars" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id='avatars');
CREATE POLICY "Users upload own avatars" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='avatars' AND (storage.foldername(name))[1]=(select auth.uid())::text);
CREATE POLICY "Users update own avatars" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id='avatars' AND owner_id=(select auth.uid())::text)
  WITH CHECK (bucket_id='avatars' AND (storage.foldername(name))[1]=(select auth.uid())::text);
CREATE POLICY "Users delete own avatars" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='avatars' AND owner_id=(select auth.uid())::text);

CREATE POLICY "Public reads salon media" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id='salon-media');
CREATE POLICY "Owners upload salon media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='salon-media' AND public.is_salon_owner((select auth.uid()), ((storage.foldername(name))[1])::uuid));
CREATE POLICY "Owners update salon media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id='salon-media' AND public.is_salon_owner((select auth.uid()), ((storage.foldername(name))[1])::uuid))
  WITH CHECK (bucket_id='salon-media' AND public.is_salon_owner((select auth.uid()), ((storage.foldername(name))[1])::uuid));
CREATE POLICY "Owners delete salon media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='salon-media' AND public.is_salon_owner((select auth.uid()), ((storage.foldername(name))[1])::uuid));

CREATE POLICY "Public reads review media" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id='review-media');
CREATE POLICY "Users upload own review media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='review-media' AND (storage.foldername(name))[1]=(select auth.uid())::text);
CREATE POLICY "Users update own review media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id='review-media' AND owner_id=(select auth.uid())::text)
  WITH CHECK (bucket_id='review-media' AND (storage.foldername(name))[1]=(select auth.uid())::text);
CREATE POLICY "Users delete own review media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='review-media' AND owner_id=(select auth.uid())::text);

CREATE INDEX IF NOT EXISTS booking_status_history_changed_by_idx ON public.booking_status_history(changed_by) WHERE changed_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS review_reports_resolved_by_idx ON public.review_reports(resolved_by) WHERE resolved_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS review_replies_author_idx ON public.review_replies(author_id);
CREATE INDEX IF NOT EXISTS staff_time_off_created_by_idx ON public.staff_time_off(created_by);
CREATE INDEX IF NOT EXISTS payment_ledger_booking_idx ON public.payment_ledger(booking_id) WHERE booking_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS wallet_ledger_user_idx ON public.wallet_ledger(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS wallet_ledger_payment_idx ON public.wallet_ledger(payment_id) WHERE payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS wallet_ledger_booking_idx ON public.wallet_ledger(booking_id) WHERE booking_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS wallet_settlements_requested_by_idx ON public.wallet_settlements(requested_by);
CREATE INDEX IF NOT EXISTS wallet_settlements_processed_by_idx ON public.wallet_settlements(processed_by) WHERE processed_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS reward_transactions_booking_idx ON public.reward_transactions(booking_id) WHERE booking_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS reward_transactions_payment_idx ON public.reward_transactions(payment_id) WHERE payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS reward_transactions_referral_idx ON public.reward_transactions(referral_attribution_id) WHERE referral_attribution_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS referral_transactions_attribution_idx ON public.referral_transactions(attribution_id);
CREATE INDEX IF NOT EXISTS referral_transactions_booking_idx ON public.referral_transactions(booking_id) WHERE booking_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS notification_deliveries_notification_idx ON public.notification_deliveries(notification_id) WHERE notification_id IS NOT NULL;
