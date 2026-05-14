export default function Support() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#111827",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
      `}</style>

      {/* ── Header — dark navy shell, matches App.jsx ─────────────────── */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(11,31,42,0.97)",
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
          <svg width="26" height="26" viewBox="0 0 225 200" xmlns="http://www.w3.org/2000/svg"
            fill="#0ABFBC" aria-label="Clinical Edge" style={{ flexShrink: 0 }}>
            <path d="M 159.1,24.3 A 96,96 0 1,0 159.1,175.7 L 135.7,145.7 A 58,58 0 1,1 135.7,54.3 Z" />
            <path d="M 144.0,57 L 208,45 L 218,58 L 208,70 L 150.0,71 Z" />
            <path d="M 158.0,92 L 215,82 L 225,95 L 215,107 L 158.0,108 Z" />
            <path d="M 150.0,129 L 208,130 L 218,142 L 208,155 L 144.0,143 Z" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#F8FBFC", letterSpacing: "-0.3px", lineHeight: 1.15 }}>
              Clinical Edge
            </span>
            <span style={{ fontSize: 10, fontWeight: 500, color: "#7F99A5", letterSpacing: "0.7px", textTransform: "uppercase", fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1 }}>
              Copilot
            </span>
          </div>
          <a
            href="/#/"
            style={{ marginLeft: "auto", fontSize: 12, color: "#7F99A5", textDecoration: "none", fontWeight: 400 }}
          >
            ← Back to app
          </a>
        </div>
      </div>

      {/* ── Warm content surface ──────────────────────────────────────── */}
      <div style={{ background: "#E9E3D8", minHeight: "calc(100vh - 58px)", padding: "0 0 80px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px 0" }}>

          <h1 style={{
            fontWeight: 700,
            fontSize: "clamp(22px, 5vw, 30px)",
            color: "#111827",
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            margin: "0 0 6px",
          }}>
            Support
          </h1>
          <p style={{ fontSize: 14, color: "#526174", margin: "0 0 36px", lineHeight: 1.5 }}>
            Questions, feedback, or issues with Clinical Edge Copilot
          </p>

          {/* ── Contact card — warm surface, gold accent ── */}
          <div style={{
            background: "#FFFDF8",
            border: "1px solid rgba(212,168,75,0.30)",
            borderLeft: "3px solid #D4A84B",
            borderRadius: 8,
            padding: "18px 20px",
            marginBottom: 32,
          }}>
            <div style={{
              fontSize: 9,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1.3px",
              color: "#8A6A22",
              marginBottom: 8,
              fontFamily: "'IBM Plex Mono', monospace",
            }}>
              Email Support
            </div>
            <a
              href="mailto:clinicaledgehq@gmail.com"
              style={{ fontSize: 16, fontWeight: 600, color: "#0ABFBC", textDecoration: "none" }}
            >
              clinicaledgehq@gmail.com
            </a>
            <p style={{ margin: "10px 0 0", fontSize: 13, color: "#526174", lineHeight: 1.65 }}>
              For questions about the product, feedback, bug reports, or anything else — reach out directly. We read every message.
            </p>
          </div>

          {/* ── FAQ section label ── */}
          <div style={{
            fontSize: 9,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1.3px",
            color: "#526174",
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
                a: "Clinical Edge Copilot is an AI-powered clinical reasoning support tool for bedside nurses. It helps you think through patient scenarios, interpret findings, and identify escalation needs — not replace clinical judgment.",
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
                background: "#FFFFFF",
                border: "1px solid #D6D0C4",
                borderRadius: 8,
                padding: "16px 18px",
              }}>
                <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 600, color: "#111827", lineHeight: 1.4 }}>{q}</p>
                <p style={{ margin: 0, fontSize: 13, color: "#526174", lineHeight: 1.65 }}>{a}</p>
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
            color: "#526174",
            fontFamily: "'IBM Plex Mono', monospace",
          }}>
            <a href="/#/privacy" style={{ color: "#526174", textDecoration: "none" }}>Privacy Policy</a>
            <a href="/#/" style={{ color: "#526174", textDecoration: "none" }}>Back to Copilot</a>
          </div>

        </div>
      </div>
    </div>
  );
}
