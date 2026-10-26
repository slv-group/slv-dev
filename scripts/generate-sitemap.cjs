const fs = require("fs");

const BASE_URL = "https://www.slvgroup.co.in";

const staticEntries = [
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

async function generate() {
  let projectSlugs = [];
  try {
    const res = await fetch(
      "https://zjvnxolsmfkurrwissru.supabase.co/rest/v1/projects?select=slug&is_published=eq.true",
      {
        headers: { apikey: "sb_publishable_8uNNBlg_ej5skG5wpPsbeA_7uMCtqiH" },
      },
    );
    const dbProjects = await res.json();
    projectSlugs = (dbProjects || []).map((p) =>
      p.slug === "slv-greenhorizon-2" ? "slv-green-horizon-2" : p.slug,
    );
  } catch (err) {
    console.error("Fetch error:", err);
  }

  const uniqueSlugs = Array.from(new Set(projectSlugs));
  const projectEntries = uniqueSlugs.map((slug) => ({
    path: `/projects/${slug}`,
    changefreq: "weekly",
    priority: "0.8",
  }));

  const allEntries = [...staticEntries, ...projectEntries];

  const urls = allEntries.map((e) =>
    [
      "  <url>",
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      "  </url>",
    ]
      .filter(Boolean)
      .join("\n"),
  );

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
  ].join("\n");

  fs.writeFileSync("./public/sitemap.xml", xml);
  console.log(`Successfully wrote public/sitemap.xml with ${allEntries.length} canonical URLs.`);
}

generate();
