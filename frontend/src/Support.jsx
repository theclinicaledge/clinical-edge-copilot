export default function Support() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0B1F2A",
      color: "#A8C1CC",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: "0 0 80px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        a { color: #00C2D1; text-decoration: none; }
        a:hover { text-decoration: underline; }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(11,31,42,0.97)",
        backdropFilter: "blur(20px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        paddingTop: "env(safe-area-inset-top)",
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px 16px", display: "flex", alignItems: "center", gap: 11 }}>
          <svg width="26" height="26" viewBox="0 0 225 200" xmlns="http://www.w3.org/2000/svg" fill="#00C2D1" aria-label="Clinical Edge" style={{ flexShrink: 0 }}>
            <path d="M 159.1,24.3 A 96,96 0 1,0 159.1,175.7 L 135.7,145.7 A 58,58 0 1,1 135.7,54.3 Z" />
            <path d="M 144.0,57 L 208,45 L 218,58 L 208,70 L 150.0,71 Z" />
            <path d="M 158.0,92 L 215,82 L 225,95 L 215,107 L 158.0,108 Z" />
            <path d="M 150.0,129 L 208,130 L 218,142 L 208,155 L 144.0,143 Z" />
          </svg>
          <span style={{ fontWeight: 600, fontSize: 16, color: "#E6EEF2", letterSpacing: "-0.01em" }}>Clinical Edge Copilot</span>
          <a href="/#/app" style={{ marginLeft: "auto", fontSize: 13, color: "rgba(168,193,204,0.6)" }}>← Back to app</a>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 16px 0" }}>

        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#E6EEF2", letterSpacing: "-0.02em", marginBottom: 8, marginTop: 0 }}>
          Support
        </h1>
        <p style={{ fontSize: 15, color: "rgba(168,193,204,0.7)", marginBottom: 40, marginTop: 0 }}>
          Questions, feedback, or issues with Clinical Edge Copilot
        </p>

        {/* Contact card */}
        <div style={{
          background: "rgba(0,194,209,0.05)",
          border: "1px solid rgba(0,194,209,0.15)",
          borderRadius: 14,
          padding: "24px 24px",
          marginBottom: 32,
        }}>
          <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(0,194,209,0.7)" }}>
            Email Support
          </p>
          <a href="mailto:clinicaledgehq@gmail.com" style={{ fontSize: 17, fontWeight: 600, color: "#00C2D1" }}>
            clinicaledgehq@gmail.com
          </a>
          <p style={{ margin: "12px 0 0", fontSize: 14, color: "rgba(168,193,204,0.65)", lineHeight: 1.55 }}>
            For questions about the product, feedback, bug reports, or anything else — reach out directly. We read every message.
          </p>
        </div>

        {/* FAQ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              paddingBottom: 20,
            }}>
              <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 600, color: "#E6EEF2" }}>{q}</p>
              <p style={{ margin: 0, fontSize: 14, color: "rgba(168,193,204,0.7)", lineHeight: 1.6 }}>{a}</p>
            </div>
          ))}
        </div>

        {/* Footer links */}
        <div style={{ marginTop: 48, display: "flex", gap: 20, fontSize: 13, color: "rgba(168,193,204,0.4)" }}>
          <a href="/#/privacy">Privacy Policy</a>
          <a href="/#/app">Back to Copilot</a>
        </div>

      </div>
    </div>
  );
}
