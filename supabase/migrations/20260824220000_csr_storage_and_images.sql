-- 1. Create CSR-media bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'CSR-media',
  'CSR-media',
  true,
  52428800, -- 50 MB
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage RLS policies for CSR-media bucket
DROP POLICY IF EXISTS "Public can view CSR-media images" ON storage.objects;
CREATE POLICY "Public can view CSR-media images"
ON storage.objects FOR SELECT
USING (bucket_id = 'CSR-media');

DROP POLICY IF EXISTS "Authenticated users can upload CSR-media images" ON storage.objects;
CREATE POLICY "Authenticated users can upload CSR-media images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'CSR-media'
);

DROP POLICY IF EXISTS "Authenticated users can update CSR-media images" ON storage.objects;
CREATE POLICY "Authenticated users can update CSR-media images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'CSR-media'
)
WITH CHECK (
  bucket_id = 'CSR-media'
);

DROP POLICY IF EXISTS "Authenticated users can delete CSR-media images" ON storage.objects;
CREATE POLICY "Authenticated users can delete CSR-media images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'CSR-media'
);

-- 3. Update existing CSR activities image URLs
UPDATE public.csr_activities
SET image_url = REPLACE(image_url, '/src/assets/', '/assets/')
WHERE image_url LIKE '/src/assets/%';
