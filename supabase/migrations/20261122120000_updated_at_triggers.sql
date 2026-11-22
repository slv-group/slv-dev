-- Keep updated_at current on every edit (22 Nov 2026).
-- Previously only awards and csr_activities had a trigger, so editing a project
-- in the admin panel never changed projects.updated_at (all rows showed 12 Aug 2026),
-- which also made the sitemap's <lastmod> dates wrong.
do $$
declare t text;
begin
  foreach t in array array['projects','leads','work_registrations','profiles','blog_posts','buyers_guide','seo_metadata']
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.handle_updated_at()',
      t
    );
  end loop;
end $$;
