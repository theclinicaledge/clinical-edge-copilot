import { useState, useEffect } from "react";
import { trackEvent } from "./analytics";
import { useSeo } from "./seo/useSeo.js";
import { STATIC_ROUTE_SEO } from "./seo/routeSeo.js";

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
      style={{ height: 48, width: "auto", display: "block" }}
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
      fill="var(--ce-teal)"
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

// ── Live product catalog ──────────────────────────────────────────────────────
// Routes and titles mirror ClinicalEdgeHome.jsx's MODULES array — the single
// source of truth for which modules are live. Keep both lists in sync.
const PRODUCT_OPEN_EVENTS = {
  copilot: "copilot_module_opened",
  rhythmlab: "rhythm_lab_module_opened",
  icudrips: "icu_drips_module_opened",
  abglab: "abg_lab_opened",
  referencehub: "reference_hub_opened",
};

const PRODUCTS = [
  {
    key: "copilot",
    tag: "Clinical Reasoning",
    title: "Clinical Edge Copilot",
    description:
      "Think through clinical situations, bedside questions, and SBAR communication with structured reasoning support.",
    cta: "Open Copilot",
    path: "/copilot",
  },
  {
    key: "rhythmlab",
    tag: "ECG Interpretation",
    title: "Rhythm Lab",
    description:
      "Build ECG interpretation skills through a structured, repeatable rhythm-reading process.",
    cta: "Open Rhythm Lab",
    path: "/rhythm-lab",
  },
  {
    key: "icudrips",
    tag: "Infusion Reference",
    title: "ICU Drip Lab",
    description:
      "Strengthen understanding of critical-care drips, hemodynamics, and bedside titration concepts.",
    cta: "Open ICU Drip Lab",
    path: "/icu-drips",
  },
  {
    key: "abglab",
    tag: "Acid-Base · Oxygenation",
    title: "ABG Lab",
    description:
      "Practice a clear step-by-step framework for arterial blood gas interpretation.",
    cta: "Open ABG Lab",
    path: "/abg-lab",
  },
  {
    key: "referencehub",
    tag: "Bedside Reference",
    title: "Reference Hub",
    description:
      "Fast bedside answers for hemodynamics, labs, ventilation, and devices — no dosing, no diagnosis.",
    cta: "Open Reference Hub",
    path: "/reference-hub",
  },
];

function ProductCard({ product, onNavigate }) {
  return (
    <a
      href={product.path}
      className="dl-product-card ce-pressable ce-card-lift"
      onClick={(e) => {
        e.preventDefault();
        trackEvent(PRODUCT_OPEN_EVENTS[product.key] ?? "module_opened", {
          route: "/download",
        });
        onNavigate(product.path);
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "20px 18px",
        background: "var(--ce-warm-mid)",
        border: "1px solid var(--ce-warm-line)",
        borderRadius: "var(--ce-r-md)",
        textDecoration: "none",
        minHeight: 44,
      }}
    >
      <div style={{
        fontSize: 9.5,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "1.5px",
        color: "var(--ce-teal-deep)",
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      }}>
        {product.tag}
      </div>
      <div style={{
        fontSize: "clamp(17px, 3.6vw, 19px)",
        fontWeight: 700,
        color: "var(--ce-text-dark)",
        letterSpacing: "-0.02em",
        lineHeight: 1.2,
      }}>
        {product.title}
      </div>
      <p style={{
        fontSize: 13.5,
        color: "var(--ce-text-muted)",
        lineHeight: 1.6,
        margin: "0 0 4px",
        flex: 1,
      }}>
        {product.description}
      </p>
      <span style={{
        fontSize: 12.5,
        fontWeight: 600,
        color: "var(--ce-teal-deep)",
        letterSpacing: "-0.01em",
      }}>
        {product.cta} →
      </span>
    </a>
  );
}

