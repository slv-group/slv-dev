-- Allow admins/editors to read registration documents
-- Check user_roles directly instead of calling has_role()

DROP POLICY IF EXISTS "Staff can view registration documents"
ON storage.objects;

CREATE POLICY "Staff can view registration documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'registration-documents'
  AND EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN (
        'admin'::public.app_role,
        'editor'::public.app_role
      )
  )
);