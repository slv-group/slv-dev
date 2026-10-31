-- Minimal, Non-Destructive Migration: Support WhatsApp number and Enquiry Type in leads table
-- Safe, idempotent column additions for enhanced lead capture

DO $$
BEGIN
  -- Add whatsapp_number column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'whatsapp_number'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN whatsapp_number text;
  END IF;

  -- Add is_whatsapp boolean flag if not exists (default true)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'is_whatsapp'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN is_whatsapp boolean DEFAULT true;
  END IF;

  -- Add enquiry_type column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'enquiry_type'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN enquiry_type text DEFAULT 'Residential';
  END IF;
END $$;

COMMENT ON COLUMN public.leads.whatsapp_number IS 'Optional separate or verified WhatsApp number with international country code';
COMMENT ON COLUMN public.leads.is_whatsapp IS 'Whether primary phone number is also the WhatsApp contact number';
COMMENT ON COLUMN public.leads.enquiry_type IS 'Category of enquiry: Residential, Commercial, Plots, Others';
