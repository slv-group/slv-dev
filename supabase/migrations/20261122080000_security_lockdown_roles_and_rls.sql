-- ============================================================
-- Security lockdown (22 Nov 2026)
--  1. New accounts are no longer made admin automatically.
--  2. Users can no longer give themselves a role; only admins assign roles.
--  3. Awards, CSR activities and their storage buckets: write access for
--     admin/editor (staff) only, instead of any signed-in account.
--  4. Performance: auth.uid() wrapped in (select ...) so it is evaluated once
--     per query instead of once per row (Supabase advisor 0003).
--  5. Fixed search_path on two trigger functions (Supabase advisor 0011).
--
-- Existing admin accounts are unaffected. To make someone admin/editor:
--   insert into public.user_roles (user_id, role) values ('<auth user id>', 'editor');
-- ============================================================

-- 1. Profile on signup only; no automatic role
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    updated_at = now();
  -- Roles are assigned by an existing admin (see header). No automatic admin.
  return new;
end;
$function$;

-- 2. user_roles: only admins create/change/delete roles
drop policy if exists "Allow insert user_roles for self and admin" on public.user_roles;
create policy "Admin can insert roles" on public.user_roles
  for insert to authenticated
  with check (public.has_role((select auth.uid()), 'admin'::public.app_role));

drop policy if exists "Admin can update roles" on public.user_roles;
create policy "Admin can update roles" on public.user_roles
  for update to authenticated
  using (public.has_role((select auth.uid()), 'admin'::public.app_role))
  with check (public.has_role((select auth.uid()), 'admin'::public.app_role));

drop policy if exists "Admin can delete roles" on public.user_roles;
create policy "Admin can delete roles" on public.user_roles
  for delete to authenticated
  using (public.has_role((select auth.uid()), 'admin'::public.app_role));

-- 3a. awards: staff-only writes (public read of published awards unchanged)
drop policy if exists "Authenticated users can manage awards" on public.awards;
create policy "Staff can view all awards" on public.awards
  for select to authenticated using (public.is_staff((select auth.uid())));
create policy "Staff can insert awards" on public.awards
  for insert to authenticated with check (public.is_staff((select auth.uid())));
create policy "Staff can update awards" on public.awards
  for update to authenticated
  using (public.is_staff((select auth.uid()))) with check (public.is_staff((select auth.uid())));
create policy "Staff can delete awards" on public.awards
  for delete to authenticated using (public.is_staff((select auth.uid())));

-- 3b. csr_activities: staff-only writes (public read of published rows unchanged)
drop policy if exists "Allow admin full access" on public.csr_activities;
create policy "Staff can view all csr_activities" on public.csr_activities
  for select to authenticated using (public.is_staff((select auth.uid())));
create policy "Staff can insert csr_activities" on public.csr_activities
  for insert to authenticated with check (public.is_staff((select auth.uid())));
create policy "Staff can update csr_activities" on public.csr_activities
  for update to authenticated
  using (public.is_staff((select auth.uid()))) with check (public.is_staff((select auth.uid())));
create policy "Staff can delete csr_activities" on public.csr_activities
  for delete to authenticated using (public.is_staff((select auth.uid())));

-- 3c. Storage: CSR-media and award-media writes for staff only (public viewing unchanged)
drop policy if exists "Authenticated users can upload CSR-media images" on storage.objects;
drop policy if exists "Authenticated users can update CSR-media images" on storage.objects;
drop policy if exists "Authenticated users can delete CSR-media images" on storage.objects;
drop policy if exists "Authenticated users can upload award images" on storage.objects;
drop policy if exists "Authenticated users can update award images" on storage.objects;
drop policy if exists "Authenticated users can delete award images" on storage.objects;

create policy "Staff can upload CSR-media images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'CSR-media' and public.is_staff((select auth.uid())));
create policy "Staff can update CSR-media images" on storage.objects
  for update to authenticated
  using (bucket_id = 'CSR-media' and public.is_staff((select auth.uid())))
  with check (bucket_id = 'CSR-media' and public.is_staff((select auth.uid())));
create policy "Staff can delete CSR-media images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'CSR-media' and public.is_staff((select auth.uid())));

create policy "Staff can upload award images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'award-media' and public.is_staff((select auth.uid())));
create policy "Staff can update award images" on storage.objects
  for update to authenticated
  using (bucket_id = 'award-media' and public.is_staff((select auth.uid())))
  with check (bucket_id = 'award-media' and public.is_staff((select auth.uid())));
create policy "Staff can delete award images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'award-media' and public.is_staff((select auth.uid())));

-- 4. Evaluate auth.uid() once per query on remaining per-row policies
drop policy if exists "Admin can delete projects" on public.projects;
create policy "Admin can delete projects" on public.projects
  for delete to authenticated
  using (public.has_role((select auth.uid()), 'admin'::public.app_role));

drop policy if exists "Admin can delete leads" on public.leads;
create policy "Admin can delete leads" on public.leads
  for delete to authenticated
  using (public.has_role((select auth.uid()), 'admin'::public.app_role));

drop policy if exists "Staff can update work registrations" on public.work_registrations;
create policy "Staff can update work registrations" on public.work_registrations
  for update to authenticated
  using (public.is_staff((select auth.uid())))
  with check (public.is_staff((select auth.uid())));

drop policy if exists "Staff can view work registrations" on public.work_registrations;
create policy "Staff can view work registrations" on public.work_registrations
  for select to authenticated
  using (public.is_staff((select auth.uid())));

-- 5. Fixed search_path on trigger functions
alter function public.handle_updated_at() set search_path = public;
alter function public.set_awards_updated_at() set search_path = public;
