-- ============================================================
-- SLV Dev — Base Schema
-- Creates all enums, tables, functions, triggers needed
-- before the RLS/security migrations run
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- 1. Extensions
-- ──────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────────────────
-- 2. Enums
-- ──────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'viewer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.lead_source AS ENUM (
    'hero', 'project_enquiry', 'brochure', 'contact', 'careers', 'site_visit'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.lead_status AS ENUM (
    'new', 'contacted', 'qualified', 'won', 'lost'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.project_status AS ENUM (
    'Ongoing', 'Completed', 'Upcoming'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ──────────────────────────────────────────────────────────
-- 3. Tables
-- ──────────────────────────────────────────────────────────

-- profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text,
  avatar_url  text,
  email       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- projects
CREATE TABLE IF NOT EXISTS public.projects (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  slug           text NOT NULL UNIQUE,
  tagline        text,
  description    text,
  status         public.project_status NOT NULL DEFAULT 'Ongoing',
  location       text,
  city           text,
  price_from     numeric,
  sqft_from      numeric,
  bedrooms       text,
  rera_number    text,
  category       text,
  cover_image    text,
  brochure_url   text,
  map_embed      text,
  amenities      jsonb NOT NULL DEFAULT '[]'::jsonb,
  gallery        jsonb NOT NULL DEFAULT '[]'::jsonb,
  floor_plans    jsonb NOT NULL DEFAULT '[]'::jsonb,
  specifications jsonb NOT NULL DEFAULT '{}'::jsonb,
  nearby         jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_published   boolean NOT NULL DEFAULT false,
  is_featured    boolean NOT NULL DEFAULT false,
  sort_order     integer NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- leads
CREATE TABLE IF NOT EXISTS public.leads (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  email      text,
  phone      text,
  message    text,
  notes      text,
  source     public.lead_source NOT NULL DEFAULT 'contact',
  status     public.lead_status NOT NULL DEFAULT 'new',
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- gallery
CREATE TABLE IF NOT EXISTS public.gallery (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text,
  image_url   text NOT NULL,
  category    text,
  project_id  uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  is_published boolean NOT NULL DEFAULT false,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  role         text,
  quote        text NOT NULL,
  rating       integer NOT NULL DEFAULT 5,
  avatar_url   text,
  is_published boolean NOT NULL DEFAULT false,
  sort_order   integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- blog_posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  slug         text NOT NULL UNIQUE,
  excerpt      text,
  body         text,
  cover_image  text,
  author       text,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- buyers_guide
CREATE TABLE IF NOT EXISTS public.buyers_guide (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  slug         text NOT NULL UNIQUE,
  body         text,
  category     text,
  is_published boolean NOT NULL DEFAULT false,
  sort_order   integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- seo_metadata
CREATE TABLE IF NOT EXISTS public.seo_metadata (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path        text NOT NULL UNIQUE,
  title       text,
  description text,
  keywords    text,
  og_image    text,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- job_openings
CREATE TABLE IF NOT EXISTS public.job_openings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  department      text,
  location        text,
  employment_type text,
  experience      text,
  description     text,
  is_open         boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- job_applications
CREATE TABLE IF NOT EXISTS public.job_applications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id     uuid REFERENCES public.job_openings(id) ON DELETE SET NULL,
  full_name  text NOT NULL,
  email      text NOT NULL,
  phone      text,
  resume_url text,
  cover_note text,
  status     text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────
-- 4. Helper functions (SECURITY DEFINER)
-- ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.has_role(_role public.app_role, _user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin'::public.app_role, 'editor'::public.app_role)
  );
$$;

-- ──────────────────────────────────────────────────────────
-- 5. handle_new_user trigger
-- ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
