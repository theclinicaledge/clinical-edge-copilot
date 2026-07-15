export default function Support() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--ce-navy-900)",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        a { outline: none; -webkit-tap-highlight-color: transparent; }
        .support-back-link {
          transition: color var(--ce-dur-fast) var(--ce-ease-out);
          text-decoration-color: transparent;
          text-underline-offset: 3px;
          transition-property: color, text-decoration-color;
        }
        .support-back-link:hover { color: var(--ce-teal); text-decoration: underline; text-decoration-color: var(--ce-teal); }
        .support-back-link:focus-visible { outline: 2px solid var(--ce-teal); outline-offset: 2px; }
        .support-text-link {
          transition: color var(--ce-dur-fast) var(--ce-ease-out);
          text-decoration-color: transparent;
          text-underline-offset: 3px;
        }
        .support-text-link:hover { color: var(--ce-teal-deep); text-decoration: underline; text-decoration-color: var(--ce-teal-deep); }
        .support-text-link:focus-visible { outline: 2px solid var(--ce-teal); outline-offset: 2px; }
        .support-footer-link {
          transition: color var(--ce-dur-fast) var(--ce-ease-out);
          text-decoration-color: transparent;
          text-underline-offset: 3px;
        }
        .support-footer-link:hover { color: var(--ce-teal-deep); text-decoration: underline; text-decoration-color: var(--ce-teal-deep); }
        .support-footer-link:focus-visible { outline: 2px solid var(--ce-teal); outline-offset: 2px; }
      `}</style>

      {/* ── Header — unified Clinical Edge header recipe (design-system.md §4.1) ── */}
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
          maxWidth: 720,
          margin: "0 auto",
          padding: "18px 20px 14px",
          display: "flex",
          alignItems: "center",
          gap: 11,
        }}>
          <svg width="30" height="30" viewBox="0 0 225 200" xmlns="http://www.w3.org/2000/svg"
            fill="var(--ce-teal)" aria-label="Clinical Edge" style={{ flexShrink: 0 }}>
            <path d="M 159.1,24.3 A 96,96 0 1,0 159.1,175.7 L 135.7,145.7 A 58,58 0 1,1 135.7,54.3 Z" />
            <path d="M 144.0,57 L 208,45 L 218,58 L 208,70 L 150.0,71 Z" />
            <path d="M 158.0,92 L 215,82 L 225,95 L 215,107 L 158.0,108 Z" />
            <path d="M 150.0,129 L 208,130 L 218,142 L 208,155 L 144.0,143 Z" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ce-text-light)", letterSpacing: "-0.3px", lineHeight: 1.15 }}>
              Clinical Edge
            </span>
            <span style={{ fontSize: "var(--ce-fs-eyebrow)", fontWeight: 500, color: "var(--ce-text-dim)", letterSpacing: "var(--ce-track-eyebrow)", textTransform: "uppercase", fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1 }}>
              Copilot
            </span>
          </div>
          <a
            href="/"
            className="support-back-link"
            style={{
            marginLeft: "auto",
            fontSize: 11,
            color: "var(--ce-text-dim)",
            textDecoration: "none",
            fontWeight: 500,
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: "var(--ce-r-sm)",
            padding: "4px 10px",
            letterSpacing: "0.01em",
            fontFamily: "'IBM Plex Mono', monospace",
            outline: "none",
            WebkitTapHighlightColor: "transparent",
          }}
          >
            ← Back
          </a>
        </div>
      </div>

      {/* ── Warm content surface ──────────────────────────────────────── */}
      <div style={{ background: "var(--ce-warm-bg)", minHeight: "calc(100vh - 58px)", padding: "0 0 80px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px 0" }}>

          <h1 style={{
            fontWeight: 700,
            fontSize: "clamp(22px, 5vw, 30px)",
            color: "var(--ce-text-dark)",
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            margin: "0 0 6px",
          }}>
            Support
          </h1>
          <p style={{ fontSize: 14, color: "var(--ce-text-muted)", margin: "0 0 36px", lineHeight: 1.5 }}>
            Questions, feedback, or issues with Clinical Edge Copilot
          </p>

          {/* ── Contact card — warm surface, gold accent ── */}
          <div style={{
            background: "var(--ce-warm-card)",
            border: "1px solid rgba(212,168,75,0.30)",
            borderLeft: "3px solid var(--ce-gold)",
            borderRadius: "var(--ce-r-md)",
            padding: "18px 20px",
            marginBottom: 32,
          }}>
            <div style={{
              fontSize: "var(--ce-fs-eyebrow)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "var(--ce-track-eyebrow)",
              color: "var(--ce-gold-deep)",
              marginBottom: 8,
              fontFamily: "'IBM Plex Mono', monospace",
            }}>
              Email Support
            </div>
            <a
              href="mailto:clinicaledgehq@gmail.com"
              className="support-text-link"
              style={{ fontSize: 15, fontWeight: 500, color: "var(--ce-teal-deep)", textDecoration: "none" }}
            >
              clinicaledgehq@gmail.com
            </a>
            <p style={{ margin: "10px 0 0", fontSize: 13, color: "var(--ce-text-muted)", lineHeight: 1.65 }}>
              For questions about the product, feedback, bug reports, or anything else — reach out directly. We read every message.
            </p>
          </div>

          {/* ── FAQ section label ── */}
          <div style={{
            fontSize: "var(--ce-fs-eyebrow)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "var(--ce-track-eyebrow)",
            color: "var(--ce-text-muted)",
            marginBottom: 12,
            fontFamily: "'IBM Plex Mono', monospace",
          }}>
            Frequently Asked
          </div>

          {/* ── FAQ items ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              {
                q: "What is Clinical Edge Copilot?",
                a: "Clinical Edge Copilot is a clinical reasoning support tool for bedside nurses, built on a large language model. It helps you think through patient scenarios, interpret findings, and identify escalation needs — not replace clinical judgment.",
              },
              {
                q: "Is this a diagnostic tool?",
                a: "No. Copilot is a reasoning and escalation awareness aid. It does not diagnose, prescribe, or replace provider judgment or institutional policy.",
              },
              {
                q: "Should I enter patient names or identifiers?",
                a: "No. Do not enter any personally identifiable information — names, dates of birth, MRNs, or other patient identifiers. Use clinical context only.",
              },
              {
                q: "How do I report a problem or wrong answer?",
                a: "Email us at clinicaledgehq@gmail.com with the question you asked and what the issue was. We review feedback to improve the product.",
              },
            ].map(({ q, a }) => (
              <div key={q} style={{
                background: "var(--ce-warm-card)",
                border: "1px solid var(--ce-warm-line)",
                borderRadius: "var(--ce-r-md)",
                padding: "16px 18px",
              }}>
                <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 600, color: "var(--ce-text-dark)", lineHeight: 1.4 }}>{q}</p>
                <p style={{ margin: 0, fontSize: 13, color: "var(--ce-text-muted)", lineHeight: 1.65 }}>{a}</p>
              </div>
            ))}
          </div>

          {/* ── Footer ── */}
          <div style={{
            marginTop: 40,
            paddingTop: 20,
            borderTop: "1px solid rgba(0,0,0,0.08)",
            display: "flex",
            gap: 20,
            fontSize: 11,
            color: "var(--ce-text-muted)",
            fontFamily: "'IBM Plex Mono', monospace",
          }}>
            <a href="/privacy" className="support-footer-link" style={{ color: "var(--ce-text-muted)", textDecoration: "none" }}>Privacy Policy</a>
            <a href="/" className="support-footer-link" style={{ color: "var(--ce-text-muted)", textDecoration: "none" }}>← Home</a>
          </div>

        </div>
      </div>
    </div>
  );
}
