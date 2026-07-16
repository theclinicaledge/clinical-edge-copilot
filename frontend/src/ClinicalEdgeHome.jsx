import { trackEvent } from "./analytics";
import { useSeo } from "./seo/useSeo.js";
import { STATIC_ROUTE_SEO } from "./seo/routeSeo.js";

// Maps module.key → explicit analytics event name.
// Explicit names are easier to filter in Vercel Analytics than payload fields.
const MODULE_OPEN_EVENTS = {
  copilot:      'copilot_module_opened',
  rhythmlab:    'rhythm_lab_module_opened',
  icudrips:     'icu_drips_module_opened',
  referencehub: 'reference_hub_opened',
  abglab:       'abg_lab_opened',
};

// ─── CE Logo ──────────────────────────────────────────────────────────────────
function CELogo() {
  return (
    <svg
      width="30"
      height="30"
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

// ─── Module definitions ───────────────────────────────────────────────────────
// All three modules are active — identical visual weight.
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
      "Clinical context, monitoring essentials, and bedside awareness for common critical care infusions.",
    status: "active",
    path: "/icu-drips",
  },
  {
    key: "referencehub",
    tag: "Bedside Reference",
    title: "Reference Hub",
    description:
      "Fast bedside answers for hemodynamics, labs, ABGs, ventilation, and devices. No dosing. No diagnosis.",
    status: "active",
    path: "/reference-hub",
  },
  {
    key: "abglab",
    tag: "Acid-Base · Oxygenation",
    title: "ABG & Oxygenation Lab",
    description:
      "Interpret acid-base patterns and oxygenation clues. Deterministic, offline-capable, educational.",
    status: "active",
    path: "/abg-lab",
  },
];

// Shared visual tokens for active modules (applied identically to Copilot + Rhythm Lab)
const ACTIVE_STYLE = {
  titleSize:    "clamp(19px, 3.8vw, 23px)",
  titleWeight:  700,
  titleTracking: "-0.03em",
  paddingTop:   28,
  paddingBottom: 22,
  descSize:     13.5,
  descColor:    "var(--ce-text-muted)",
  tagColor:     "var(--ce-teal)",
  tagOpacity:   1,
};

// Muted tokens for coming-soon module
const SOON_STYLE = {
  titleSize:    "clamp(15px, 2.8vw, 17px)",
  titleWeight:  500,
  titleTracking: "-0.018em",
  paddingTop:   18,
  paddingBottom: 14,
  descSize:     12.5,
  descColor:    "var(--ce-text-dim)",
  tagColor:     "var(--ce-text-dim)",
  tagOpacity:   0.65,
};

// ─── Module Entry ─────────────────────────────────────────────────────────────
// Active entries: identical size, weight, spacing, luminance-card treatment.
// Soon entry: reduced contrast, no hover, no cursor, no card surface.
function ModuleEntry({ module, onNavigate }) {
  const isActive = module.status === "active";
  const s = isActive ? ACTIVE_STYLE : SOON_STYLE;

  return (
    <div
      className={isActive ? "ce-pressable ce-card-lift" : undefined}
      onClick={isActive ? () => { trackEvent(MODULE_OPEN_EVENTS[module.key] ?? 'module_opened', { route: '/' }); onNavigate(module.path); } : undefined}
      style={{
        paddingTop: s.paddingTop,
        paddingBottom: s.paddingBottom,
        paddingLeft: "var(--ce-sp-5)",
        paddingRight: "var(--ce-sp-5)",
        cursor: isActive ? "pointer" : "default",
        background: isActive ? "var(--ce-warm-mid)" : "transparent",
        borderRadius: isActive ? "var(--ce-r-md)" : 0,
        borderTop: isActive ? "1px solid var(--ce-warm-card)" : "none",
      }}
    >
      {/* Tag */}
      <div style={{
        fontSize: 9.5,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "1.5px",
        color: s.tagColor,
        opacity: s.tagOpacity,
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        marginBottom: 8,
        display: "flex",
        alignItems: "center",
        gap: 7,
      }}>
        {module.tag}
        {!isActive && (
          <span style={{ fontWeight: 400, letterSpacing: "0.8px", opacity: 0.7 }}>
            · soon
          </span>
        )}
      </div>

      {/* Title */}
      <div style={{
        fontSize: s.titleSize,
        fontWeight: s.titleWeight,
        color: isActive ? "var(--ce-text-dark)" : "var(--ce-text-dim)",
        letterSpacing: s.titleTracking,
        lineHeight: 1.12,
        marginBottom: 8,
      }}>
        {module.title}
      </div>

      {/* Description */}
      <div style={{
        fontSize: s.descSize,
        color: s.descColor,
        lineHeight: 1.62,
        maxWidth: 540,
      }}>
        {module.description}
      </div>
    </div>
  );
}

