-- Add read/unread state to work registrations
ALTER TABLE public.work_registrations
ADD COLUMN IF NOT EXISTS viewed BOOLEAN NOT NULL DEFAULT false;

-- Useful for unread-message queries
CREATE INDEX IF NOT EXISTS idx_work_registrations_viewed
ON public.work_registrations(viewed);

-- Staff need permission to read files from the private bucket
DROP POLICY IF EXISTS "Staff can view registration documents"
ON storage.objects;

CREATE POLICY "Staff can view registration documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'registration-documents'
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'editor')
  )
);