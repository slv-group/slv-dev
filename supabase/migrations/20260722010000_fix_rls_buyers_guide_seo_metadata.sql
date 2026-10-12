-- ============================================================
-- Fix: Enable RLS on buyers_guide and seo_metadata tables
-- Resolves Supabase Security Advisor errors:
--   - rls_disabled_in_public_public_buyers_guide
--   - rls_disabled_in_public_public_seo_metadata
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- 1. buyers_guide — enable RLS + policies
-- ──────────────────────────────────────────────────────────
ALTER TABLE public.buyers_guide ENABLE ROW LEVEL SECURITY;

-- Public visitors and staff can read guides (staff can view unpublished)
DROP POLICY IF EXISTS "Public can view published buyers_guide" ON public.buyers_guide;
DROP POLICY IF EXISTS "Staff can manage buyers_guide" ON public.buyers_guide;
CREATE POLICY "Allow select buyers_guide for public and staff"
  ON public.buyers_guide FOR SELECT
  TO public
  USING (is_published = true OR (SELECT public.is_staff(auth.uid())));

-- Staff (admin/editor) write operations
CREATE POLICY "Staff can insert buyers_guide"
  ON public.buyers_guide FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_staff(auth.uid())));

CREATE POLICY "Staff can update buyers_guide"
  ON public.buyers_guide FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_staff(auth.uid())))
  WITH CHECK ((SELECT public.is_staff(auth.uid())));

CREATE POLICY "Staff can delete buyers_guide"
  ON public.buyers_guide FOR DELETE
  TO authenticated
  USING ((SELECT public.is_staff(auth.uid())));

-- ──────────────────────────────────────────────────────────
-- 2. seo_metadata — enable RLS + policies
-- ──────────────────────────────────────────────────────────
ALTER TABLE public.seo_metadata ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can read SEO metadata (needed for page rendering)
DROP POLICY IF EXISTS "Public can read seo_metadata" ON public.seo_metadata;
CREATE POLICY "Public can read seo_metadata"
  ON public.seo_metadata FOR SELECT
  TO public
  USING (true);

-- Staff (admin/editor) write operations
DROP POLICY IF EXISTS "Staff can manage seo_metadata" ON public.seo_metadata;
CREATE POLICY "Staff can insert seo_metadata"
  ON public.seo_metadata FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_staff(auth.uid())));

CREATE POLICY "Staff can update seo_metadata"
  ON public.seo_metadata FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_staff(auth.uid())))
  WITH CHECK ((SELECT public.is_staff(auth.uid())));

CREATE POLICY "Staff can delete seo_metadata"
  ON public.seo_metadata FOR DELETE
  TO authenticated
  USING ((SELECT public.is_staff(auth.uid())));
