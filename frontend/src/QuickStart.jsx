import { useState, useEffect } from "react";
import { trackEvent } from "./analytics";

// ─── CE Logo ──────────────────────────────────────────────────────────────────
function CELogo({ size = 24 }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 225 200"
      xmlns="http://www.w3.org/2000/svg" fill="var(--ce-teal)"
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
  { id: "bp_drop",    text: "BP dropping post-op" },
  { id: "confusion",  text: "Patient more confused than earlier" },
  { id: "chest_pain", text: "New chest pain but vitals okay" },
];

// ─── QuickStart Component ─────────────────────────────────────────────────────
export default function QuickStart({ onBack, onEnterApp }) {
  const [value, setValue] = useState("");

  // Track module open — fires once on mount
  useEffect(() => {
    trackEvent('quickstart_opened', { source: 'direct' });
  }, []);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    // Store prefill in localStorage so App can pick it up on mount
    try {
      localStorage.setItem("copilot_prefill", trimmed);
      trackEvent('quickstart_completed', { destination: 'copilot' });
    } catch (e) {
      console.warn("QuickStart prefill: localStorage unavailable");
    }
    onEnterApp();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--ce-navy-900)", fontFamily: "'Inter', sans-serif", color: "var(--ce-text-light)" }}>
      <style>{`
        .qs-nav-link {
          transition: color var(--ce-dur-fast) var(--ce-ease-out);
          text-decoration-color: transparent;
          text-underline-offset: 3px;
        }
        .qs-nav-link:hover { color: var(--ce-teal); }
        .qs-nav-link:focus-visible { outline: 2px solid var(--ce-teal); outline-offset: 2px; }
        .qs-nav-cta {
          transition: border-color var(--ce-dur-fast) var(--ce-ease-out), background var(--ce-dur-fast) var(--ce-ease-out), transform var(--ce-dur-fast) var(--ce-ease-out);
        }
        .qs-nav-cta:hover { border-color: rgba(10,191,188,0.30); background: rgba(10,191,188,0.06); }
        .qs-nav-cta:active { transform: scale(0.98); transition-duration: 60ms; }
        .qs-nav-cta:focus-visible { outline: 2px solid var(--ce-teal); outline-offset: 2px; }
        .qs-input-card {
          transition: border-color var(--ce-dur-fast) var(--ce-ease-out);
        }
        .qs-input-card:focus-within { border-color: var(--ce-teal); }
        .qs-example-chip {
          transition: border-color var(--ce-dur-fast) var(--ce-ease-out), color var(--ce-dur-fast) var(--ce-ease-out), transform var(--ce-dur-fast) var(--ce-ease-out), opacity var(--ce-dur-fast) var(--ce-ease-out);
        }
        .qs-example-chip:hover { border-color: var(--ce-teal); color: var(--ce-text-light); }
        .qs-example-chip:active { transform: scale(0.97); opacity: 0.85; transition-duration: 60ms; }
        .qs-example-chip:focus-visible { outline: 2px solid var(--ce-teal); outline-offset: 2px; }
        .qs-submit-btn {
          transition: background var(--ce-dur-fast) var(--ce-ease-out), transform var(--ce-dur-fast) var(--ce-ease-out);
        }
        .qs-submit-btn:not(:disabled):hover { background: var(--ce-teal-deep); }
        .qs-submit-btn:not(:disabled):active { transform: scale(0.98); transition-duration: 60ms; }
        .qs-submit-btn:focus-visible { outline: 2px solid var(--ce-teal); outline-offset: 2px; }
      `}</style>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(20px, 5vw, 60px)", height: 62,
        background: "var(--ce-navy-header)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--ce-line-dark)",
      }}>
        <button onClick={onBack} className="qs-nav-link" style={{
          background: "none", border: "none", color: "var(--ce-text-dim)",
          fontFamily: "'Inter', sans-serif", fontSize: 13, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6, padding: 0,
        }}>
          <span style={{ fontSize: 15 }}>←</span> Back
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <CELogo size={22} />
          <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.4px", color: "var(--ce-text-light)" }}>
            Clinical Edge Copilot
          </span>
        </div>

        <button onClick={onEnterApp} className="qs-nav-cta" style={{
          background: "none", border: "1px solid rgba(10,191,188,0.22)",
          color: "var(--ce-teal)", fontFamily: "'Inter', sans-serif",
          fontSize: 12, fontWeight: 600, padding: "7px 16px",
          borderRadius: "var(--ce-r-md)", cursor: "pointer",
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
          fontSize: "var(--ce-fs-eyebrow)",
          fontWeight: 500,
          color: "var(--ce-teal)",
          letterSpacing: "var(--ce-track-eyebrow)",
          textTransform: "uppercase",
          marginBottom: 16,
        }}>
          Your Patient
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: "clamp(26px, 4.5vw, 40px)",
          fontWeight: 800,
          color: "var(--ce-text-light)",
          letterSpacing: "-1.5px",
          lineHeight: 1.08,
          margin: "0 0 12px",
        }}>
          What's going on with your patient?
        </h1>

        {/* Subtext */}
        <p style={{
          fontSize: 16,
          color: "var(--ce-text-light-body)",
          lineHeight: 1.65,
          margin: "0 0 36px",
        }}>
          Describe the situation in your own words.
        </p>

        {/* Input card */}
        <div className="qs-input-card" style={{
          background: "var(--ce-navy-700)",
          border: "1px solid var(--ce-line-dark)",
          borderRadius: "var(--ce-r-lg)",
          padding: "4px",
          marginBottom: 16,
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
              color: "var(--ce-text-light)",
              lineHeight: 1.72,
              padding: "18px 20px",
              boxSizing: "border-box",
              caretColor: "var(--ce-teal)",
            }}
          />
        </div>

        {/* Example chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 36 }}>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            color: "var(--ce-text-dim)",
            letterSpacing: "0.3px",
            alignSelf: "center",
            marginRight: 2,
          }}>
            Try:
          </span>
          {EXAMPLES.map(ex => (
            <button
              key={ex.id}
              className="qs-example-chip"
              onClick={() => { setValue(ex.text); trackEvent('quickstart_option_selected', { option_id: ex.id }); }}
              style={{
                background: "transparent",
                border: "1px solid var(--ce-text-dim)",
                borderRadius: "var(--ce-r-sm)",
                padding: "6px 14px",
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                color: "var(--ce-text-dim)",
                cursor: "pointer",
              }}
            >
              {ex.text}
            </button>
          ))}
        </div>

        {/* Submit button */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <button
            className="qs-submit-btn"
            onClick={handleSubmit}
            disabled={!value.trim()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: value.trim() ? "var(--ce-teal)" : "rgba(10,191,188,0.08)",
              color: value.trim() ? "var(--ce-text-dark)" : "var(--ce-text-light-sec)",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              padding: "10px 22px",
              borderRadius: "var(--ce-r-md)",
              border: "none",
              cursor: value.trim() ? "pointer" : "not-allowed",
              letterSpacing: "-0.2px",
              boxShadow: "none",
            }}
          >
            Start thinking it through →
          </button>

          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            color: "var(--ce-text-dim)",
            letterSpacing: "0.3px",
          }}>
            ⌘ + Enter
          </span>
        </div>
      </main>
    </div>
  );
}
