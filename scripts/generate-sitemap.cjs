/**
 * Generates public/sitemap.xml before every production build (`npm run build` runs
 * this automatically via the "prebuild" script).
 *
 * - Pulls published projects from Supabase, with <lastmod> from `updated_at`
 *   and the cover image as an image-sitemap entry.
 * - Uses the same canonical slugs as the website (Amaravati spelling, etc.).
 * - If Supabase can't be reached, falls back to the slugs in src/data/projects.ts.
 *   It never overwrites the sitemap with an empty project list.
 *
 * Run manually: node scripts/generate-sitemap.cjs
 */
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://www.slvgroup.co.in";
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public", "sitemap.xml");

// Load .env values if present (no dependency on dotenv)
function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

const today = new Date().toISOString().slice(0, 10);

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

/** Must match canonicalProjectSlug() in src/data/projects.ts */
function canonicalSlug(slug) {
  const s = String(slug || "")
    .toLowerCase()
    .trim()
    .replace(/amarav(?:ath?|t)i/g, "amaravati");
  return s === "slv-greenhorizon-2" ? "slv-green-horizon-2" : s;
}

const xmlEscape = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

async function fetchDbProjects() {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Supabase env vars not set");
  const url = `${SUPABASE_URL}/rest/v1/projects?select=slug,name,updated_at,cover_image&is_published=eq.true&order=sort_order.asc`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    if (!Array.isArray(rows)) throw new Error("Unexpected response");
    return rows;
  } finally {
    clearTimeout(timer);
  }
}

function staticProjectSlugs() {
  const src = fs.readFileSync(path.join(ROOT, "src", "data", "projects.ts"), "utf8");
  return Array.from(src.matchAll(/\bslug:\s*"([^"]+)"/g), (m) => ({ slug: m[1] }));
}

async function generate() {
  let rows = [];
  let source = "Supabase";
  try {
    rows = await fetchDbProjects();
  } catch (err) {
    console.warn(`[sitemap] Could not load projects from Supabase (${err.message}).`);
  }
  if (rows.length === 0) {
    rows = staticProjectSlugs();
    source = "src/data/projects.ts";
  }
  if (rows.length === 0) {
    console.warn("[sitemap] No projects found — keeping the existing sitemap.xml unchanged.");
    return;
  }

  const seen = new Set();
  const projectEntries = [];
  for (const r of rows) {
    const slug = canonicalSlug(r.slug);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    const image =
      typeof r.cover_image === "string" && /^https?:\/\//i.test(r.cover_image)
        ? r.cover_image
        : null;
    projectEntries.push({
      path: `/projects/${slug}`,
      changefreq: "weekly",
      priority: "0.8",
      lastmod: r.updated_at ? String(r.updated_at).slice(0, 10) : today,
      image,
      imageTitle: r.name ? String(r.name).replace(/amarav(?:ath?|t)i/gi, "Amaravati") : null,
    });
  }

  const allEntries = [...staticEntries.map((e) => ({ ...e, lastmod: today })), ...projectEntries];

  const urls = allEntries.map((e) =>
    [
      "  <url>",
      `    <loc>${xmlEscape(BASE_URL + e.path)}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      e.image
        ? [
            "    <image:image>",
            `      <image:loc>${xmlEscape(e.image)}</image:loc>`,
            e.imageTitle ? `      <image:title>${xmlEscape(e.imageTitle)}</image:title>` : null,
            "    </image:image>",
          ]
            .filter(Boolean)
            .join("\n")
        : null,
      "  </url>",
    ]
      .filter(Boolean)
      .join("\n"),
  );

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");

  fs.writeFileSync(OUT, xml);
  console.log(
    `[sitemap] Wrote public/sitemap.xml: ${allEntries.length} URLs (${projectEntries.length} projects from ${source}).`,
  );
}

generate().catch((err) => {
  // Never fail the build because of the sitemap
  console.warn("[sitemap] Generation failed, keeping existing file:", err.message);
});
