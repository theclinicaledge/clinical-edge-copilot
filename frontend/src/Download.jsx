import { useState } from "react";
import { trackEvent } from "./analytics";
import { useSeo } from "./seo/useSeo.js";
import { STATIC_ROUTE_SEO } from "./seo/routeSeo.js";
import AppStoreBadge from "./components/AppStoreBadge.jsx";

// ── Android UA detection (display-only, no redirect) ────────────────────────
function useIsAndroid() {
  const [isAndroid] = useState(() => /android/i.test(navigator.userAgent));
  return isAndroid;
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
    title: "Shift Brain",
    description:
      "Open Shift Brain to organize structured fictional scenario information.",
    cta: "Open Shift Brain",
    path: "/copilot",
  },
  {
    key: "rhythmlab",
    tag: "ECG Interpretation",
    title: "Rhythm Lab",
    description:
      "Practice a structured approach to rhythm recognition.",
    cta: "Open Rhythm Lab",
    path: "/rhythm-lab",
  },
  {
    key: "icudrips",
    tag: "Infusion Reference",
    title: "ICU Drips",
    description:
      "Review critical-care infusion concepts and monitoring context. Educational reference, not a dosing guide.",
    cta: "Open ICU Drips",
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
      "Browse educational references for hemodynamics, labs, ventilation, and devices. No dosing. No diagnosis.",
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
            Use Clinical Edge on your iPhone.
          </h1>

          <p style={{
            fontSize: "clamp(14.5px, 3.2vw, 16.5px)",
            color: "var(--ce-text-muted)",
            lineHeight: 1.65,
            margin: "0 0 28px",
            maxWidth: 480,
          }}>
            Access nursing reference and practice tools, with education
            and reasoning support.
          </p>

          <div className="dl-hero-ctas" style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 14,
          }}>
            <AppStoreBadge placement="download" height={54} />

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
              Nursing education and practice on your iPhone.
            </h2>
            <p style={{
              fontSize: 14,
              color: "var(--ce-text-muted)",
              lineHeight: 1.65,
              margin: "0 0 22px",
              maxWidth: 420,
            }}>
              Use fictional practice scenarios and educational references
              to explore nursing concepts.
            </p>

            <AppStoreBadge placement="download" />

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
            "Optional device-local saved cases",
            "Do not enter patient identifiers",
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
            policy, or emergency care. Use fictional practice scenarios and
            general nursing education only. See Privacy for data processing
            and optional device-local saved cases.
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
        <AppStoreBadge placement="footer" height={40} />
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
            href="/terms"
            className="dl-footer-link"
            style={{
              fontSize: 11,
              color: "var(--ce-text-muted)",
              textDecoration: "none",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            Terms
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
