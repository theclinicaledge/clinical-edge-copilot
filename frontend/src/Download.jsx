import { useState, useEffect } from "react";
import { trackEvent } from "./analytics";

// ── App Store destination ────────────────────────────────────────────────────
const APP_STORE_URL =
  "https://apps.apple.com/us/app/clinical-edge-copilot/id6761643064";

// ── Android UA detection (display-only, no redirect) ────────────────────────
function useIsAndroid() {
  const [isAndroid, setIsAndroid] = useState(false);
  useEffect(() => {
    setIsAndroid(/android/i.test(navigator.userAgent));
  }, []);
  return isAndroid;
}

// ── Official Apple App Store badge (inline SVG) ──────────────────────────────
// Apple mark paths scaled from Apple's canonical badge SVG (viewBox 0 0 120 40).
// Displayed at 1.4× for sharpness on high-density screens.
function AppStoreBadge() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 40"
      role="img"
      aria-label="Download on the App Store"
      style={{ height: 52, width: "auto", display: "block" }}
    >
      {/* Badge outline (subtle gray edge) */}
      <rect width="120" height="40" rx="7.5" fill="#a6a6a6" />
      {/* Badge body */}
      <rect x=".5" y=".5" width="119" height="39" rx="7" fill="#000" />

      {/* Apple mark — paths from Apple's canonical badge asset,
          scaled 0.567× and translated to center in the left zone */}
      <g transform="translate(8, 9) scale(0.567)">
        {/* Main apple body */}
        <path
          fill="#fff"
          d="M24.769 20.301c-.033-3.63 2.974-5.394 3.108-5.476
             -1.695-2.476-4.33-2.816-5.268-2.851
             -2.229-.228-4.37 1.325-5.501 1.325
             -1.149 0-2.9-1.299-4.775-1.261
             -2.432.037-4.694 1.433-5.943 3.614
             -2.55 4.418-.65 10.935 1.816 14.51
             1.22 1.754 2.659 3.718 4.554 3.647
             1.837-.074 2.526-1.177 4.743-1.177
             2.199 0 2.845 1.177 4.773 1.135
             1.974-.033 3.218-1.77 4.416-3.539
             1.409-2.023 1.981-4.001 2.008-4.103
             -.044-.016-3.897-1.489-3.931-5.824z"
        />
        {/* Leaf */}
        <path
          fill="#fff"
          d="M21.095 9.594c.988-1.237 1.663-2.934 1.478-4.65
             -1.431.062-3.228.988-4.258 2.199
             -.919 1.074-1.738 2.833-1.524 4.494
             1.613.118 3.26-.83 4.304-2.043z"
        />
      </g>

      {/* "Download on the" — small, regular weight */}
      <text
        x="31"
        y="17"
        fill="#fff"
        fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif"
        fontSize="8.5"
        fontWeight="400"
        letterSpacing="0.15"
      >
        Download on the
      </text>

      {/* "App Store" — larger, semibold */}
      <text
        x="31"
        y="31"
        fill="#fff"
        fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif"
        fontSize="17"
        fontWeight="600"
        letterSpacing="-0.3"
      >
        App Store
      </text>
    </svg>
  );
}

// ── Clinical Edge SVG logo ───────────────────────────────────────────────────
function CELogo({ size = 26 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 225 200"
      xmlns="http://www.w3.org/2000/svg"
      fill="#0ABFBC"
      aria-label="Clinical Edge"
      style={{ flexShrink: 0 }}
    >
      <path d="M 159.1,24.3 A 96,96 0 1,0 159.1,175.7 L 135.7,145.7 A 58,58 0 1,1 135.7,54.3 Z" />
      <path d="M 144.0,57 L 208,45 L 218,58 L 208,70 L 150.0,71 Z" />
      <path d="M 158.0,92 L 215,82 L 225,95 L 215,107 L 158.0,108 Z" />
      <path d="M 150.0,129 L 208,130 L 218,142 L 208,155 L 144.0,143 Z" />
    </svg>
  );
}

