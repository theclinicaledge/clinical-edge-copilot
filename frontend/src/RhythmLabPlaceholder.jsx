// ─── CE Logo ──────────────────────────────────────────────────────────────────
function CELogo() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 225 200"
      xmlns="http://www.w3.org/2000/svg"
      fill="#0ABFBC"
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

// ─── Rhythm Lab Placeholder ───────────────────────────────────────────────────
export default function RhythmLabPlaceholder({ onGoHome }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#111827",
      color: "#A8C1CC",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      display: "flex",
      flexDirection: "column",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');
      `}</style>

      {/* ── Sticky header ────────────────────────────────────────────────── */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        paddingTop: "env(safe-area-inset-top)",
        paddingLeft: "max(14px, env(safe-area-inset-left))",
        paddingRight: "max(14px, env(safe-area-inset-right))",
        paddingBottom: 0,
        background: "linear-gradient(to bottom, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0) 100%), rgba(11,31,42,0.97)",
        backdropFilter: "blur(20px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        flexShrink: 0,
      }}>
        <div style={{
          maxWidth: 800,
          margin: "0 auto",
          width: "100%",
          display: "flex",
          alignItems: "center",
          paddingTop: 26,
          paddingBottom: 18,
          gap: 11,
        }}>
          <CELogo />

          {/* Wordmark with tool subtitle */}
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#F8FBFC",
              letterSpacing: "-0.3px",
              lineHeight: 1.15,
            }}>
              Clinical Edge
            </span>
            <span style={{
              fontSize: 10,
              fontWeight: 500,
              color: "#7F99A5",
              letterSpacing: "0.7px",
              textTransform: "uppercase",
              fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
              lineHeight: 1,
            }}>
              Rhythm Lab
            </span>
          </div>

          {/* All tools link */}
          <button
            onClick={onGoHome}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#0ABFBC"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#4A6978"; }}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              color: "#4A6978",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
              letterSpacing: "0.03em",
              padding: "4px 0",
              lineHeight: 1,
              transition: "color 0.15s",
            }}
          >
            ← All tools
          </button>
        </div>
      </div>

      {/* ── Warm surface ─────────────────────────────────────────────────── */}
      <div style={{ background: "#E7E1D6", flex: 1 }}>
        <div style={{
          maxWidth: 800,
          margin: "0 auto",
          width: "100%",
          padding: "52px 20px 72px",
        }}>

          {/* Page header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1.4px",
              color: "#0ABFBC",
              fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
              marginBottom: 12,
              opacity: 0.9,
            }}>
              ECG Interpretation
            </div>
            <h1 style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(24px, 5vw, 34px)",
              color: "#111827",
              margin: "0 0 12px",
              lineHeight: 1.1,
              letterSpacing: "-0.04em",
            }}>
              Rhythm Lab
            </h1>
            <p style={{
              fontSize: "clamp(14px, 3vw, 16px)",
              color: "#526174",
              margin: 0,
              lineHeight: 1.55,
              maxWidth: 500,
            }}>
              Systematic ECG strip analysis and rhythm recognition — built for nurses who work with monitored patients.
            </p>
          </div>

          {/* Status card */}
          <div style={{
            background: "#1E2A3A",
            border: "1px solid #2D3B4E",
            borderLeft: "3px solid #0ABFBC",
            borderRadius: 8,
            padding: "22px 22px",
            marginBottom: 14,
          }}>
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1.4px",
              color: "#0ABFBC",
              fontFamily: "'IBM Plex Mono', monospace",
              marginBottom: 12,
              opacity: 0.9,
            }}>
              Integration in progress
            </div>
            <div style={{
              fontSize: 14,
              color: "#A8C1CC",
              lineHeight: 1.72,
              marginBottom: 16,
            }}>
              Rhythm Lab is being brought into Clinical Edge. When integration is complete, you'll access it directly from here — same platform, same session.
            </div>
            <div style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
            }}>
              {["ECG strip analysis", "Systematic interpretation", "Pattern recognition practice"].map((item) => (
                <span key={item} style={{
                  fontSize: 11,
                  color: "#4A8A9A",
                  fontFamily: "'IBM Plex Mono', monospace",
                  background: "rgba(10,191,188,0.06)",
                  border: "1px solid rgba(10,191,188,0.12)",
                  borderRadius: 4,
                  padding: "3px 8px",
                  letterSpacing: "0.01em",
                }}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Back button */}
          <button
            onClick={onGoHome}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(10,191,188,0.30)";
              e.currentTarget.style.color = "#0ABFBC";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#2D3B4E";
              e.currentTarget.style.color = "#7F99A5";
            }}
            style={{
              background: "transparent",
              border: "1px solid #2D3B4E",
              color: "#7F99A5",
              borderRadius: 6,
              padding: "9px 18px",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              transition: "border-color 0.15s, color 0.15s",
            }}
          >
            ← Back to all tools
          </button>

        </div>
      </div>
    </div>
  );
}
