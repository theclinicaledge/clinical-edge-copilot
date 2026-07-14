export default function Privacy() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--ce-navy-900)",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        a { outline: none; -webkit-tap-highlight-color: transparent; }
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
            fill="var(--ce-teal)" aria-label="Clinical Edge" style={{ flexShrink: 0 }}>
            <path d="M 159.1,24.3 A 96,96 0 1,0 159.1,175.7 L 135.7,145.7 A 58,58 0 1,1 135.7,54.3 Z" />
            <path d="M 144.0,57 L 208,45 L 218,58 L 208,70 L 150.0,71 Z" />
            <path d="M 158.0,92 L 215,82 L 225,95 L 215,107 L 158.0,108 Z" />
            <path d="M 150.0,129 L 208,130 L 218,142 L 208,155 L 144.0,143 Z" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#F8FBFC", letterSpacing: "-0.3px", lineHeight: 1.15 }}>
              Clinical Edge
            </span>
            <span style={{ fontSize: 10, fontWeight: 500, color: "var(--ce-text-dim)", letterSpacing: "0.7px", textTransform: "uppercase", fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1 }}>
              Copilot
            </span>
          </div>
          <a
            href="/"
            style={{
            marginLeft: "auto",
            fontSize: 11,
            color: "var(--ce-text-dim)",
            textDecoration: "none",
            fontWeight: 500,
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 6,
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
      <div style={{ background: "#E9E3D8", minHeight: "calc(100vh - 58px)", padding: "0 0 80px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px 0" }}>

          <h1 style={{
            fontWeight: 700,
            fontSize: "clamp(22px, 5vw, 30px)",
            color: "var(--ce-text-dark)",
            margin: "0 0 6px",
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
          }}>
            Privacy Policy
          </h1>
          <p style={{
            fontSize: 13,
            color: "var(--ce-text-muted)",
            fontFamily: "'IBM Plex Mono', monospace",
            margin: "0 0 36px",
            letterSpacing: "0.01em",
          }}>
            Effective date: April 1, 2026
          </p>

          {/* ── Policy sections ── */}
          {[
            {
              title: "What Clinical Edge Copilot is",
              body: "Clinical Edge Copilot is an AI-powered clinical reasoning support tool for bedside nurses. It is designed to help nurses think through clinical scenarios, prioritize assessments, and organize their reasoning at the bedside. It is not a diagnostic tool and does not replace clinical judgment, provider orders, or institutional protocols.",
            },
            {
              title: "Do not enter patient information",
              body: "Clinical Edge Copilot is not a HIPAA-covered platform and is not designed to handle protected health information (PHI). Do not enter patient names, medical record numbers (MRNs), dates of birth, Social Security numbers, phone numbers, addresses, or any other information that could identify a specific patient. Describe the clinical situation only — vitals, symptoms, labs, and context — without identifying details.",
            },
            {
              title: "Information you provide in prompts",
              body: "When you submit a query, the text you enter is sent to our backend server and forwarded to Anthropic's Claude API to generate a response. We do not store your queries in a database. Queries are processed transiently to produce a response and are logged in a de-identified, non-attributable format for product improvement purposes only. Logs do not contain user account information because no accounts exist.",
            },
            {
              title: "Local storage",
              body: "Clinical Edge Copilot stores data in your browser's localStorage to support features like recent cases, saved cases, and mode preferences. This data never leaves your device and is not transmitted to our servers. You can clear it at any time through your browser settings.",
            },
            {
              title: "Analytics and usage data",
              body: "We use Vercel Analytics to collect aggregate, anonymized usage data — including page views and interaction events such as query submissions and feature usage. This data does not include the content of your queries and is not linked to any individual user. It is used solely to understand how the product is used and to improve it.",
            },
            {
              title: "How information is used",
              body: "Information processed through the app is used to: (1) generate AI responses to your clinical queries in real time; (2) improve routing and response quality through anonymized, non-attributable usage logs; and (3) understand aggregate product usage through analytics. We do not sell data. We do not share query content with third parties beyond what is necessary to generate responses.",
            },
            {
              title: "Third-party services",
              body: "Clinical Edge Copilot uses the following third-party services:\n\n• Anthropic Claude API — processes query text to generate AI responses. Anthropic's privacy policy applies to data transmitted through their API.\n• Vercel Analytics — collects anonymized usage events. Vercel's privacy policy applies.\n• Google Fonts — fonts are loaded from Google's CDN. Google's privacy policy applies to font requests.",
            },
            {
              title: "Cookies",
              body: "Clinical Edge Copilot does not use cookies for tracking or advertising. Third-party services (Vercel Analytics, Google Fonts) may set their own cookies or use similar technologies subject to their own policies.",
            },
            {
              title: "No accounts or payments",
              body: "Clinical Edge Copilot does not currently require user accounts, registration, or payment. No personal information is collected at sign-up because no sign-up exists.",
            },
            {
              title: "Contact",
              body: "For questions about this privacy policy or the app, contact: clinicaledgehq@gmail.com",
            },
          ].map(({ title, body }) => (
            <div key={title} style={{
              background: "#FFFFFF",
              border: "1px solid var(--ce-warm-line)",
              borderLeft: "3px solid var(--ce-gold)",
              borderRadius: 8,
              padding: "16px 18px",
              marginBottom: 10,
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
                {title}
              </div>
              <p style={{
                fontSize: 14,
                lineHeight: 1.78,
                color: "var(--ce-navy-700)",
                margin: 0,
                whiteSpace: "pre-line",
              }}>
                {body}
              </p>
            </div>
          ))}

          {/* ── Footer ── */}
          <div style={{
            marginTop: 40,
            paddingTop: 20,
            borderTop: "1px solid rgba(0,0,0,0.08)",
            fontSize: 11,
            color: "var(--ce-text-muted)",
            fontFamily: "'IBM Plex Mono', monospace",
            lineHeight: 1.75,
            textAlign: "center",
          }}>
            Clinical Edge Copilot · theclinicaledge.org<br />
            Your clinical judgment comes first.
          </div>

        </div>
      </div>
    </div>
  );
}
