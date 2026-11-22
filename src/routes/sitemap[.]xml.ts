import { createFileRoute } from "@tanstack/react-router";
import { projects as staticProjects, canonicalProjectSlug } from "@/data/projects";
import { supabase } from "@/integrations/supabase/client";

const BASE_URL = "https://www.slvgroup.co.in";

interface SitemapEntry {
  path: string;
  changefreq?: "daily" | "weekly" | "monthly" | "yearly";
  priority?: string;
  lastmod?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        // Static public pages
        const staticEntries: SitemapEntry[] = [
          { path: "/", changefreq: "daily", priority: "1.0" },
          { path: "/about", changefreq: "monthly", priority: "0.8" },
          { path: "/management", changefreq: "monthly", priority: "0.8" },
          { path: "/projects", changefreq: "weekly", priority: "0.9" },
          { path: "/gallery", changefreq: "weekly", priority: "0.8" },
          { path: "/awards", changefreq: "monthly", priority: "0.7" },
          { path: "/csr", changefreq: "monthly", priority: "0.7" },
          { path: "/workshop", changefreq: "monthly", priority: "0.7" },
          { path: "/land-proposals", changefreq: "monthly", priority: "0.7" },
          { path: "/site-visit", changefreq: "weekly", priority: "0.8" },
          { path: "/contact", changefreq: "monthly", priority: "0.8" },
          { path: "/careers", changefreq: "weekly", priority: "0.7" },
          { path: "/buyers-guide", changefreq: "monthly", priority: "0.7" },
          { path: "/emi-calculator", changefreq: "monthly", priority: "0.6" },
          { path: "/faq", changefreq: "monthly", priority: "0.7" },
          { path: "/nri-corner", changefreq: "monthly", priority: "0.8" },
          { path: "/architect-consultant-registration", changefreq: "monthly", priority: "0.6" },
          { path: "/contractor-registration", changefreq: "monthly", priority: "0.6" },
          { path: "/vendors-suppliers-registration", changefreq: "monthly", priority: "0.6" },
          { path: "/privacy", changefreq: "yearly", priority: "0.5" },
          { path: "/terms", changefreq: "yearly", priority: "0.5" },
          { path: "/disclaimer", changefreq: "yearly", priority: "0.5" },
        ];

        // Fetch published projects dynamically from Supabase
        const lastmodBySlug = new Map<string, string | undefined>();
        try {
          const { data: dbProjects } = await supabase
            .from("projects")
            .select("slug, updated_at")
            .eq("is_published", true);

          for (const p of dbProjects ?? []) {
            const slug = canonicalProjectSlug(p.slug);
            if (slug && !lastmodBySlug.has(slug)) {
              lastmodBySlug.set(slug, p.updated_at ? String(p.updated_at).slice(0, 10) : undefined);
            }
          }
        } catch {
          // Fall back to static projects array
        }

        if (lastmodBySlug.size === 0) {
          for (const p of staticProjects)
            lastmodBySlug.set(canonicalProjectSlug(p.slug), undefined);
        }

        const projectEntries: SitemapEntry[] = Array.from(lastmodBySlug, ([slug, lastmod]) => ({
          path: `/projects/${slug}`,
          changefreq: "weekly",
          priority: "0.8",
          lastmod,
        }));

        const allEntries = [...staticEntries, ...projectEntries];

        const urls = allEntries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
