-- ============================================================
-- MAKE WORK REGISTRATIONS EMAIL NULLABLE & EXPAND TYPES
-- Enables streamlined registration forms where email is optional or removed.
-- ============================================================

-- 1. Make email column nullable for simplified registrations
ALTER TABLE public.work_registrations 
  ALTER COLUMN email DROP NOT NULL;

-- 2. Update registration_type CHECK constraint to support land_proposal and workshop
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'work_registrations_registration_type_check'
  ) THEN
    ALTER TABLE public.work_registrations 
      DROP CONSTRAINT work_registrations_registration_type_check;

    ALTER TABLE public.work_registrations 
      ADD CONSTRAINT work_registrations_registration_type_check 
      CHECK (
        registration_type IN (
          'architect_consultant',
          'contractor',
          'vendor_supplier',
          'land_proposal',
          'workshop'
        )
      );
  END IF;
END $$;