// ── App icon — rounded square hero mark ─────────────────────────────────────
function AppIcon() {
  return (
    <div style={{
      width: 80,
      height: 80,
      borderRadius: 18,
      background: "linear-gradient(145deg, #0B1E2D 0%, #0E2E40 100%)",
      border: "1px solid rgba(10,191,188,0.18)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}>
      {/* Inner logo increased from 44 → 54 to fill more of the tile */}
      <CELogo size={54} />
    </div>
  );
}

// ── Download page ────────────────────────────────────────────────────────────
export default function Download() {
  const isAndroid = useIsAndroid();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#111827",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        a { outline: none; -webkit-tap-highlight-color: transparent; }
        .dl-badge-link { display: inline-block; border-radius: 8px; transition: opacity 0.15s; }
        .dl-badge-link:hover { opacity: 0.88; }
        .dl-badge-link:active { opacity: 0.72; }
      `}</style>

      {/* ── Header — dark navy gradient, tightened height ─────────────── */}
      <div style={{
        background: "linear-gradient(90deg, #0E2436 0%, #103246 50%, #0E2436 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        paddingTop: "env(safe-area-inset-top)",
        paddingLeft: "max(0px, env(safe-area-inset-left))",
        paddingRight: "max(0px, env(safe-area-inset-right))",
      }}>
        <div style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "13px 20px 10px",
          display: "flex",
          alignItems: "center",
          gap: 11,
        }}>
          <CELogo size={24} />
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#F3F4F6",
              letterSpacing: "-0.3px",
              lineHeight: 1.15,
            }}>
              Clinical Edge
            </span>
            <span style={{
              fontSize: 9.5,
              fontWeight: 500,
              color: "#A8B3C3",
              letterSpacing: "0.7px",
              textTransform: "uppercase",
              fontFamily: "'IBM Plex Mono', monospace",
              lineHeight: 1,
            }}>
              Copilot
            </span>
          </div>
        </div>
      </div>

      {/* ── Warm content area ────────────────────────────────────────────── */}
      <div style={{
        background: "#E7E2D8",
        minHeight: "calc(100vh - 49px)",
        padding: "0 0 80px",
      }}>
        <div style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: "52px 20px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}>

          {/* App icon */}
          <AppIcon />

          {/* Copy block */}
          <div style={{ marginTop: 20, marginBottom: 36 }}>
            <div style={{
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: "1.4px",
              textTransform: "uppercase",
              color: "#7B8494",
              fontFamily: "'IBM Plex Mono', monospace",
              marginBottom: 12,
            }}>
              Clinical Edge Copilot
            </div>

            <h1 style={{
              fontSize: "clamp(23px, 5.5vw, 30px)",
              fontWeight: 700,
              color: "#162033",
              letterSpacing: "-0.04em",
              lineHeight: 1.2,
              margin: "0 0 14px",
            }}>
              Clinical reasoning support for nurses.
            </h1>

            <p style={{
              fontSize: "clamp(14px, 3.5vw, 15.5px)",
              color: "#5D687C",
              lineHeight: 1.68,
              margin: 0,
              fontWeight: 400,
            }}>
              Think through clinical situations, quick bedside questions, and
              SBAR communication with a tool built for real nursing workflows.
            </p>
          </div>

          {/* ── CTA area — calm, card-reduced ───────────────────────────── */}
          <div style={{
            border: "1px solid rgba(0,0,0,0.09)",
            borderRadius: 10,
            padding: "24px 20px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
          }}>

            {/* Official App Store badge */}
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noreferrer"
              className="dl-badge-link"
              onClick={() => trackEvent("app_store_click", { page: "download", destination: "app_store" })}
            >
              <AppStoreBadge />
            </a>

            {/* Android note — only shown when detected */}
            {isAndroid && (
              <p style={{
                fontSize: 11.5,
                color: "#7B8494",
                margin: 0,
                fontFamily: "'IBM Plex Mono', monospace",
                letterSpacing: "0.01em",
              }}>
                Android version coming later.
              </p>
            )}

            {/* Separator */}
            <div style={{
              width: "100%",
              height: 1,
              background: "rgba(0,0,0,0.08)",
            }} />

            {/* Safety disclaimer */}
            <p style={{
              fontSize: 11.5,
              color: "#7B8494",
              lineHeight: 1.65,
              margin: 0,
              letterSpacing: "0.005em",
            }}>
              For educational support only. Not a substitute for clinical
              judgment, provider guidance, or institutional protocol.
            </p>
          </div>

          {/* ── Trust strip ──────────────────────────────────────────────── */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginTop: 28,
            flexWrap: "wrap",
            justifyContent: "center",
          }}>
            {[
              "Built by an RN",
              "No patient data stored",
              "App Store reviewed",
            ].map((item) => (
              <span key={item} style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                color: "#7B8494",
                fontWeight: 500,
                letterSpacing: "0.01em",
              }}>
                <span style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#19C2D1",
                  display: "inline-block",
                  flexShrink: 0,
                }} />
                {item}
              </span>
            ))}
          </div>

        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div style={{
        background: "#E7E2D8",
        borderTop: "1px solid rgba(0,0,0,0.08)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CELogo size={13} />
          <span style={{
            fontSize: 11,
            color: "#7B8494",
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: "0.02em",
          }}>
            Clinical Edge Copilot · theclinicaledge.org
          </span>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <a
            href="/privacy"
            style={{
              fontSize: 11,
              color: "#7B8494",
              textDecoration: "none",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            Privacy
          </a>
          <a
            href="/support"
            style={{
              fontSize: 11,
              color: "#7B8494",
              textDecoration: "none",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            Support
          </a>
        </div>
      </div>

    </div>
  );
}
