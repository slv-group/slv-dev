-- 1. Revoke direct API EXECUTE on SECURITY DEFINER helper functions.
-- They are still usable inside RLS policy expressions (policy quals are not
-- subject to per-caller EXECUTE checks), but can no longer be invoked via
-- /rest/v1/rpc by anon or authenticated.
REVOKE EXECUTE ON FUNCTION public.has_role(app_role, uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM anon, authenticated, public;

-- 2. Replace permissive always-true INSERT policies with validated checks.
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
CREATE POLICY "Anyone can submit a lead"
ON public.leads
FOR INSERT
TO public
WITH CHECK (
  status = 'new'::lead_status
  AND char_length(name) BETWEEN 1 AND 200
  AND (email IS NULL OR char_length(email) <= 320)
  AND (phone IS NULL OR char_length(phone) <= 40)
  AND (message IS NULL OR char_length(message) <= 5000)
  AND (notes IS NULL)
);

DROP POLICY IF EXISTS "Anyone can apply" ON public.job_applications;
CREATE POLICY "Anyone can apply"
ON public.job_applications
FOR INSERT
TO public
WITH CHECK (
  status = 'new'
  AND char_length(full_name) BETWEEN 1 AND 200
  AND char_length(email) BETWEEN 3 AND 320
  AND (phone IS NULL OR char_length(phone) <= 40)
  AND (cover_note IS NULL OR char_length(cover_note) <= 5000)
);
