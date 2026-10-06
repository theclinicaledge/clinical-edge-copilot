// ─── Reusable Clinical Edge CTA banner ──────────────────────────────────────
// Used at the end of every blog article. Flat navy card — matches the app's
// existing "gradients → flat --ce-navy-900" convention, no new visual language.
export default function CTASection({
  eyebrow = "Try it yourself",
  headline = "Practice ABG interpretation with Clinical Edge",
  body = "Explore educational references and fictional practice scenarios.",
  primaryLabel = "Explore ABG Lab",
  primaryHref = "/abg-lab",
  secondaryLabel = "Open Shift Brain",
  secondaryHref = "/copilot",
}) {
  return (
    <div className="ce-blog-cta">
      <div className="ce-blog-cta-eyebrow">{eyebrow}</div>
      <h2>{headline}</h2>
      <p>{body}</p>
      <div className="ce-blog-cta-buttons">
        <a href={primaryHref} className="ce-blog-cta-btn ce-blog-cta-btn--primary">{primaryLabel}</a>
        {secondaryHref && (
          <a href={secondaryHref} className="ce-blog-cta-btn ce-blog-cta-btn--secondary">{secondaryLabel}</a>
        )}
      </div>
    </div>
  );
}
