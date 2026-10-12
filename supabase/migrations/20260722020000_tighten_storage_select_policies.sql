-- ============================================================
-- Fix: Tighten storage SELECT policies to prevent anonymous
-- file listing while keeping direct URL access and admin listing
-- Resolves Supabase Security Advisor warnings:
--   - public_bucket_allows_listing_brochures
--   - public_bucket_allows_listing_project-media
--
-- HOW IT WORKS:
--   - Public buckets serve files via direct URL WITHOUT any RLS policy
--     (the bucket's `public = true` setting handles that)
--   - The broad SELECT policy on storage.objects is ONLY needed for
--     `.list()` API calls — so we scope it to authenticated staff only
--   - This removes anonymous enumeration while keeping admin listing intact
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- 1. project-media bucket — tighten SELECT policy
-- ──────────────────────────────────────────────────────────

-- Remove the broad public SELECT policy (no longer needed for URL access)
DROP POLICY IF EXISTS "Public read project-media" ON storage.objects;

-- Staff-only listing: admin panel needs .list() for video/file management
CREATE POLICY "Staff can list project-media"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'project-media'
    AND (SELECT public.is_staff(auth.uid()))
  );

-- ──────────────────────────────────────────────────────────
-- 2. brochures bucket — tighten SELECT policy
-- ──────────────────────────────────────────────────────────

-- Remove the broad public SELECT policy (no longer needed for URL access)
DROP POLICY IF EXISTS "Public read brochures" ON storage.objects;

-- Staff-only listing: admin panel needs .list() for brochure management
CREATE POLICY "Staff can list brochures"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'brochures'
    AND (SELECT public.is_staff(auth.uid()))
  );
