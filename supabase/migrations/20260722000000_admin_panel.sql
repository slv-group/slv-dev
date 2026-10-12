-- ============================================================
-- SLV Admin Panel — Storage Buckets + Admin RLS Policies
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- 1. Storage Buckets
-- ──────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'project-media',
    'project-media',
    true,
    52428800, -- 50 MB
    ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif','video/mp4','video/webm','video/mov']
  ),
  (
    'brochures',
    'brochures',
    true,
    20971520, -- 20 MB
    ARRAY['application/pdf']
  )
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────
-- 2. Storage RLS — project-media bucket
-- ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read project-media" ON storage.objects;
CREATE POLICY "Public read project-media"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'project-media');

DROP POLICY IF EXISTS "Admin/editor can upload project-media" ON storage.objects;
CREATE POLICY "Admin/editor can upload project-media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'project-media'
    AND (SELECT public.is_staff(auth.uid()))
  );

DROP POLICY IF EXISTS "Admin/editor can update project-media" ON storage.objects;
CREATE POLICY "Admin/editor can update project-media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'project-media'
    AND (SELECT public.is_staff(auth.uid()))
  );

DROP POLICY IF EXISTS "Admin/editor can delete project-media" ON storage.objects;
CREATE POLICY "Admin/editor can delete project-media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'project-media'
    AND (SELECT public.is_staff(auth.uid()))
  );

-- ──────────────────────────────────────────────────────────
-- 3. Storage RLS — brochures bucket
-- ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read brochures" ON storage.objects;
CREATE POLICY "Public read brochures"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'brochures');

DROP POLICY IF EXISTS "Admin/editor can upload brochures" ON storage.objects;
CREATE POLICY "Admin/editor can upload brochures"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'brochures'
    AND (SELECT public.is_staff(auth.uid()))
  );

DROP POLICY IF EXISTS "Admin/editor can update brochures" ON storage.objects;
CREATE POLICY "Admin/editor can update brochures"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'brochures'
    AND (SELECT public.is_staff(auth.uid()))
  );

DROP POLICY IF EXISTS "Admin/editor can delete brochures" ON storage.objects;
CREATE POLICY "Admin/editor can delete brochures"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'brochures'
    AND (SELECT public.is_staff(auth.uid()))
  );

-- ──────────────────────────────────────────────────────────
-- 4. RLS — projects table (admin CRUD)
-- ──────────────────────────────────────────────────────────
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published projects" ON public.projects;
DROP POLICY IF EXISTS "Staff can view all projects" ON public.projects;
CREATE POLICY "Allow select projects for public and staff"
  ON public.projects FOR SELECT
  TO public
  USING (is_published = true OR (SELECT public.is_staff(auth.uid())));

DROP POLICY IF EXISTS "Staff can insert projects" ON public.projects;
CREATE POLICY "Staff can insert projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_staff(auth.uid())));

DROP POLICY IF EXISTS "Staff can update projects" ON public.projects;
CREATE POLICY "Staff can update projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_staff(auth.uid())));

DROP POLICY IF EXISTS "Admin can delete projects" ON public.projects;
CREATE POLICY "Admin can delete projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING ((SELECT public.has_role('admin'::app_role, auth.uid())));

-- ──────────────────────────────────────────────────────────
-- 5. RLS — leads table (admin read/update, public insert)
-- ──────────────────────────────────────────────────────────
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view leads" ON public.leads;
CREATE POLICY "Staff can view leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING ((SELECT public.is_staff(auth.uid())));

DROP POLICY IF EXISTS "Staff can update leads" ON public.leads;
CREATE POLICY "Staff can update leads"
  ON public.leads FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_staff(auth.uid())));

DROP POLICY IF EXISTS "Admin can delete leads" ON public.leads;
CREATE POLICY "Admin can delete leads"
  ON public.leads FOR DELETE
  TO authenticated
  USING ((SELECT public.has_role('admin'::app_role, auth.uid())));

-- ──────────────────────────────────────────────────────────
-- 6. RLS — gallery table
-- ──────────────────────────────────────────────────────────
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published gallery" ON public.gallery;
DROP POLICY IF EXISTS "Staff can manage gallery" ON public.gallery;
CREATE POLICY "Allow select gallery for public and staff"
  ON public.gallery FOR SELECT
  TO public
  USING (is_published = true OR (SELECT public.is_staff(auth.uid())));

