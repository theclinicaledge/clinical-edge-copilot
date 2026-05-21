import { useState } from "react";

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

// ─── Module definitions ───────────────────────────────────────────────────────
const MODULES = [
  {
    key: "copilot",
    tag: "Clinical Reasoning",
    title: "Copilot",
    description:
      "Bedside clinical reasoning support. For the moment before a call, or right after getting report.",
    status: "active",
    path: "/copilot",
  },
  {
    key: "rhythmlab",
    tag: "ECG Interpretation",
    title: "Rhythm Lab",
    description:
      "Systematic ECG strip analysis and rhythm recognition. Built for nurses who work with monitored patients.",
    status: "active",
    path: "/rhythm-lab",
  },
  {
    key: "icudrips",
    tag: "Infusion Reference",
    title: "ICU Drips",
    description:
      "Common critical care infusion reference — dosing, titration parameters, and monitoring essentials.",
    status: "soon",
    path: null,
  },
];

// ─── Module Entry ─────────────────────────────────────────────────────────────
// Editorial list entry — no background box, warm surface breathes through,
// separated by thin horizontal dividers.
function ModuleEntry({ module, onNavigate }) {
  const [hovered, setHovered] = useState(false);
  const isActive = module.status === "active";

  return (
    <div
      onMouseEnter={() => isActive && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={isActive ? () => onNavigate(module.path) : undefined}
      style={{
        padding: "20px 0",
        borderBottom: `1px solid ${hovered ? "rgba(17,24,39,0.15)" : "rgba(17,24,39,0.09)"}`,
        cursor: isActive ? "pointer" : "default",
        transition: "border-color 0.2s",
      }}
    >
      {/* Tag + action */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 5,
        gap: 12,
      }}>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          color: isActive ? "#0ABFBC" : "#8A9BA8",
          fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        }}>
          {module.tag}
        </span>
        {isActive ? (
          <span style={{
            fontSize: 12,
            color: hovered ? "#0ABFBC" : "#6A8A9A",
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: "0.04em",
            display: "inline-block",
            transform: hovered ? "translateX(2px)" : "translateX(0)",
            transition: "color 0.15s, transform 0.18s",
            flexShrink: 0,
          }}>
            Open →
          </span>
        ) : (
          <span style={{
            fontSize: 10,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "1.1px",
            color: "#8A9BA8",
            fontFamily: "'IBM Plex Mono', monospace",
            flexShrink: 0,
          }}>
            Coming soon
          </span>
        )}
      </div>

      {/* Title */}
      <div style={{
        fontSize: "clamp(17px, 3.2vw, 20px)",
        fontWeight: 700,
        color: isActive ? (hovered ? "#07111C" : "#111827") : "#9AABBA",
        letterSpacing: "-0.025em",
        lineHeight: 1.15,
        marginBottom: 6,
        transition: "color 0.15s",
      }}>
        {module.title}
      </div>

      {/* Description */}
      <div style={{
        fontSize: 13.5,
        color: isActive ? "#526174" : "#8A9BA8",
        lineHeight: 1.6,
        maxWidth: 520,
      }}>
        {module.description}
      </div>
    </div>
  );
}

// ─── Clinical Edge Home Hub ───────────────────────────────────────────────────
export default function ClinicalEdgeHome({ onNavigate }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#111827",
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
          <span style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#F8FBFC",
            letterSpacing: "-0.3px",
            lineHeight: 1.15,
          }}>
            Clinical Edge
          </span>
        </div>
      </div>

      {/* ── Warm surface ─────────────────────────────────────────────────── */}
      <div style={{ background: "#E7E1D6", flex: 1 }}>
        <div style={{
          maxWidth: 780,
          margin: "0 auto",
          width: "100%",
          padding: "48px 20px 72px",
        }}>

          {/* Hero */}
          <div style={{ marginBottom: 36 }}>
            <h1 style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(24px, 5.5vw, 36px)",
              color: "#111827",
              margin: "0 0 13px",
              lineHeight: 1.08,
              letterSpacing: "-0.04em",
            }}>
              Clinical tools for real-world nursing.
            </h1>
            <p style={{
              fontSize: "clamp(14px, 2.8vw, 16px)",
              color: "#526174",
              margin: 0,
              lineHeight: 1.55,
              fontWeight: 400,
              maxWidth: 500,
            }}>
              Think through clinical situations, practice rhythm recognition, and build bedside confidence.
            </p>
          </div>

          {/* Module list — editorial entries with dividers */}
          <div style={{ borderTop: "1px solid rgba(17,24,39,0.09)" }}>
            {MODULES.map((mod) => (
              <ModuleEntry key={mod.key} module={mod} onNavigate={onNavigate} />
            ))}
          </div>

          {/* Footer — disclaimer + compliance links */}
          <div style={{
            marginTop: 36,
            fontFamily: "'IBM Plex Mono', monospace",
          }}>
            <p style={{
              fontSize: 11,
              color: "#7F99A5",
              lineHeight: 1.65,
              margin: "0 0 12px",
            }}>
              Educational and clinical reasoning support only. Not a diagnostic tool. Follow local protocol, provider guidance, and institutional policy.
            </p>
            <div style={{ display: "flex", gap: 18 }}>
              {[
                { label: "Privacy",    path: "/privacy" },
                { label: "Support",    path: "/support" },
              ].map(({ label, path }) => (
                <a
                  key={label}
                  href={path}
                  onClick={(e) => { e.preventDefault(); onNavigate(path); }}
                  style={{
                    fontSize: 11,
                    color: "#7F99A5",
                    textDecoration: "none",
                    letterSpacing: "0.02em",
                  }}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
