// ─── Blog post registry ──────────────────────────────────────────────────────
// Add future articles by creating a `<slug>.jsx` (content) + `<slug>.meta.js`
// (metadata) pair, registering the meta in registry.meta.js, and mapping the
// slug to its content component below.
import AbgInterpretationForNurses from "./abg-interpretation-for-nurses.jsx";
import { postsMeta, getPostMetaBySlug } from "./registry.meta.js";

const COMPONENTS = {
  "abg-interpretation-for-nurses": AbgInterpretationForNurses,
};

export const posts = postsMeta.map((meta) => ({ ...meta, Component: COMPONENTS[meta.slug] }));

export function getPostBySlug(slug) {
  const meta = getPostMetaBySlug(slug);
  if (!meta) return null;
  return { ...meta, Component: COMPONENTS[slug] };
}

// Adjacent-post architecture — works today with a single post (both null)
// and requires no changes when future posts are added to `modules` above.
export function getAdjacentPosts(slug) {
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? posts[idx - 1] : null,
    next: idx < posts.length - 1 ? posts[idx + 1] : null,
  };
}
