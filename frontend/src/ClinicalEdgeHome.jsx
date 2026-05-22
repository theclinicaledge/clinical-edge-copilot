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
// Each entry carries its own visual weight tokens — no uniform treatment.
const MODULES = [
  {
    key: "copilot",
    tag: "Clinical Reasoning",
    title: "Copilot",
    description:
      "Bedside clinical reasoning support. For the moment before a call, or right after getting report.",
    status: "active",
    path: "/copilot",
    // Dominant — largest type, most space, strongest weight
    titleSize: "clamp(22px, 4.5vw, 28px)",
    titleWeight: 800,
    titleTracking: "-0.038em",
    paddingTop: 34,
    paddingBottom: 22,
    descSize: 14,
    descColor: "#526174",
    tagColor: "#0ABFBC",
    tagOpacity: 1,
  },
  {
    key: "rhythmlab",
    tag: "ECG Interpretation",
    title: "Rhythm Lab",
    description:
      "Systematic ECG strip analysis and rhythm recognition. Built for nurses who work with monitored patients.",
    status: "active",
    path: "/rhythm-lab",
    // Secondary — tighter, editorial utility feel
    titleSize: "clamp(17px, 3.2vw, 20px)",
    titleWeight: 700,
    titleTracking: "-0.028em",
    paddingTop: 26,
    paddingBottom: 17,
    descSize: 13,
    descColor: "#526174",
    tagColor: "#0ABFBC",
    tagOpacity: 0.85,
  },
  {
    key: "icudrips",
    tag: "Infusion Reference",
    title: "ICU Drips",
    description:
      "Common critical care infusion reference — dosing, titration parameters, and monitoring essentials.",
    status: "soon",
    path: null,
    // Quieter — future-facing, intentional placeholder
    titleSize: "clamp(15px, 2.8vw, 17px)",
    titleWeight: 600,
    titleTracking: "-0.018em",
    paddingTop: 20,
    paddingBottom: 14,
    descSize: 12.5,
    descColor: "#8A9BA8",
    tagColor: "#8A9BA8",
    tagOpacity: 0.75,
  },
];

// ─── Module Entry ─────────────────────────────────────────────────────────────
// Each entry renders from its own style tokens — no shared uniform treatment.
// Active modules: hover deepens title color and fades in a directional arrow.
// Soon modules: lower contrast throughout, "· soon" inline with the tag.
function ModuleEntry({ module, isLast, onNavigate }) {
  const [hovered, setHovered] = useState(false);
  const isActive = module.status === "active";

  return (
    <div
      onMouseEnter={() => isActive && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={isActive ? () => onNavigate(module.path) : undefined}
      style={{
        paddingTop: module.paddingTop,
        paddingBottom: module.paddingBottom,
        borderBottom: isLast ? "none" : "1px solid rgba(17,24,39,0.07)",
        cursor: isActive ? "pointer" : "default",
        // Subtle background wash on hover — tactile without adding a card
        background: hovered && isActive ? "rgba(17,24,39,0.032)" : "transparent",
        transition: "background 0.18s",
        borderRadius: 4,
        margin: "0 -6px",
        paddingLeft: 6,
        paddingRight: 6,
      }}
    >
      {/* Tag row — tag text left, hover arrow right */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 9,
      }}>
        <span style={{
          fontSize: 9.5,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          color: module.tagColor,
          opacity: module.tagOpacity,
          fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          {module.tag}
          {/* "soon" is part of the tag line — intentional, not a badge */}
          {!isActive && (
            <span style={{
              fontWeight: 400,
              letterSpacing: "0.8px",
              opacity: 0.65,
            }}>
              · soon
            </span>
          )}
        </span>

        {/* Directional arrow — appears only on hover, replaces "Open →" */}
        {isActive && (
          <span style={{
            fontSize: 12,
            color: hovered ? "#0ABFBC" : "transparent",
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: "0.04em",
            transition: "color 0.18s",
            flexShrink: 0,
            userSelect: "none",
          }}>
            ↗
          </span>
        )}
      </div>

      {/* Title — size and weight differ per module */}
      <div style={{
        fontSize: module.titleSize,
        fontWeight: module.titleWeight,
        color: isActive
          ? (hovered ? "#07111C" : "#111827")
          : "#9AABBA",
        letterSpacing: module.titleTracking,
        lineHeight: 1.1,
        marginBottom: 9,
        transform: hovered && isActive ? "translateX(2px)" : "translateX(0)",
        transition: "color 0.15s, transform 0.2s",
      }}>
        {module.title}
      </div>

      {/* Description — size and color differ per module */}
      <div style={{
        fontSize: module.descSize,
        color: module.descColor,
        lineHeight: 1.62,
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
        <div
          className="ce-home-header-inner"
          style={{
            maxWidth: 860,
            margin: "0 auto",
            width: "100%",
            display: "flex",
            alignItems: "center",
            paddingTop: 26,
            paddingBottom: 18,
            gap: 11,
          }}
        >
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
        <div
          className="ce-home-content"
          style={{
            maxWidth: 860,
            margin: "0 auto",
            width: "100%",
          }}
        >

          {/* Hero */}
          <div style={{ marginBottom: 46 }}>
            <h1 style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(24px, 5.5vw, 36px)",
              color: "#111827",
              margin: "0 0 9px",
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

          {/* Module list — entries with individual visual weight */}
          <div style={{ borderTop: "1px solid rgba(17,24,39,0.09)" }}>
            {MODULES.map((mod, i) => (
              <ModuleEntry
                key={mod.key}
                module={mod}
                isLast={i === MODULES.length - 1}
                onNavigate={onNavigate}
              />
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
                { label: "Privacy", path: "/privacy" },
                { label: "Support", path: "/support" },
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
