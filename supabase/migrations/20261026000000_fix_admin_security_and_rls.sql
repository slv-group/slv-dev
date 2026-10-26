-- ============================================================
-- FIX: SECURE ADMIN REGISTRATION, USER ROLES & PROJECT SLUGS
-- 1. Remove auto-assignment of 'admin' role on user signup
-- 2. Restrict public.user_roles INSERT/UPDATE/DELETE strictly to existing admins
-- 3. Update Green Horizon 2 slug to canonical 'slv-green-horizon-2'
-- ============================================================

-- ── 1. Revoke self-insertion into public.user_roles ────────
DROP POLICY IF EXISTS "Allow insert user_roles for self and admin" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their initial role" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admin can insert user_roles" ON public.user_roles;

CREATE POLICY "Only admin can insert user_roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admin can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admin can update user_roles" ON public.user_roles;

CREATE POLICY "Only admin can update user_roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admin can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admin can delete user_roles" ON public.user_roles;

CREATE POLICY "Only admin can delete user_roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ── 2. Update handle_new_user trigger to NOT assign any admin role ──
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile record without granting any administrative or staff privileges
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = now();

  RETURN NEW;
END;
$$;

-- ── 3. Canonicalize project slug for SLV Green Horizon-2 ────
UPDATE public.projects
SET slug = 'slv-green-horizon-2'
WHERE slug = 'slv-greenhorizon-2';
