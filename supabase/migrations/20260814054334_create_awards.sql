create extension if not exists pgcrypto;

-- ============================================================
-- AWARDS TABLE
-- ============================================================

create table if not exists public.awards (
  id uuid primary key default gen_random_uuid(),

  year integer,

  category text not null
    check (
      category in (
        'Leadership',
        'Developer',
        'Project',
        'Lifetime Achievement'
      )
    ),

  title text not null,
  subtitle text,

  recipient text not null,
  organization text,

  issuer text not null,
  location text,

  description text not null,

  image_url text not null,

  featured boolean not null default false,
  is_published boolean not null default true,

  sort_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists awards_sort_order_idx
  on public.awards(sort_order);

create index if not exists awards_year_idx
  on public.awards(year);

create index if not exists awards_category_idx
  on public.awards(category);

create index if not exists awards_published_idx
  on public.awards(is_published);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

create or replace function public.set_awards_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists awards_updated_at on public.awards;

create trigger awards_updated_at
before update on public.awards
for each row
execute function public.set_awards_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.awards enable row level security;

-- Public website can only see published awards
drop policy if exists "Public can view published awards"
on public.awards;

create policy "Public can view published awards"
on public.awards
for select
using (is_published = true);

-- Temporary authenticated-user admin policy
-- Replace with your actual admin-role condition later.
drop policy if exists "Authenticated users can manage awards"
on public.awards;

create policy "Authenticated users can manage awards"
on public.awards
for all
to authenticated
using (true)
with check (true);

-- ============================================================
-- STORAGE BUCKET
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public
)
values (
  'award-media',
  'award-media',
  true
)
on conflict (id) do nothing;

-- ============================================================
-- STORAGE POLICIES
-- ============================================================

drop policy if exists "Public can view award images"
on storage.objects;

create policy "Public can view award images"
on storage.objects
for select
using (
  bucket_id = 'award-media'
);

drop policy if exists "Authenticated users can upload award images"
on storage.objects;

create policy "Authenticated users can upload award images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'award-media'
);

drop policy if exists "Authenticated users can update award images"
on storage.objects;

create policy "Authenticated users can update award images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'award-media'
)
with check (
  bucket_id = 'award-media'
);

drop policy if exists "Authenticated users can delete award images"
on storage.objects;

create policy "Authenticated users can delete award images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'award-media'
);