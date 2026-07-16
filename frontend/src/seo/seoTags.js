// ─── Shared SEO tag data ─────────────────────────────────────────────────────
// Pure, DOM-free. Consumed by both the client useSeo hook (src/seo/useSeo.js)
// and the build-time prerender script (scripts/prerender.mjs) so the two
// never drift — one source of truth for what tags a route gets.
export const SITE_URL = "https://theclinicaledge.org";
export const SITE_NAME = "Clinical Edge";

/**
 * Builds an ordered list of tag descriptors for a route.
 * @param {object} args
 * @param {string} args.title
 * @param {string} args.description
 * @param {string} args.path - e.g. "/blog/abg-interpretation-for-nurses"
 * @param {"website"|"article"} [args.ogType]
 * @param {string} [args.publishedTime] - ISO date, article only
 * @param {string} [args.modifiedTime] - ISO date, article only
 * @param {string} [args.robots] - defaults to "index, follow"
 * @param {{url:string,width:number,height:number,alt:string}} [args.image]
 * @param {object} [args.jsonLd] - a JSON-serializable structured data object
 */
export function buildSeoTagList({
  title,
  description,
  path,
  ogType = "website",
  publishedTime,
  modifiedTime,
  robots = "index, follow",
  image,
  jsonLd,
}) {
  const url = `${SITE_URL}${path}`;
  const tags = [];

  tags.push({ kind: "title", content: title });
  tags.push({ kind: "meta", attr: "name", key: "description", content: description });
  tags.push({ kind: "meta", attr: "name", key: "robots", content: robots });
  tags.push({ kind: "link", rel: "canonical", href: url });

  tags.push({ kind: "meta", attr: "property", key: "og:title", content: title });
  tags.push({ kind: "meta", attr: "property", key: "og:description", content: description });
  tags.push({ kind: "meta", attr: "property", key: "og:type", content: ogType });
  tags.push({ kind: "meta", attr: "property", key: "og:url", content: url });
  tags.push({ kind: "meta", attr: "property", key: "og:site_name", content: SITE_NAME });

  if (image) {
    tags.push({ kind: "meta", attr: "property", key: "og:image", content: image.url });
    tags.push({ kind: "meta", attr: "property", key: "og:image:width", content: String(image.width) });
    tags.push({ kind: "meta", attr: "property", key: "og:image:height", content: String(image.height) });
    tags.push({ kind: "meta", attr: "property", key: "og:image:alt", content: image.alt });
    tags.push({ kind: "meta", attr: "name", key: "twitter:card", content: "summary_large_image" });
    tags.push({ kind: "meta", attr: "name", key: "twitter:image", content: image.url });
  } else {
    tags.push({ kind: "meta", attr: "name", key: "twitter:card", content: "summary" });
  }
  tags.push({ kind: "meta", attr: "name", key: "twitter:title", content: title });
  tags.push({ kind: "meta", attr: "name", key: "twitter:description", content: description });

  if (ogType === "article") {
    if (publishedTime) tags.push({ kind: "meta", attr: "property", key: "article:published_time", content: publishedTime });
    if (modifiedTime) tags.push({ kind: "meta", attr: "property", key: "article:modified_time", content: modifiedTime });
    tags.push({ kind: "meta", attr: "property", key: "article:publisher", content: SITE_NAME });
  }

  if (jsonLd) tags.push({ kind: "jsonld", content: jsonLd, id: "ce-jsonld" });

  return tags;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Serializes a tag list (from buildSeoTagList) into an HTML string for injection into a static document. */
export function serializeTagsToHtml(tags) {
  return tags
    .map((tag) => {
      if (tag.kind === "title") return `<title>${escapeHtml(tag.content)}</title>`;
      if (tag.kind === "meta") return `<meta ${tag.attr}="${escapeHtml(tag.key)}" content="${escapeHtml(tag.content)}">`;
      if (tag.kind === "link") return `<link rel="${escapeHtml(tag.rel)}" href="${escapeHtml(tag.href)}">`;
      if (tag.kind === "jsonld") {
        return `<script type="application/ld+json" id="${tag.id}">${JSON.stringify(tag.content)}</script>`;
      }
      return "";
    })
    .join("\n    ");
}
