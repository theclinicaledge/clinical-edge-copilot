import { SITE_URL, SITE_NAME } from "../seo/seoTags.js";

/** Builds Article(BlogPosting) + BreadcrumbList JSON-LD for a blog post. Pure — no DOM. */
export function buildArticleJsonLd(meta) {
  const url = `${SITE_URL}/blog/${meta.slug}`;

  const article = {
    "@type": "BlogPosting",
    headline: meta.title,
    description: meta.description,
    datePublished: meta.datePublished,
    dateModified: meta.dateModified,
    inLanguage: "en-US",
    articleSection: meta.articleSection || "Nursing Education",
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.svg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
  };
  if (meta.image) article.image = [meta.image.url];

  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: meta.title, item: url },
    ],
  };

  return { "@context": "https://schema.org", "@graph": [article, breadcrumb] };
}
