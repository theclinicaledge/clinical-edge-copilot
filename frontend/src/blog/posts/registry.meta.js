// ─── Pure metadata registry — no JSX ────────────────────────────────────────
// Deliberately excludes the JSX content components so this file can be
// imported directly by plain Node scripts (sitemap generation) without a
// JSX/React transform. `index.js` zips this metadata together with the
// content components for the running React app.
import { meta as abgInterpretationMeta } from "./abg-interpretation-for-nurses.meta.js";

export const postsMeta = [abgInterpretationMeta].sort(
  (a, b) => new Date(b.datePublished) - new Date(a.datePublished)
);

export function getPostMetaBySlug(slug) {
  return postsMeta.find((p) => p.slug === slug) || null;
}
