import { useEffect } from "react";
import { trackEvent } from "../analytics";
import BlogChrome from "./BlogChrome.jsx";
import BlogLayout from "./BlogLayout.jsx";
import { getPostBySlug, getAdjacentPosts } from "./posts/index.js";
import { buildArticleJsonLd } from "./jsonld.js";
import { useSeo, SITE_NAME } from "../seo/useSeo.js";

export default function BlogPostPage({ slug }) {
  const post = getPostBySlug(slug);

  useEffect(() => {
    trackEvent("blog_article_viewed", { slug: slug || "unknown" });
  }, [slug]);

  const seoArgs = post
    ? {
        title: post.seoTitle || post.title,
        description: post.description,
        path: `/blog/${post.slug}`,
        ogType: "article",
        publishedTime: post.datePublished,
        modifiedTime: post.dateModified,
        image: post.image,
        jsonLd: buildArticleJsonLd(post),
      }
    : { title: `Article not found | ${SITE_NAME}`, description: "This article could not be found.", path: "/blog" };

  useSeo(seoArgs);

  if (!post) {
    return (
      <BlogChrome>
        <h1 style={{ fontSize: "clamp(22px, 5vw, 28px)", color: "var(--ce-text-dark)", margin: "0 0 12px" }}>
          Article not found
        </h1>
        <p style={{ fontSize: 14, color: "var(--ce-text-muted)", marginBottom: 20 }}>
          We couldn't find that article. Browse the full list on the <a href="/blog" style={{ color: "var(--ce-teal-deep)" }}>blog index</a>.
        </p>
      </BlogChrome>
    );
  }

  const { prev, next } = getAdjacentPosts(post.slug);
  const Content = post.Component;

  return (
    <BlogLayout meta={post} prev={prev} next={next}>
      <Content />
    </BlogLayout>
  );
}