CREATE POLICY "Staff can insert gallery"
  ON public.gallery FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_staff(auth.uid())));

CREATE POLICY "Staff can update gallery"
  ON public.gallery FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_staff(auth.uid())))
  WITH CHECK ((SELECT public.is_staff(auth.uid())));

CREATE POLICY "Staff can delete gallery"
  ON public.gallery FOR DELETE
  TO authenticated
  USING ((SELECT public.is_staff(auth.uid())));

-- ──────────────────────────────────────────────────────────
-- 7. RLS — user_roles table (admin read-only from client)
-- ──────────────────────────────────────────────────────────
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can manage roles" ON public.user_roles;
CREATE POLICY "Allow select user_roles for self and admin"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR (SELECT public.has_role('admin'::app_role, auth.uid())));

CREATE POLICY "Admin can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.has_role('admin'::app_role, auth.uid())));

CREATE POLICY "Admin can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING ((SELECT public.has_role('admin'::app_role, auth.uid())))
  WITH CHECK ((SELECT public.has_role('admin'::app_role, auth.uid())));

CREATE POLICY "Admin can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING ((SELECT public.has_role('admin'::app_role, auth.uid())));

-- ──────────────────────────────────────────────────────────
-- 8. RLS — profiles table
-- ──────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff can view all profiles" ON public.profiles;
CREATE POLICY "Allow select profiles for owners and staff"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()) OR (SELECT public.is_staff(auth.uid())));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()));

-- ──────────────────────────────────────────────────────────
-- 9. RLS — testimonials, blog_posts, buyers_guide (staff CRUD)
-- ──────────────────────────────────────────────────────────
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Staff can manage testimonials" ON public.testimonials;
CREATE POLICY "Allow select testimonials for public and staff"
  ON public.testimonials FOR SELECT
  TO public
  USING (is_published = true OR (SELECT public.is_staff(auth.uid())));

CREATE POLICY "Staff can insert testimonials"
  ON public.testimonials FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_staff(auth.uid())));

CREATE POLICY "Staff can update testimonials"
  ON public.testimonials FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_staff(auth.uid())))
  WITH CHECK ((SELECT public.is_staff(auth.uid())));

CREATE POLICY "Staff can delete testimonials"
  ON public.testimonials FOR DELETE
  TO authenticated
  USING ((SELECT public.is_staff(auth.uid())));

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Staff can manage blog_posts" ON public.blog_posts;
CREATE POLICY "Allow select blog_posts for public and staff"
  ON public.blog_posts FOR SELECT
  TO public
  USING (is_published = true OR (SELECT public.is_staff(auth.uid())));

CREATE POLICY "Staff can insert blog_posts"
  ON public.blog_posts FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_staff(auth.uid())));

CREATE POLICY "Staff can update blog_posts"
  ON public.blog_posts FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_staff(auth.uid())))
  WITH CHECK ((SELECT public.is_staff(auth.uid())));

CREATE POLICY "Staff can delete blog_posts"
  ON public.blog_posts FOR DELETE
  TO authenticated
  USING ((SELECT public.is_staff(auth.uid())));

-- ──────────────────────────────────────────────────────────
-- 10. job_openings / job_applications — staff management
-- ──────────────────────────────────────────────────────────
ALTER TABLE public.job_openings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view open jobs" ON public.job_openings;
DROP POLICY IF EXISTS "Staff can manage job_openings" ON public.job_openings;
CREATE POLICY "Allow select job_openings for public and staff"
  ON public.job_openings FOR SELECT
  TO public
  USING (is_open = true OR (SELECT public.is_staff(auth.uid())));

CREATE POLICY "Staff can insert job_openings"
  ON public.job_openings FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_staff(auth.uid())));

CREATE POLICY "Staff can update job_openings"
  ON public.job_openings FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_staff(auth.uid())))
  WITH CHECK ((SELECT public.is_staff(auth.uid())));

CREATE POLICY "Staff can delete job_openings"
  ON public.job_openings FOR DELETE
  TO authenticated
  USING ((SELECT public.is_staff(auth.uid())));

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view job_applications" ON public.job_applications;
CREATE POLICY "Staff can view job_applications"
  ON public.job_applications FOR SELECT
  TO authenticated
  USING ((SELECT public.is_staff(auth.uid())));

DROP POLICY IF EXISTS "Staff can update job_applications" ON public.job_applications;
CREATE POLICY "Staff can update job_applications"
  ON public.job_applications FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_staff(auth.uid())));
