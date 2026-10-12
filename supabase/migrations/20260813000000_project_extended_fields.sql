-- ============================================================
-- Add sqft_to and launch_date to projects table
-- ============================================================

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS sqft_to     numeric,
  ADD COLUMN IF NOT EXISTS launch_date text;
