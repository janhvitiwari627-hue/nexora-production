-- Public read of all files in salon-media
CREATE POLICY "Public read salon-media"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'salon-media');

-- Owners can upload to their salon's folder
CREATE POLICY "Owners upload to their salon folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'salon-media'
    AND public.is_salon_owner(auth.uid(), (split_part(name, '/', 1))::uuid)
  );

CREATE POLICY "Owners update their salon files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'salon-media'
    AND public.is_salon_owner(auth.uid(), (split_part(name, '/', 1))::uuid)
  );

CREATE POLICY "Owners delete their salon files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'salon-media'
    AND public.is_salon_owner(auth.uid(), (split_part(name, '/', 1))::uuid)
  );