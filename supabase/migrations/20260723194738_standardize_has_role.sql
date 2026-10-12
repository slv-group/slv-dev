-- ============================================================
-- STANDARDIZE ROLE / STAFF AUTHORIZATION FUNCTIONS
-- ============================================================

-- ------------------------------------------------------------
-- 1. Standardize has_role(uuid, app_role)
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.has_role(
  _user_id uuid,
  _role public.app_role
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

REVOKE ALL
ON FUNCTION public.has_role(uuid, public.app_role)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.has_role(uuid, public.app_role)
TO authenticated;

-- Remove old reversed overload
DROP FUNCTION IF EXISTS public.has_role(
  public.app_role,
  uuid
);


-- ------------------------------------------------------------
-- 2. Fix is_staff(uuid)
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_staff(
  _user_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN (
        'admin'::public.app_role,
        'editor'::public.app_role
      )
  );
$$;

REVOKE ALL
ON FUNCTION public.is_staff(uuid)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.is_staff(uuid)
TO authenticated;


-- ------------------------------------------------------------
-- 3. Simplify user_roles SELECT policy
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Allow select user_roles for self and admin"
ON public.user_roles;

DROP POLICY IF EXISTS "Users can view own role"
ON public.user_roles;

CREATE POLICY "Users can view own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  user_id = (SELECT auth.uid())
);