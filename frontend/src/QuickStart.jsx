import { useState } from "react";

// ─── Design Tokens (mirrors Landing.jsx) ──────────────────────────────────────
const C = {
  bg:           "#0B1F2A",
  card:         "#112936",
  accent:       "#00C2D1",
  textPrimary:  "#F8FBFC",
  textSecondary:"#A8C1CC",
  muted:        "#7F99A5",
  subtle:       "#3A5566",
  border:       "rgba(255,255,255,0.07)",
  borderAccent: "rgba(0,194,209,0.2)",
};

// ─── CE Logo ──────────────────────────────────────────────────────────────────
function CELogo({ size = 24 }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 225 200"
      xmlns="http://www.w3.org/2000/svg" fill={C.accent}
      style={{ flexShrink: 0, display: "block" }}
    >
      <path d="M 159.1,24.3 A 96,96 0 1,0 159.1,175.7 L 135.7,145.7 A 58,58 0 1,1 135.7,54.3 Z" />
      <path d="M 144.0,57 L 208,45 L 218,58 L 208,70 L 150.0,71 Z" />
      <path d="M 158.0,92 L 215,82 L 225,95 L 215,107 L 158.0,108 Z" />
      <path d="M 150.0,129 L 208,130 L 218,142 L 208,155 L 144.0,143 Z" />
    </svg>
  );
}

const EXAMPLES = [
  "BP dropping post-op",
  "Patient more confused than earlier",
  "New chest pain but vitals okay",
];

// ─── QuickStart Component ─────────────────────────────────────────────────────
export default function QuickStart({ onBack, onEnterApp }) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    // Store prefill in localStorage so App can pick it up on mount
    try {
      localStorage.setItem("copilot_prefill", trimmed);
    } catch (e) {
      console.log("QuickStart prefill:", trimmed);
    }
    onEnterApp();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', sans-serif", color: C.textPrimary }}>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(20px, 5vw, 60px)", height: 62,
        background: "rgba(11,31,42,0.88)",
        backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <button onClick={onBack} style={{
          background: "none", border: "none", color: C.muted,
          fontFamily: "'Inter', sans-serif", fontSize: 13, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6, padding: 0,
        }}>
          <span style={{ fontSize: 15 }}>←</span> Back
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <CELogo size={22} />
          <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.4px", color: C.textPrimary }}>
            Clinical Edge Copilot
          </span>
        </div>

        <button onClick={onEnterApp} style={{
          background: "none", border: `1px solid ${C.borderAccent}`,
          color: C.accent, fontFamily: "'Inter', sans-serif",
          fontSize: 12, fontWeight: 600, padding: "7px 16px",
          borderRadius: 8, cursor: "pointer",
        }}>
          Skip to App
        </button>
      </nav>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <main style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: "80px clamp(20px, 5vw, 40px) 100px",
      }}>

        {/* Label */}
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10,
          fontWeight: 500,
          color: C.accent,
          letterSpacing: "1.8px",
          textTransform: "uppercase",
          marginBottom: 16,
        }}>
          Your Patient
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: "clamp(26px, 4.5vw, 40px)",
          fontWeight: 800,
          color: C.textPrimary,
          letterSpacing: "-1.5px",
          lineHeight: 1.08,
          margin: "0 0 12px",
        }}>
          What's going on with your patient?
        </h1>

        {/* Subtext */}
        <p style={{
          fontSize: 16,
          color: C.textSecondary,
          lineHeight: 1.65,
          margin: "0 0 36px",
        }}>
          Describe the situation in your own words.
        </p>

        {/* Input card */}
        <div style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          padding: "4px",
          marginBottom: 16,
          transition: "border-color 0.2s ease",
        }}>
          <textarea
            autoFocus
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={"e.g. BP dropping post-op and patient looks pale, HR climbing..."}
            rows={5}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "none",
              fontFamily: "'Inter', sans-serif",
              fontSize: 15,
              color: C.textPrimary,
              lineHeight: 1.72,
              padding: "18px 20px",
              boxSizing: "border-box",
              caretColor: C.accent,
            }}
          />
        </div>

        {/* Example chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 36 }}>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            color: C.muted,
            letterSpacing: "0.3px",
            alignSelf: "center",
            marginRight: 2,
          }}>
            Try:
          </span>
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              onClick={() => setValue(ex)}
              style={{
                background: "transparent",
                border: `1px solid ${C.subtle}`,
                borderRadius: 20,
                padding: "6px 14px",
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                color: C.muted,
                cursor: "pointer",
                transition: "border-color 0.15s ease, color 0.15s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.textPrimary; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.subtle; e.currentTarget.style.color = C.muted; }}
            >
              {ex}
            </button>
          ))}
        </div>

        {/* Submit button */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: value.trim() ? C.accent : "rgba(0,194,209,0.25)",
              color: value.trim() ? "#0B1F2A" : "rgba(11,31,42,0.5)",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: 15,
              padding: "14px 34px",
              borderRadius: 11,
              border: "none",
              cursor: value.trim() ? "pointer" : "not-allowed",
              letterSpacing: "-0.2px",
              boxShadow: value.trim() ? "0 6px 24px rgba(0,194,209,0.2)" : "none",
              transition: "all 0.18s ease",
            }}
            onMouseEnter={e => { if (value.trim()) e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
          >
            Start thinking it through →
          </button>

          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            color: C.subtle,
            letterSpacing: "0.3px",
          }}>
            ⌘ + Enter
          </span>
        </div>
      </main>
    </div>
  );
}
