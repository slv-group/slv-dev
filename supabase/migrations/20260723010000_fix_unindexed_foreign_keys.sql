-- Migration: Fix unindexed foreign keys (performance lint 0001_unindexed_foreign_keys)
-- Adds covering indexes for the three foreign key columns identified by the Supabase linter.

-- 1. public.gallery → gallery_project_id_fkey
CREATE INDEX IF NOT EXISTS idx_gallery_project_id
  ON public.gallery (project_id);

-- 2. public.job_applications → job_applications_job_id_fkey
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id
  ON public.job_applications (job_id);

-- 3. public.leads → leads_project_id_fkey
CREATE INDEX IF NOT EXISTS idx_leads_project_id
  ON public.leads (project_id);
