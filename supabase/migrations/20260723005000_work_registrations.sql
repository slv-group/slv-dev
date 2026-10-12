-- ============================================================
-- WORK REGISTRATIONS
-- Architect / Contractor / Vendor & Supplier applications
-- ============================================================


-- 1. Create registrations table
CREATE TABLE IF NOT EXISTS public.work_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  registration_type TEXT NOT NULL CHECK (
    registration_type IN (
      'architect_consultant',
      'contractor',
      'vendor_supplier'
    )
  ),

  applicant_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,

  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  document_paths JSONB NOT NULL DEFAULT '{}'::jsonb,

  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN (
      'pending',
      'reviewing',
      'approved',
      'rejected'
    )
  ),

  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.work_registrations
ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 3. PUBLIC INSERT POLICY
-- Visitors can submit registration forms
-- ============================================================
DROP POLICY IF EXISTS "Anyone can submit work registration"
ON public.work_registrations;

CREATE POLICY "Anyone can submit work registration"
ON public.work_registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'pending'
);


-- ============================================================
-- 4. STAFF SELECT POLICY
-- Only admins/editors can read applications
-- ============================================================
DROP POLICY IF EXISTS "Staff can view work registrations"
ON public.work_registrations;

CREATE POLICY "Staff can view work registrations"
ON public.work_registrations
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'editor')
);


-- ============================================================
-- 5. STAFF UPDATE POLICY
-- Admins/editors can update application status/notes
-- ============================================================
DROP POLICY IF EXISTS "Staff can update work registrations"
ON public.work_registrations;

CREATE POLICY "Staff can update work registrations"
ON public.work_registrations
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'editor')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'editor')
);


-- ============================================================
-- 6. CREATE PRIVATE STORAGE BUCKET
-- Used for PAN/GST/COA/etc. documents
-- ============================================================

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit
)
VALUES (
  'registration-documents',
  'registration-documents',
  false,
  5242880
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 7. ALLOW REGISTRATION DOCUMENT UPLOADS
-- ============================================================
DROP POLICY IF EXISTS "Anyone can upload registration documents"
ON storage.objects;

CREATE POLICY "Anyone can upload registration documents"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'registration-documents'
);