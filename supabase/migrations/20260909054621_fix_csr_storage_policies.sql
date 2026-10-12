-- Remove the existing CSR storage policies
DROP POLICY IF EXISTS "Public can view CSR-media images"
ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can upload CSR-media images"
ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can update CSR-media images"
ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can delete CSR-media images"
ON storage.objects;


-- Public can read CSR images
CREATE POLICY "Public can view CSR-media images"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'CSR-media'
);


-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload CSR-media images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'CSR-media'
);


-- Authenticated users can update
CREATE POLICY "Authenticated users can update CSR-media images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'CSR-media'
)
WITH CHECK (
  bucket_id = 'CSR-media'
);


-- Authenticated users can delete
CREATE POLICY "Authenticated users can delete CSR-media images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'CSR-media'
);