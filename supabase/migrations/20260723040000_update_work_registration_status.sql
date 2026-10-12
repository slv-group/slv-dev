-- ============================================================
-- WORK REGISTRATION STATUS WORKFLOW
-- pending -> under_review -> approved/rejected
-- ============================================================

-- Remove old status constraint
ALTER TABLE public.work_registrations
DROP CONSTRAINT IF EXISTS work_registrations_status_check;


-- Convert any existing "reviewing" records
UPDATE public.work_registrations
SET status = 'under_review'
WHERE status = 'reviewing';


-- Add new constraint
ALTER TABLE public.work_registrations
ADD CONSTRAINT work_registrations_status_check
CHECK (
  status IN (
    'pending',
    'under_review',
    'approved',
    'rejected'
  )
);