// ─── Clinical Edge Home Hub ───────────────────────────────────────────────────
export default function ClinicalEdgeHome({ onNavigate }) {
  useSeo(STATIC_ROUTE_SEO["/"]);
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--ce-navy-900)",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* ── Sticky header ────────────────────────────────────────────────── */}
      <div style={{
        borderBottom: "1px solid var(--ce-line-dark)",
        paddingTop: "env(safe-area-inset-top)",
        paddingLeft: "max(14px, env(safe-area-inset-left))",
        paddingRight: "max(14px, env(safe-area-inset-right))",
        paddingBottom: 0,
        background: "var(--ce-navy-header)",
        backdropFilter: "blur(20px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        flexShrink: 0,
      }}>
        <div
          className="ce-home-header-inner"
          style={{
            maxWidth: 750,
            margin: "0 auto",
            width: "100%",
            display: "flex",
            alignItems: "center",
            paddingTop: 22,
            paddingBottom: 16,
            gap: 11,
          }}
        >
          <CELogo />
          <span style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--ce-text-light)",
            letterSpacing: "-0.3px",
            lineHeight: 1.15,
          }}>
            Clinical Edge
          </span>
        </div>
      </div>

      {/* ── Warm surface ─────────────────────────────────────────────────── */}
      <main className="ce-page-enter" style={{ background: "var(--ce-warm-bg)", flex: 1 }}>
        <div
          className="ce-home-content"
          style={{ maxWidth: 750, margin: "0 auto", width: "100%" }}
        >

          {/* Hero */}
          <div style={{ marginBottom: "var(--ce-sp-8)" }}>
            <h1 style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(32px, 8vw, 58px)",
              color: "var(--ce-text-dark)",
              margin: "0 0 8px",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
            }}>
              Clinical tools for real-world nursing.
            </h1>
            <p style={{
              fontSize: "clamp(14px, 2.8vw, 15.5px)",
              color: "var(--ce-text-muted)",
              margin: 0,
              lineHeight: 1.55,
              fontWeight: 400,
              maxWidth: 480,
            }}>
              Think through clinical situations, practice rhythm recognition, and build bedside confidence.
            </p>
          </div>

          {/* Module list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--ce-sp-3)" }}>
            {MODULES.map((mod) => (
              <ModuleEntry
                key={mod.key}
                module={mod}
                onNavigate={onNavigate}
              />
            ))}
          </div>

          {/* Footer */}
          <footer style={{ marginTop: 32, fontFamily: "'IBM Plex Mono', monospace" }}>
            <p style={{
              fontSize: 11,
              color: "var(--ce-text-dim)",
              lineHeight: 1.65,
              margin: "0 0 10px",
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
                    color: "var(--ce-text-dim)",
                    textDecoration: "none",
                    letterSpacing: "0.02em",
                  }}
                >
                  {label}
                </a>
              ))}
            </div>
          </footer>

        </div>
      </main>
    </div>
  );
}
