-- ============================================================
-- Fix: Resolve auth_rls_initplan & multiple_permissive_policies
-- Performance warnings on live database
-- ============================================================

-- ── projects ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Public can view published projects" ON public.projects;
DROP POLICY IF EXISTS "Staff can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Allow select projects for public and staff" ON public.projects;
CREATE POLICY "Allow select projects for public and staff"
  ON public.projects FOR SELECT TO public
  USING (is_published = true OR public.is_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "Staff can insert projects" ON public.projects;
CREATE POLICY "Staff can insert projects"
  ON public.projects FOR INSERT TO authenticated
  WITH CHECK (public.is_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "Staff can update projects" ON public.projects;
CREATE POLICY "Staff can update projects"
  ON public.projects FOR UPDATE TO authenticated
  USING (public.is_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "Admin can delete projects" ON public.projects;
CREATE POLICY "Admin can delete projects"
  ON public.projects FOR DELETE TO authenticated
  USING (public.has_role('admin'::app_role, (SELECT auth.uid())));

-- ── leads ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can view leads" ON public.leads;
CREATE POLICY "Staff can view leads"
  ON public.leads FOR SELECT TO authenticated
  USING (public.is_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "Staff can update leads" ON public.leads;
CREATE POLICY "Staff can update leads"
  ON public.leads FOR UPDATE TO authenticated
  USING (public.is_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "Admin can delete leads" ON public.leads;
CREATE POLICY "Admin can delete leads"
  ON public.leads FOR DELETE TO authenticated
  USING (public.has_role('admin'::app_role, (SELECT auth.uid())));

-- ── gallery ───────────────────────────────────────────────
DROP POLICY IF EXISTS "Public can view published gallery" ON public.gallery;
DROP POLICY IF EXISTS "Staff can manage gallery" ON public.gallery;
DROP POLICY IF EXISTS "Allow select gallery for public and staff" ON public.gallery;
DROP POLICY IF EXISTS "Staff can insert gallery" ON public.gallery;
DROP POLICY IF EXISTS "Staff can update gallery" ON public.gallery;
DROP POLICY IF EXISTS "Staff can delete gallery" ON public.gallery;
CREATE POLICY "Allow select gallery for public and staff"
  ON public.gallery FOR SELECT TO public
  USING (is_published = true OR public.is_staff((SELECT auth.uid())));
CREATE POLICY "Staff can insert gallery"
  ON public.gallery FOR INSERT TO authenticated
  WITH CHECK (public.is_staff((SELECT auth.uid())));
CREATE POLICY "Staff can update gallery"
  ON public.gallery FOR UPDATE TO authenticated
  USING (public.is_staff((SELECT auth.uid())))
  WITH CHECK (public.is_staff((SELECT auth.uid())));
CREATE POLICY "Staff can delete gallery"
  ON public.gallery FOR DELETE TO authenticated
  USING (public.is_staff((SELECT auth.uid())));

-- ── user_roles ────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow select user_roles for self and admin" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow insert user_roles for self and admin" ON public.user_roles;
CREATE POLICY "Allow select user_roles for self and admin"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.has_role('admin'::app_role, (SELECT auth.uid())));
CREATE POLICY "Allow insert user_roles for self and admin"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()) OR public.has_role('admin'::app_role, (SELECT auth.uid())));
CREATE POLICY "Admin can update roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role('admin'::app_role, (SELECT auth.uid())))
  WITH CHECK (public.has_role('admin'::app_role, (SELECT auth.uid())));
CREATE POLICY "Admin can delete roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role('admin'::app_role, (SELECT auth.uid())));

-- ── profiles ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow select profiles for owners and staff" ON public.profiles;
CREATE POLICY "Allow select profiles for owners and staff"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()) OR public.is_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

-- ── testimonials ──────────────────────────────────────────
DROP POLICY IF EXISTS "Public can view published testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Staff can manage testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow select testimonials for public and staff" ON public.testimonials;
DROP POLICY IF EXISTS "Staff can insert testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Staff can update testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Staff can delete testimonials" ON public.testimonials;
CREATE POLICY "Allow select testimonials for public and staff"
  ON public.testimonials FOR SELECT TO public
  USING (is_published = true OR public.is_staff((SELECT auth.uid())));
CREATE POLICY "Staff can insert testimonials"
  ON public.testimonials FOR INSERT TO authenticated
  WITH CHECK (public.is_staff((SELECT auth.uid())));
CREATE POLICY "Staff can update testimonials"
  ON public.testimonials FOR UPDATE TO authenticated
  USING (public.is_staff((SELECT auth.uid())))
  WITH CHECK (public.is_staff((SELECT auth.uid())));
CREATE POLICY "Staff can delete testimonials"
  ON public.testimonials FOR DELETE TO authenticated
  USING (public.is_staff((SELECT auth.uid())));

-- ── blog_posts ────────────────────────────────────────────
DROP POLICY IF EXISTS "Public can view published blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Staff can manage blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow select blog_posts for public and staff" ON public.blog_posts;
DROP POLICY IF EXISTS "Staff can insert blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Staff can update blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Staff can delete blog_posts" ON public.blog_posts;
CREATE POLICY "Allow select blog_posts for public and staff"
  ON public.blog_posts FOR SELECT TO public
  USING (is_published = true OR public.is_staff((SELECT auth.uid())));
CREATE POLICY "Staff can insert blog_posts"
  ON public.blog_posts FOR INSERT TO authenticated
  WITH CHECK (public.is_staff((SELECT auth.uid())));
CREATE POLICY "Staff can update blog_posts"
  ON public.blog_posts FOR UPDATE TO authenticated
  USING (public.is_staff((SELECT auth.uid())))
  WITH CHECK (public.is_staff((SELECT auth.uid())));
CREATE POLICY "Staff can delete blog_posts"
  ON public.blog_posts FOR DELETE TO authenticated
  USING (public.is_staff((SELECT auth.uid())));

-- ── job_openings ──────────────────────────────────────────
DROP POLICY IF EXISTS "Public can view open jobs" ON public.job_openings;
DROP POLICY IF EXISTS "Staff can manage job_openings" ON public.job_openings;
DROP POLICY IF EXISTS "Allow select job_openings for public and staff" ON public.job_openings;
DROP POLICY IF EXISTS "Staff can insert job_openings" ON public.job_openings;
DROP POLICY IF EXISTS "Staff can update job_openings" ON public.job_openings;
DROP POLICY IF EXISTS "Staff can delete job_openings" ON public.job_openings;
CREATE POLICY "Allow select job_openings for public and staff"
  ON public.job_openings FOR SELECT TO public
  USING (is_open = true OR public.is_staff((SELECT auth.uid())));
CREATE POLICY "Staff can insert job_openings"
  ON public.job_openings FOR INSERT TO authenticated
  WITH CHECK (public.is_staff((SELECT auth.uid())));
CREATE POLICY "Staff can update job_openings"
  ON public.job_openings FOR UPDATE TO authenticated
  USING (public.is_staff((SELECT auth.uid())))
  WITH CHECK (public.is_staff((SELECT auth.uid())));
CREATE POLICY "Staff can delete job_openings"
  ON public.job_openings FOR DELETE TO authenticated
  USING (public.is_staff((SELECT auth.uid())));

-- ── job_applications ──────────────────────────────────────
DROP POLICY IF EXISTS "Staff can view job_applications" ON public.job_applications;
CREATE POLICY "Staff can view job_applications"
  ON public.job_applications FOR SELECT TO authenticated
  USING (public.is_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "Staff can update job_applications" ON public.job_applications;
CREATE POLICY "Staff can update job_applications"
  ON public.job_applications FOR UPDATE TO authenticated
  USING (public.is_staff((SELECT auth.uid())));

-- ── buyers_guide ──────────────────────────────────────────
DROP POLICY IF EXISTS "Public can view published buyers_guide" ON public.buyers_guide;
DROP POLICY IF EXISTS "Staff can manage buyers_guide" ON public.buyers_guide;
DROP POLICY IF EXISTS "Allow select buyers_guide for public and staff" ON public.buyers_guide;
DROP POLICY IF EXISTS "Staff can insert buyers_guide" ON public.buyers_guide;
DROP POLICY IF EXISTS "Staff can update buyers_guide" ON public.buyers_guide;
DROP POLICY IF EXISTS "Staff can delete buyers_guide" ON public.buyers_guide;
CREATE POLICY "Allow select buyers_guide for public and staff"
  ON public.buyers_guide FOR SELECT TO public
  USING (is_published = true OR public.is_staff((SELECT auth.uid())));
CREATE POLICY "Staff can insert buyers_guide"
  ON public.buyers_guide FOR INSERT TO authenticated
  WITH CHECK (public.is_staff((SELECT auth.uid())));
CREATE POLICY "Staff can update buyers_guide"
  ON public.buyers_guide FOR UPDATE TO authenticated
  USING (public.is_staff((SELECT auth.uid())))
  WITH CHECK (public.is_staff((SELECT auth.uid())));
CREATE POLICY "Staff can delete buyers_guide"
  ON public.buyers_guide FOR DELETE TO authenticated
  USING (public.is_staff((SELECT auth.uid())));

-- ── seo_metadata ──────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can manage seo_metadata" ON public.seo_metadata;
DROP POLICY IF EXISTS "Staff can insert seo_metadata" ON public.seo_metadata;
DROP POLICY IF EXISTS "Staff can update seo_metadata" ON public.seo_metadata;
DROP POLICY IF EXISTS "Staff can delete seo_metadata" ON public.seo_metadata;
CREATE POLICY "Staff can insert seo_metadata"
  ON public.seo_metadata FOR INSERT TO authenticated
  WITH CHECK (public.is_staff((SELECT auth.uid())));
CREATE POLICY "Staff can update seo_metadata"
  ON public.seo_metadata FOR UPDATE TO authenticated
  USING (public.is_staff((SELECT auth.uid())))
  WITH CHECK (public.is_staff((SELECT auth.uid())));
CREATE POLICY "Staff can delete seo_metadata"
  ON public.seo_metadata FOR DELETE TO authenticated
  USING (public.is_staff((SELECT auth.uid())));

-- ── storage policies ──────────────────────────────────────
DROP POLICY IF EXISTS "Admin/editor can upload project-media" ON storage.objects;
CREATE POLICY "Admin/editor can upload project-media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'project-media' AND public.is_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "Admin/editor can update project-media" ON storage.objects;
CREATE POLICY "Admin/editor can update project-media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'project-media' AND public.is_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "Admin/editor can delete project-media" ON storage.objects;
CREATE POLICY "Admin/editor can delete project-media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'project-media' AND public.is_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "Admin/editor can upload brochures" ON storage.objects;
CREATE POLICY "Admin/editor can upload brochures"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'brochures' AND public.is_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "Admin/editor can update brochures" ON storage.objects;
CREATE POLICY "Admin/editor can update brochures"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'brochures' AND public.is_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "Admin/editor can delete brochures" ON storage.objects;
CREATE POLICY "Admin/editor can delete brochures"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'brochures' AND public.is_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "Staff can list project-media" ON storage.objects;
CREATE POLICY "Staff can list project-media"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'project-media' AND public.is_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "Staff can list brochures" ON storage.objects;
CREATE POLICY "Staff can list brochures"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'brochures' AND public.is_staff((SELECT auth.uid())));
