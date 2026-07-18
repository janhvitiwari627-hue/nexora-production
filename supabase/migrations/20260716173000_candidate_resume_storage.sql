INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'candidate-resumes',
  'candidate-resumes',
  false,
  5242880,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Candidates upload own resumes" ON storage.objects;
CREATE POLICY "Candidates upload own resumes"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'candidate-resumes'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS "Candidates read own resumes" ON storage.objects;
CREATE POLICY "Candidates read own resumes"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'candidate-resumes'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS "Candidates replace own resumes" ON storage.objects;
CREATE POLICY "Candidates replace own resumes"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'candidate-resumes'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'candidate-resumes'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS "Candidates delete own resumes" ON storage.objects;
CREATE POLICY "Candidates delete own resumes"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'candidate-resumes'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
