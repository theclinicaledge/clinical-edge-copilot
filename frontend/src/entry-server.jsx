// ─── Build-time prerender entry ─────────────────────────────────────────────
// Loaded via Vite's `ssrLoadModule` by scripts/prerender.mjs — never shipped
// to the browser. Renders a handful of public marketing/blog routes to real
// HTML strings, using the exact same components and SEO data the client app
// uses, so there is one source of truth for both.
import { renderToString } from "react-dom/server";
import ClinicalEdgeHome from "./ClinicalEdgeHome.jsx";
import Download from "./Download.jsx";
import Privacy from "./Privacy.jsx";
import Support from "./Support.jsx";
import BlogIndex from "./blog/BlogIndex.jsx";
import BlogLayout from "./blog/BlogLayout.jsx";
import { getPostBySlug, getAdjacentPosts } from "./blog/posts/index.js";
import { buildArticleJsonLd } from "./blog/jsonld.js";
import { STATIC_ROUTE_SEO } from "./seo/routeSeo.js";
import { SITE_NAME } from "./seo/seoTags.js";

const BLOG_INDEX_SEO = {
  title: `Blog | ${SITE_NAME}`,
  description: "Practical, nurse-written guides on ABGs, EKGs, and bedside clinical reasoning from Clinical Edge.",
  path: "/blog",
  ogType: "website",
};

/**
 * @param {string} routePath
 * @returns {{ html: string, seo: object } | null}
 */
export function renderRoute(routePath) {
  if (routePath === "/") {
    return { html: renderToString(<ClinicalEdgeHome onNavigate={() => {}} />), seo: STATIC_ROUTE_SEO["/"] };
  }
  if (routePath === "/download") {
    return { html: renderToString(<Download />), seo: STATIC_ROUTE_SEO["/download"] };
  }
  if (routePath === "/privacy") {
    return { html: renderToString(<Privacy />), seo: STATIC_ROUTE_SEO["/privacy"] };
  }
  if (routePath === "/support") {
    return { html: renderToString(<Support />), seo: STATIC_ROUTE_SEO["/support"] };
  }
  if (routePath === "/blog") {
    return { html: renderToString(<BlogIndex />), seo: BLOG_INDEX_SEO };
  }
  if (routePath.startsWith("/blog/")) {
    const slug = routePath.replace(/^\/blog\//, "").replace(/\/$/, "");
    const post = getPostBySlug(slug);
    if (!post) return null;
    const { prev, next } = getAdjacentPosts(slug);
    const Content = post.Component;
    const html = renderToString(
      <BlogLayout meta={post} prev={prev} next={next}>
        <Content />
      </BlogLayout>
    );
    const seo = {
      title: post.seoTitle || post.title,
      description: post.description,
      path: `/blog/${post.slug}`,
      ogType: "article",
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      image: post.image,
      jsonLd: buildArticleJsonLd(post),
    };
    return { html, seo };
  }
  return null;
}
