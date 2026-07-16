// ─── Generated sitemap ───────────────────────────────────────────────────────
// Single source of truth for public, indexable URLs. Static marketing/tool
// routes are listed here directly (lastmod reflects real content changes, not
// build time); blog URLs are pulled from the post metadata registry so a new
// article is picked up automatically. Runs before `vite build` so the output
// lands in public/ and gets copied into dist/ by Vite like any other asset.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { postsMeta } from "../src/blog/posts/registry.meta.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_URL = "https://theclinicaledge.org";

// Static, public, indexable routes. Excludes /landing, /scenario, /quickstart
// (onboarding-funnel variants of Home/Copilot, not meant for organic search).
const STATIC_ROUTES = [
  { loc: "/", lastmod: "2026-07-15", changefreq: "monthly", priority: "1.0" },
  { loc: "/copilot", lastmod: "2026-07-15", changefreq: "monthly", priority: "0.8" },
  { loc: "/rhythm-lab", lastmod: "2026-07-15", changefreq: "monthly", priority: "0.8" },
  { loc: "/icu-drips", lastmod: "2026-07-15", changefreq: "monthly", priority: "0.8" },
  { loc: "/reference-hub", lastmod: "2026-07-15", changefreq: "monthly", priority: "0.8" },
  { loc: "/abg-lab", lastmod: "2026-07-15", changefreq: "monthly", priority: "0.8" },
  { loc: "/download", lastmod: "2026-07-15", changefreq: "monthly", priority: "0.6" },
  { loc: "/privacy", lastmod: "2026-07-15", changefreq: "yearly", priority: "0.3" },
  { loc: "/support", lastmod: "2026-07-15", changefreq: "yearly", priority: "0.3" },
  { loc: "/blog", lastmod: "2026-07-15", changefreq: "weekly", priority: "0.7" },
];

const blogRoutes = postsMeta.map((post) => ({
  loc: `/blog/${post.slug}`,
  lastmod: post.dateModified || post.datePublished,
  changefreq: "monthly",
  priority: "0.6",
}));

const allRoutes = [...STATIC_ROUTES, ...blogRoutes];

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  allRoutes
    .map(
      (r) =>
        `  <url>\n` +
        `    <loc>${SITE_URL}${r.loc}</loc>\n` +
        `    <lastmod>${r.lastmod}</lastmod>\n` +
        `    <changefreq>${r.changefreq}</changefreq>\n` +
        `    <priority>${r.priority}</priority>\n` +
        `  </url>`
    )
    .join("\n") +
  `\n</urlset>\n`;

const outPath = path.resolve(__dirname, "../public/sitemap.xml");
fs.writeFileSync(outPath, xml);
console.log(`✓ Sitemap written to public/sitemap.xml (${allRoutes.length} URLs).`);
