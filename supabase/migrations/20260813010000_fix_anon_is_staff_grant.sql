-- ============================================================
-- Fix: Allow anon role to execute is_staff() so RLS SELECT
-- policies on projects (and other tables) work for public visitors
-- ============================================================

GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO anon;
