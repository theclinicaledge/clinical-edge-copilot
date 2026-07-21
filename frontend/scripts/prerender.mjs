// ─── Build-time static prerender ─────────────────────────────────────────────
// Runs after `vite build`. Renders a fixed list of public marketing/blog
// routes to real HTML (via src/entry-server.jsx + react-dom/server) and
// writes each as dist/<route>/index.html, so Vercel serves complete,
// crawlable HTML for those exact paths before the SPA rewrite ever applies.
// Every other route is untouched and stays pure client-rendered.
import { createServer } from "vite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSeoTagList, serializeTagsToHtml } from "../src/seo/seoTags.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");

const ROUTES = [
  "/",
  "/blog",
  "/blog/abg-interpretation-for-nurses",
  "/blog/ecg-basics-for-nurses",
  "/download",
  "/privacy",
  "/support",
];

function replaceMarkerBlock(html, markerName, innerHtml) {
  const re = new RegExp(`<!-- ${markerName}:START -->[\\s\\S]*?<!-- ${markerName}:END -->`);
  if (!re.test(html)) {
    throw new Error(`Marker block "${markerName}" not found in dist/index.html template.`);
  }
  const block = `<!-- ${markerName}:START -->\n    ${innerHtml}\n    <!-- ${markerName}:END -->`;
  return html.replace(re, block);
}

async function main() {
  const templatePath = path.join(distDir, "index.html");
  if (!fs.existsSync(templatePath)) {
    console.error("dist/index.html not found — run `vite build` before prerendering.");
    process.exit(1);
  }

  const vite = await createServer({
    root,
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "warn",
  });

  let renderRoute;
  try {
    ({ renderRoute } = await vite.ssrLoadModule("/src/entry-server.jsx"));
  } catch (err) {
    await vite.close();
    throw err;
  }

  const template = fs.readFileSync(templatePath, "utf-8");
  let rendered = 0;

  for (const routePath of ROUTES) {
    const result = renderRoute(routePath);
    if (!result) {
      console.warn(`⚠ No render mapping for ${routePath} — skipped.`);
      continue;
    }
    const { html, seo } = result;
    const tags = buildSeoTagList(seo);
    const primaryTags = tags.filter(
      (t) => t.kind === "title" || t.kind === "link" || (t.kind === "meta" && (t.key === "description" || t.key === "robots"))
    );
    const ogTags = tags.filter((t) => !primaryTags.includes(t));

    let out = template;
    out = replaceMarkerBlock(out, "SEO", serializeTagsToHtml(primaryTags));
    out = replaceMarkerBlock(out, "SEO-OG", serializeTagsToHtml(ogTags));
    // data-ssr-route lets the client (main.jsx) verify the served markup
    // actually belongs to the current pathname before hydrating — routes that
    // hit the SPA rewrite fallback (e.g. /copilot serving dist/index.html)
    // otherwise get handed Home's markup by Vercel and must NOT hydrate it.
    out = out.replace('<div id="root"></div>', `<div id="root" data-ssr-route="${routePath}">${html}</div>`);

    const outPath =
      routePath === "/" ? path.join(distDir, "index.html") : path.join(distDir, routePath.replace(/^\//, ""), "index.html");
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, out);
    console.log(`✓ Prerendered ${routePath.padEnd(38)} -> ${path.relative(distDir, outPath)}`);
    rendered++;
  }

  await vite.close();
  console.log(`\nPrerender complete — ${rendered}/${ROUTES.length} routes.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
