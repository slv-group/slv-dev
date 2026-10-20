-- Add area_unit column to projects table
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS area_unit text DEFAULT 'sqft';
