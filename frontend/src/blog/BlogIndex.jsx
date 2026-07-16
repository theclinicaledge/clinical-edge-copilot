import BlogChrome from "./BlogChrome.jsx";
import { posts } from "./posts/index.js";
import { useSeo, SITE_NAME } from "../seo/useSeo.js";

function formatDisplayDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogIndex() {
  useSeo({
    title: `Blog | ${SITE_NAME}`,
    description: "Practical, nurse-written guides on ABGs, EKGs, and bedside clinical reasoning from Clinical Edge.",
    path: "/blog",
    ogType: "website",
  });

  return (
    <BlogChrome>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{
          fontWeight: 800,
          fontSize: "clamp(28px, 6vw, 40px)",
          color: "var(--ce-text-dark)",
          margin: "0 0 10px",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
        }}>
          Clinical Edge Blog
        </h1>
        <p style={{ fontSize: "clamp(14px, 2.8vw, 15.5px)", color: "var(--ce-text-muted)", margin: 0, lineHeight: 1.55, maxWidth: 480 }}>
          Practical, nurse-written guides on ABGs, EKGs, and bedside clinical reasoning.
        </p>
      </header>

      <div className="ce-blog-grid">
        {posts.map((post) => (
          <a key={post.slug} href={`/blog/${post.slug}`} className="ce-blog-card ce-card-lift">
            <div className="ce-blog-card-eyebrow">Clinical Guide</div>
            <div className="ce-blog-card-title">{post.title}</div>
            <p className="ce-blog-card-desc">{post.description}</p>
            <div className="ce-blog-card-meta">
              <span>{formatDisplayDate(post.datePublished)}</span>
              <span aria-hidden="true">·</span>
              <span>{post.readingTimeMinutes} min read</span>
            </div>
          </a>
        ))}
      </div>
    </BlogChrome>
  );
}
