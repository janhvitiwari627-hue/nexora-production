
-- profile-images bucket policies (private bucket, user-scoped by top-level folder = auth.uid())
CREATE POLICY "profile_images_owner_select"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "profile_images_owner_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "profile_images_owner_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "profile_images_owner_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);
