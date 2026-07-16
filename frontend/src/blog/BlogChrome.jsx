// ─── Clinical Edge Blog — shared header / footer shell ─────────────────────
// Matches the sticky-header + warm-surface recipe used across Privacy.jsx,
// Download.jsx, and ClinicalEdgeHome.jsx. Kept local to the blog section so
// BlogIndex and every article page share one implementation.
import "./blog.css";

function CELogo({ size = 26 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 225 200"
      xmlns="http://www.w3.org/2000/svg"
      fill="var(--ce-teal)"
      aria-label="Clinical Edge"
      style={{ flexShrink: 0, display: "block" }}
    >
      <path d="M 159.1,24.3 A 96,96 0 1,0 159.1,175.7 L 135.7,145.7 A 58,58 0 1,1 135.7,54.3 Z" />
      <path d="M 144.0,57 L 208,45 L 218,58 L 208,70 L 150.0,71 Z" />
      <path d="M 158.0,92 L 215,82 L 225,95 L 215,107 L 158.0,108 Z" />
      <path d="M 150.0,129 L 208,130 L 218,142 L 208,155 L 144.0,143 Z" />
    </svg>
  );
}

export default function BlogChrome({ children, contentMaxWidth = 720 }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--ce-navy-900)",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        a { -webkit-tap-highlight-color: transparent; }
      `}</style>

      {/* ── Header — unified Clinical Edge header recipe ── */}
      <div style={{
        borderBottom: "1px solid var(--ce-line-dark)",
        background: "var(--ce-navy-header)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        paddingTop: "env(safe-area-inset-top)",
        paddingLeft: "max(0px, env(safe-area-inset-left))",
        paddingRight: "max(0px, env(safe-area-inset-right))",
      }}>
        <div style={{
          maxWidth: contentMaxWidth,
          margin: "0 auto",
          padding: "18px 20px 14px",
          display: "flex",
          alignItems: "center",
          gap: 11,
        }}>
          <CELogo />
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ce-text-light)", letterSpacing: "-0.3px", lineHeight: 1.15 }}>
              Clinical Edge
            </span>
            <span style={{
              fontSize: 10, fontWeight: 500, color: "var(--ce-text-dim)",
              letterSpacing: "0.7px", textTransform: "uppercase",
              fontFamily: "'IBM Plex Mono', 'Courier New', monospace", lineHeight: 1,
            }}>
              Blog
            </span>
          </div>
          <a href="/" className="ce-back-link">← All tools</a>
        </div>
      </div>

      {/* ── Warm content surface ── */}
      <main className="ce-page-enter" style={{ background: "var(--ce-warm-bg)", minHeight: "calc(100vh - 66px)", padding: "0 0 0" }}>
        <div style={{ maxWidth: contentMaxWidth, margin: "0 auto", padding: "40px 20px 0" }}>
          {children}
        </div>

        {/* ── Footer ── */}
        <footer style={{ maxWidth: contentMaxWidth, margin: "0 auto", padding: "0 20px" }}>
          <div style={{
            marginTop: 20,
            paddingTop: 20,
            paddingBottom: 48,
            borderTop: "1px solid rgba(0,0,0,0.08)",
            fontFamily: "'IBM Plex Mono', monospace",
          }}>
            <p style={{ fontSize: 11, color: "var(--ce-text-dim)", lineHeight: 1.65, margin: "0 0 12px" }}>
              Educational and clinical reasoning support only. Not a diagnostic tool. Follow local protocol, provider guidance, and institutional policy.
            </p>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "var(--ce-text-muted)", letterSpacing: "0.02em" }}>
                Clinical Edge · theclinicaledge.org
              </span>
              {[
                { label: "Blog", path: "/blog" },
                { label: "Privacy", path: "/privacy" },
                { label: "Support", path: "/support" },
              ].map(({ label, path }) => (
                <a key={label} href={path} style={{ fontSize: 11, color: "var(--ce-text-dim)", textDecoration: "none", letterSpacing: "0.02em" }}>
                  {label}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
