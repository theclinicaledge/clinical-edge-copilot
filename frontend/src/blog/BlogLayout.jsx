import BlogChrome from "./BlogChrome.jsx";
import CTASection from "./CTASection.jsx";

const RELATED_RESOURCES = [
  { label: "ABG Lab", href: "/abg-lab", desc: "Practice ABG interpretation interactively with deterministic feedback." },
  { label: "Copilot", href: "/copilot", desc: "Think through a bedside clinical scenario step by step." },
  { label: "Reference Hub", href: "/reference-hub", desc: "Fast bedside reference for labs, hemodynamics, and devices." },
  { label: "Rhythm Lab", href: "/rhythm-lab", desc: "Practice systematic ECG strip interpretation." },
  { label: "ICU Drips", href: "/icu-drips", desc: "Bedside monitoring context for common critical care infusions." },
];

function formatDisplayDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogLayout({ meta, children, prev, next }) {
  const updated = meta.dateModified && meta.dateModified !== meta.datePublished;

  return (
    <BlogChrome>
      {/* Breadcrumb */}
      <nav className="ce-breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span className="ce-breadcrumb-sep" aria-hidden="true">→</span>
        <a href="/blog">Blog</a>
        <span className="ce-breadcrumb-sep" aria-hidden="true">→</span>
        <span aria-current="page">{meta.title}</span>
      </nav>

      <article>
        {/* Article header */}
        <header>
          <h1 style={{
            fontWeight: 700,
            fontSize: "clamp(24px, 5.5vw, 34px)",
            color: "var(--ce-text-dark)",
            margin: "0 0 14px",
            letterSpacing: "-0.03em",
            lineHeight: 1.18,
          }}>
            {meta.title}
          </h1>
          <div className="ce-article-meta">
            <span>Published {formatDisplayDate(meta.datePublished)}</span>
            {updated && (
              <>
                <span className="ce-article-meta-dot">·</span>
                <span>Updated {formatDisplayDate(meta.dateModified)}</span>
              </>
            )}
            <span className="ce-article-meta-dot">·</span>
            <span>{meta.readingTimeMinutes} min read</span>
          </div>
          <p className="ce-byline">
            Written and clinically reviewed by the Clinical Edge nursing team. This article is
            educational and does not replace clinical judgment, facility protocol, or provider
            guidance — see our <a href="/privacy">privacy policy</a> for how information is handled.
          </p>
        </header>

        {/* Article body */}
        <div className="ce-blog-body">
          {children}
        </div>
      </article>

      {/* Related resources — reusable across every post */}
      <nav aria-label="Related Clinical Edge resources" className="ce-related">
        <h2>Related Clinical Edge resources</h2>
        <ul>
          {RELATED_RESOURCES.map(({ label, href, desc }) => (
            <li key={href}>
              <a href={href}>{label}</a> — {desc}
            </li>
          ))}
        </ul>
      </nav>

      {/* CTA — per-post copy from meta.cta, falls back to CTASection's own defaults */}
      <CTASection {...(meta.cta || {})} />

      {/* Prev / next article nav — architecture ready for future posts */}
      {(prev || next) && (
        <nav className="ce-blog-adjacent" aria-label="More articles">
          {prev && (
            <a href={`/blog/${prev.slug}`}>
              <span className="ce-blog-adjacent-label">← Previous</span>
              <span className="ce-blog-adjacent-title">{prev.title}</span>
            </a>
          )}
          {next && (
            <a href={`/blog/${next.slug}`} style={{ textAlign: "right", marginLeft: "auto" }}>
              <span className="ce-blog-adjacent-label">Next →</span>
              <span className="ce-blog-adjacent-title">{next.title}</span>
            </a>
          )}
        </nav>
      )}
    </BlogChrome>
  );
}