// ── Download / product hub page ──────────────────────────────────────────────
export default function Download({ onNavigate }) {
  useSeo(STATIC_ROUTE_SEO["/download"]);
  const isAndroid = useIsAndroid();

  const goTo = (path) => {
    if (onNavigate) onNavigate(path);
    else window.location.href = path;
  };

  const handleAppStoreClick = (placement) =>
    trackEvent("app_store_click", { page: "download", destination: "app_store", placement });

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--ce-navy-900)",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflowX: "hidden",
    }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        a { outline: none; -webkit-tap-highlight-color: transparent; }
        .dl-badge-link { display: inline-block; border-radius: var(--ce-r-md); transition: opacity var(--ce-dur-fast) var(--ce-ease-out); }
        .dl-badge-link:hover { opacity: 0.88; }
        .dl-badge-link:active { opacity: 0.72; }
        .dl-badge-link:focus-visible { outline: 2px solid var(--ce-teal); outline-offset: 2px; }
        .dl-footer-link, .dl-header-link {
          transition: color var(--ce-dur-fast) var(--ce-ease-out);
          text-decoration-color: transparent;
          text-underline-offset: 3px;
        }
        .dl-footer-link:hover { color: var(--ce-teal-deep); text-decoration: underline; text-decoration-color: var(--ce-teal-deep); }
        .dl-footer-link:focus-visible, .dl-header-link:focus-visible { outline: 2px solid var(--ce-teal); outline-offset: 2px; }
        .dl-btn-primary { transition: background var(--ce-dur-fast) var(--ce-ease-out); }
        .dl-btn-primary:hover { background: var(--ce-teal-deep) !important; }
        .dl-btn-primary:focus-visible { outline: 2px solid var(--ce-teal); outline-offset: 2px; }
        .dl-product-card { transition: border-color var(--ce-dur-fast) var(--ce-ease-out); }
        .dl-product-card:hover { border-color: rgba(10,191,188,0.35); }
        .dl-product-card:focus-visible { outline: 2px solid var(--ce-teal); outline-offset: 2px; }
        .dl-product-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        @media (min-width: 640px) {
          .dl-product-grid { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
        }
        @media (min-width: 960px) {
          .dl-hero-ctas { flex-direction: row !important; }
        }
      `}</style>

      {/* ── Header — flat navy, compact, "Clinical Edge" as the primary brand ── */}
      <div style={{
        background: "var(--ce-navy-900)",
        borderBottom: "1px solid var(--ce-line-dark)",
        paddingTop: "env(safe-area-inset-top)",
        paddingLeft: "max(0px, env(safe-area-inset-left))",
        paddingRight: "max(0px, env(safe-area-inset-right))",
      }}>
        <div style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
        }}>
          <a
            href="/"
            className="dl-header-link"
            onClick={(e) => { e.preventDefault(); goTo("/"); }}
            style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
          >
            <CELogo size={24} />
            <span style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--ce-text-light)",
              letterSpacing: "-0.3px",
              lineHeight: 1.15,
            }}>
              Clinical Edge
            </span>
          </a>
        </div>
      </div>

      {/* ── Warm content area ────────────────────────────────────────────── */}
      <main style={{ background: "var(--ce-warm-bg)" }}>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "48px 20px 40px",
        }}>
          <div style={{
            fontSize: "var(--ce-fs-eyebrow)",
            fontWeight: 700,
            letterSpacing: "var(--ce-track-eyebrow)",
            textTransform: "uppercase",
            color: "var(--ce-teal-deep)",
            fontFamily: "'IBM Plex Mono', monospace",
            marginBottom: 14,
          }}>
            Clinical Edge
          </div>

          <h1 style={{
            fontSize: "clamp(28px, 7vw, 42px)",
            fontWeight: 800,
            color: "var(--ce-text-dark)",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            margin: "0 0 14px",
            maxWidth: 560,
          }}>
            Clinical tools built for real nursing workflows.
          </h1>

          <p style={{
            fontSize: "clamp(14.5px, 3.2vw, 16.5px)",
            color: "var(--ce-text-muted)",
            lineHeight: 1.65,
            margin: "0 0 28px",
            maxWidth: 480,
          }}>
            Learn rhythms, strengthen critical-care knowledge, and work
            through clinical questions with practical tools built for nurses.
          </p>

          <div className="dl-hero-ctas" style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 14,
          }}>
            <a
              href="#dl-products"
              className="dl-btn-primary"
              onClick={(e) => {
                e.preventDefault();
                trackEvent("download_hero_explore_clicked", { page: "download" });
                document.getElementById("dl-products")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--ce-teal)",
                color: "var(--ce-text-dark)",
                fontWeight: 700,
                fontSize: 15,
                padding: "13px 26px",
                borderRadius: "var(--ce-r-md)",
                letterSpacing: "-0.2px",
                textDecoration: "none",
                minHeight: 44,
              }}
            >
              Explore Clinical Edge
            </a>

            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noreferrer"
              className="dl-badge-link"
              onClick={() => handleAppStoreClick("hero")}
            >
              <AppStoreBadge />
            </a>
          </div>
        </section>

        {/* ── Product hub ───────────────────────────────────────────────── */}
        <section id="dl-products" style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "8px 20px 44px",
          scrollMarginTop: 60,
        }}>
          <h2 style={{
            fontSize: "clamp(19px, 4vw, 23px)",
            fontWeight: 700,
            color: "var(--ce-text-dark)",
            letterSpacing: "-0.02em",
            margin: "0 0 16px",
          }}>
            Explore the tools
          </h2>

          <div className="dl-product-grid">
            {PRODUCTS.map((product) => (
              <ProductCard key={product.key} product={product} onNavigate={goTo} />
            ))}
          </div>
        </section>

        {/* ── Mobile app section ───────────────────────────────────────── */}
        <section style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "8px 20px 44px",
        }}>
          <div style={{
            border: "1px solid var(--ce-warm-line)",
            borderRadius: "var(--ce-r-md)",
            padding: "28px 22px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}>
            <h2 style={{
              fontSize: "clamp(18px, 3.8vw, 21px)",
              fontWeight: 700,
              color: "var(--ce-text-dark)",
              letterSpacing: "-0.02em",
              margin: "0 0 10px",
            }}>
              Take Clinical Edge Copilot with you.
            </h2>
            <p style={{
              fontSize: 14,
              color: "var(--ce-text-muted)",
              lineHeight: 1.65,
              margin: "0 0 22px",
              maxWidth: 420,
            }}>
              Access structured clinical reasoning support from your iPhone
              whenever you need a quick educational reference.
            </p>

            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noreferrer"
              className="dl-badge-link"
              onClick={() => handleAppStoreClick("mobile_section")}
            >
              <AppStoreBadge />
            </a>

            {isAndroid && (
              <p style={{
                fontSize: 11.5,
                color: "var(--ce-text-muted)",
                margin: "14px 0 0",
                fontFamily: "'IBM Plex Mono', monospace",
                letterSpacing: "0.01em",
              }}>
                Android version coming later.
              </p>
            )}
          </div>
        </section>

        {/* ── Trust strip ──────────────────────────────────────────────── */}
        <section style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "0 20px 36px",
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
          justifyContent: "center",
        }}>
          {[
            "Built by an RN",
            "No patient data stored",
            "App Store reviewed",
            "Educational support only",
          ].map((item) => (
            <span key={item} style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              color: "var(--ce-text-muted)",
              fontWeight: 500,
              letterSpacing: "0.01em",
            }}>
              <span style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "var(--ce-teal-deep)",
                display: "inline-block",
                flexShrink: 0,
              }} />
              {item}
            </span>
          ))}
        </section>

        {/* ── Safety disclaimer ─────────────────────────────────────────── */}
        <section style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "0 20px 40px",
        }}>
          <p style={{
            fontSize: 11.5,
            color: "var(--ce-text-muted)",
            lineHeight: 1.7,
            margin: 0,
            letterSpacing: "0.005em",
            borderTop: "1px solid rgba(0,0,0,0.08)",
            paddingTop: 20,
          }}>
            Clinical Edge is for educational support only and is not a
            substitute for clinical judgment, provider guidance, institutional
            policy, or emergency care.
          </p>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{
        background: "var(--ce-warm-bg)",
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
            color: "var(--ce-text-muted)",
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: "0.02em",
          }}>
            Clinical Edge · theclinicaledge.org
          </span>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <a
            href="/privacy"
            className="dl-footer-link"
            style={{
              fontSize: 11,
              color: "var(--ce-text-muted)",
              textDecoration: "none",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            Privacy
          </a>
          <a
            href="/support"
            className="dl-footer-link"
            style={{
              fontSize: 11,
              color: "var(--ce-text-muted)",
              textDecoration: "none",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            Support
          </a>
        </div>
      </footer>

    </div>
  );
}
