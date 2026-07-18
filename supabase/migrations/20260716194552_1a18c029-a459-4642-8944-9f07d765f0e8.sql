DROP POLICY IF EXISTS "portal-media public read" ON storage.objects;
CREATE POLICY "portal-media owner read"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'portal-media'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);