-- ============================================================
-- Auto-assign admin role on user signup & profile syncing
-- ============================================================

-- 1. Enable RLS insert/upsert for users on public.profiles and public.user_roles
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert their initial role" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow insert user_roles for self and admin"
ON public.user_roles;
CREATE POLICY "Allow insert user_roles for self and admin"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.has_role('admin'::app_role, auth.uid())));

-- 2. Update handle_new_user trigger function to auto-assign admin role & sync profile details
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create or update profile
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

  -- Auto assign admin role to new user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin'::public.app_role)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 3. Backfill all existing users in auth.users with admin role if not assigned
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 4. Backfill all existing profiles from auth.users
INSERT INTO public.profiles (id, email, full_name)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', email)
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = now();
