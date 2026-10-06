import { useState, useEffect, useRef } from "react";
import { trackEvent } from "./analytics";

// ─── CE Logo ──────────────────────────────────────────────────────────────────
function CELogo({ size = 26 }) {
  return (
    <svg
      width={size}
      height={size}
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

// ─── Scroll-triggered fade-in ─────────────────────────────────────────────────
function useFadeIn(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Fade({ children, style, delay = 0, up = 22 }) {
  const [ref, visible] = useFadeIn();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${up}px)`,
        transition: `opacity 0.75s ease ${delay}ms, transform 0.75s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Mono label (eyebrow) ─────────────────────────────────────────────────────
function Label({ children }) {
  return (
    <div style={{
      fontFamily: "var(--ce-font-mono, 'IBM Plex Mono', monospace)",
      fontSize: "var(--ce-fs-eyebrow)",
      fontWeight: 700,
      color: "var(--ce-teal)",
      letterSpacing: "var(--ce-track-eyebrow)",
      textTransform: "uppercase",
      marginBottom: 22,
    }}>
      {children}
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ children, maxWidth = 540 }) {
  return (
    <h2 style={{
      fontSize: "clamp(28px, 4vw, 46px)",
      fontWeight: 800,
      color: "var(--ce-text-light)",
      letterSpacing: "-1.5px",
      lineHeight: 1.08,
      margin: 0,
      maxWidth,
    }}>
      {children}
    </h2>
  );
}

// ─── Mock section card (mirrors App.jsx's SectionCard/SECTION_CONFIG so the
//     marketing preview shows the product's actual colors) ────────────────────
function MockCard({ label, accent, children }) {
  return (
    <div style={{
      background: "var(--ce-warm-card)",
      border: "1px solid var(--ce-warm-line)",
      borderLeft: `3px solid ${accent}`,
      borderRadius: "var(--ce-r-md)",
      padding: "14px 18px",
    }}>
      <div style={{
        fontFamily: "var(--ce-font-mono, 'IBM Plex Mono', monospace)",
        fontSize: 9,
        fontWeight: 700,
        color: accent,
        textTransform: "uppercase",
        letterSpacing: "0.9px",
        marginBottom: 8,
        opacity: 0.88,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: "var(--ce-navy-700)", lineHeight: 1.65 }}>
        {children}
      </div>
    </div>
  );
}

// ─── Checkmark icon ───────────────────────────────────────────────────────────
function Check() {
  return (
    <div style={{
      width: 22,
      height: 22,
      borderRadius: "50%",
      background: "rgba(10,191,188,0.1)",
      border: "1px solid rgba(10,191,188,0.22)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      marginTop: 2,
    }}>
      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
        <path d="M1 3.5L3.5 6L8 1" stroke="var(--ce-teal)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

// ─── Main Landing Component ───────────────────────────────────────────────────
export default function Landing({ onEnterApp, onEnterScenario }) {
  const [scrolled, setScrolled] = useState(false);
  const demoRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToDemo = () => {
    demoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // §4.2 Primary button: fill --ce-teal, text --ce-text-dark, radius --ce-r-md, no shadow.
  const btnPrimary = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--ce-teal)",
    color: "var(--ce-text-dark)",
    fontWeight: 700,
    fontSize: 15,
    padding: "13px 30px",
    borderRadius: "var(--ce-r-md)",
    border: "none",
    letterSpacing: "-0.2px",
    cursor: "pointer",
    transition: "background var(--ce-dur-fast) var(--ce-ease-out)",
    boxShadow: "none",
    fontFamily: "var(--ce-font-sans)",
  };

  // §4.2 Secondary button: transparent, 1px border, text-light-body.
  const btnGhost = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    color: "var(--ce-text-light-body)",
    fontWeight: 600,
    fontSize: 15,
    padding: "13px 30px",
    borderRadius: "var(--ce-r-md)",
    border: "1px solid var(--ce-line-navy)",
    letterSpacing: "-0.2px",
    cursor: "pointer",
    transition: "border-color var(--ce-dur-fast) var(--ce-ease-out), color var(--ce-dur-fast) var(--ce-ease-out)",
    fontFamily: "var(--ce-font-sans)",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--ce-navy-900)",
      color: "var(--ce-text-light-body)",
      fontFamily: "var(--ce-font-sans)",
      overflowX: "hidden",
    }}>
      {/* ── Global styles ────────────────────────────────────────────────────── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }

        @keyframes lFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .l-h1-anim { animation: lFadeUp 0.9s ease 0.05s both; }
        .l-h2-anim { animation: lFadeUp 0.9s ease 0.2s  both; }
        .l-h3-anim { animation: lFadeUp 0.9s ease 0.35s both; }
        .l-h4-anim { animation: lFadeUp 0.9s ease 0.5s  both; }
        .l-h5-anim { animation: lFadeUp 0.9s ease 0.65s both; }
        .l-card-anim { animation: lFadeUp 0.9s ease 0.75s both; }

        .l-btn-primary:hover {
          background: var(--ce-teal-deep) !important;
        }

        .l-btn-ghost:hover {
          border-color: rgba(10,191,188,0.30) !important;
          color: var(--ce-text-light) !important;
        }

        .l-nav-link:hover { color: var(--ce-text-light) !important; }

        .l-flow { display: flex; align-items: flex-start; gap: 0; width: 100%; }
        .l-flow-arrow { flex-shrink: 0; align-self: center; color: var(--ce-text-dim); font-size: 20px; padding: 0 6px; margin-bottom: 8px; line-height: 1; }
        .l-flow-step { flex: 1; min-width: 0; }

        @media (max-width: 640px) {
          .l-hero-btns { flex-direction: column !important; }
          .l-hero-btns button { width: 100% !important; }
          .l-flow { flex-direction: column !important; gap: 0 !important; }
          .l-flow-arrow { transform: rotate(90deg); align-self: flex-start; margin-left: 22px; padding: 4px 0; margin-bottom: 0; }
        }
        @media (max-width: 480px) {
          .l-hero-h1 {
            font-size: clamp(28px, 8.5vw, 38px) !important;
            letter-spacing: -1px !important;
            line-height: 1.12 !important;
          }
          .l-hero-h1 .l-hero-accent { white-space: normal !important; }
          .l-hero-wrap { padding-left: 1rem !important; padding-right: 1rem !important; }
        }
      `}</style>

      {/* ══ NAV ══════════════════════════════════════════════════════════════════ */}
      <nav style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 100,
        paddingTop: "env(safe-area-inset-top)",
        background: scrolled ? "var(--ce-navy-header)" : "rgba(11,24,32,0)",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid var(--ce-line-dark)" : "1px solid transparent",
        transition: "background var(--ce-dur-base) var(--ce-ease-out), border-color var(--ce-dur-base) var(--ce-ease-out)",
      }}>
        {/* Inner row — 62px visual height, safe area handled by outer nav */}
        <div style={{
          height: 62,
          display: "flex",
          alignItems: "center",
          padding: "0 clamp(20px, 5vw, 64px)",
        }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CELogo size={25} />
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--ce-text-light)",
              letterSpacing: "-0.2px",
              lineHeight: 1.15,
            }}>
              Clinical Edge
            </span>
            <span style={{
              fontSize: 9,
              fontWeight: 500,
              color: "var(--ce-text-dim)",
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              fontFamily: "var(--ce-font-mono)",
              lineHeight: 1,
            }}>
              Copilot
            </span>
          </div>
        </div>

        {/* Right side */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 24 }}>
          <button
            onClick={scrollToDemo}
            className="l-nav-link"
            style={{
              background: "none",
              border: "none",
              fontSize: 13,
              color: "var(--ce-text-dim)",
              fontWeight: 500,
              cursor: "pointer",
              transition: "color var(--ce-dur-fast) var(--ce-ease-out)",
              padding: 0,
              display: "none",
            }}
          >
            See Demo
          </button>
          <button
            onClick={() => { trackEvent('landing_secondary_cta_clicked', { destination: 'copilot', placement: 'nav' }); onEnterApp(); }}
            className="l-btn-primary"
            style={{ ...btnPrimary, fontSize: 13, padding: "9px 20px", borderRadius: 8 }}
          >
            Open workspace
          </button>
        </div>
        </div>{/* end inner nav row */}
      </nav>

      {/* ══ HERO — left-aligned editorial (§8.6 / banned pattern §15) ══════════════ */}
      <section style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "calc(120px + env(safe-area-inset-top)) clamp(20px, 6vw, 80px) 80px",
        position: "relative",
      }}>
        <div className="l-hero-wrap" style={{ maxWidth: 720, width: "100%" }}>
          {/* Eyebrow — static dot, no pulse */}
          <div className="l-h1-anim" style={{ display: "flex", marginBottom: 28 }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              background: "rgba(10,191,188,0.10)",
              border: "1px solid rgba(10,191,188,0.22)",
              borderRadius: "var(--ce-r-pill)",
              padding: "7px 16px",
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--ce-teal)",
                display: "inline-block",
              }} />
              <span style={{
                fontFamily: "var(--ce-font-mono)",
                fontSize: "var(--ce-fs-eyebrow)",
                fontWeight: 700,
                color: "var(--ce-teal)",
                letterSpacing: "var(--ce-track-eyebrow)",
                textTransform: "uppercase",
              }}>
                For nurses transitioning into ICU practice
              </span>
            </div>
          </div>

          {/* Headline — Display scale, accent on one phrase */}
          <h1 className="l-h2-anim l-hero-h1" style={{
            fontSize: "clamp(38px, 6vw, 64px)",
            fontWeight: 800,
            color: "var(--ce-text-light)",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            margin: "0 0 24px",
          }}>
            Understand the why{" "}
            <span className="l-hero-accent" style={{ color: "var(--ce-teal)" }}>behind critical-care nursing.</span>
          </h1>

          {/* Lead paragraph */}
          <p className="l-h3-anim" style={{
            fontSize: "var(--ce-fs-lead)",
            fontWeight: 400,
            color: "var(--ce-text-light-body)",
            lineHeight: 1.72,
            margin: "0 0 40px",
            maxWidth: 560,
          }}>
            Work through fictional practice scenarios in a nursing-focused learning workspace. Explore reported findings, uncertainty, and the reasoning questions you want to understand.
          </p>

          {/* CTAs */}
          <div
            className="l-h4-anim l-hero-btns"
            style={{
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <button onClick={() => { trackEvent('landing_primary_cta_clicked', { destination: 'scenario', placement: 'hero' }); onEnterScenario(); }} className="l-btn-primary" style={{ ...btnPrimary, fontSize: 15, padding: "14px 34px" }}>
              Try a fictional practice scenario →
            </button>
            <button onClick={scrollToDemo} className="l-btn-ghost" style={{ ...btnGhost, fontSize: 15, padding: "14px 34px" }}>
              View a learning outline
            </button>
          </div>
        </div>

        {/* Hero mock card — §4.3 dark hero card, static */}
        <div className="l-card-anim" style={{ marginTop: 64, maxWidth: 620, width: "100%" }}>
          <div style={{
            background: "var(--ce-navy-700)",
            border: "1px solid var(--ce-line-navy)",
            borderRadius: "var(--ce-r-lg)",
            overflow: "hidden",
            boxShadow: "var(--ce-shadow-hero)",
          }}>
            {/* Card chrome — eyebrow + hairline, no traffic lights */}
            <div style={{
              padding: "13px 20px",
              borderBottom: "1px solid var(--ce-line-dark)",
            }}>
              <span style={{
                fontFamily: "var(--ce-font-mono)",
                fontSize: "var(--ce-fs-eyebrow)",
                fontWeight: 700,
                color: "var(--ce-text-dim)",
                letterSpacing: "var(--ce-track-eyebrow)",
                textTransform: "uppercase",
              }}>
                Learning outline — not generated output
              </span>
            </div>

            <div style={{ padding: "24px 26px", textAlign: "left" }}>
              {/* Scenario input preview */}
              <div style={{
                fontSize: 12,
                color: "var(--ce-text-light-sec)",
                fontStyle: "italic",
                marginBottom: 20,
                padding: "11px 14px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--ce-line-dark)",
                borderRadius: "var(--ce-r-md)",
                lineHeight: 1.6,
              }}>
                A fictional scenario includes earlier and current findings.
              </div>

              {/* Urgency badge row — real urgency tokens */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <span style={{
                  fontFamily: "var(--ce-font-mono)",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--ce-urgency-high-dark)",
                  background: "var(--ce-urgency-high-bg)",
                  border: "1px solid var(--ce-urgency-high-line)",
                  padding: "4px 11px",
                  borderRadius: "var(--ce-r-sm)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                  Fictional practice
                </span>
                <span style={{ fontSize: 10, color: "var(--ce-text-dim)", fontFamily: "var(--ce-font-mono)" }}>·</span>
                <span style={{ fontSize: 10, color: "var(--ce-text-dim)", fontFamily: "var(--ce-font-mono)" }}>Study prompts</span>
              </div>

              {/* Section cards — real SECTION_CONFIG colors (teal + gold only) */}
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                <MockCard label="Learning focus" accent="var(--ce-teal-deep)" bg="transparent">
                  Review which findings the fictional scenario explicitly reports.
                </MockCard>
                <MockCard label="Questions to explore" accent="var(--ce-gold-deep)" bg="rgba(212,168,75,0.06)">
                  Separate the information supplied from questions that still need clarification.
                </MockCard>
                <MockCard label="What remains unknown" accent="var(--ce-teal-deep)" bg="transparent">
                  Missing information can remain unknown. Discuss the reasoning with a preceptor.
                </MockCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ WHAT YOU CAN ASK ════════════════════════════════════════════════════ */}
      <section style={{
        padding: "84px clamp(20px, 6vw, 80px)",
        maxWidth: 1100,
        margin: "0 auto",
      }}>
        <Fade>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <Label>Nursing education and practice</Label>
            <h2 style={{
              fontSize: "clamp(26px, 3.8vw, 44px)",
              fontWeight: 800,
              color: "var(--ce-text-light)",
              letterSpacing: "-1.5px",
              lineHeight: 1.1,
              margin: "0 auto 18px",
              maxWidth: 620,
            }}>
              Explore a fictional scenario, one question at a time.
            </h2>
            <p style={{
              fontSize: "clamp(14px, 1.6vw, 17px)",
              color: "var(--ce-text-light-body)",
              lineHeight: 1.65,
              maxWidth: 560,
              margin: "0 auto",
            }}>
              Use fictional scenarios and educational references to explore critical-care concepts. The outlines below are study prompts, not generated answers or evidence of clinical performance.
            </p>
          </div>
        </Fade>

        {/* Responsive 2×2 grid */}
        <style>{`
          .ask-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            align-items: start;
          }
          .ask-grid > * > div {
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          .ask-grid > * > div > div:last-child {
            margin-top: auto;
          }
          @media (max-width: 680px) {
            .ask-grid { grid-template-columns: 1fr; }
            .ask-grid > * > div { height: auto; }
          }
        `}</style>

        <div className="ask-grid">

          {/* ── Card 1: Clinical Reasoning ── */}
          <Fade delay={60}>
            <div style={{
              background: "var(--ce-navy-700)",
              border: `1px solid rgba(255,255,255,0.07)`,
              borderRadius: "var(--ce-r-lg)",
              overflow: "hidden",
            }}>
              {/* Card header */}
              <div style={{
                padding: "14px 20px",
                borderBottom: `1px solid var(--ce-line-dark)`,
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.02)",
              }}>
                <span style={{
                  fontFamily: "var(--ce-font-mono)",
                  fontSize: 9,
                  fontWeight: 700,
                  color: "var(--ce-teal)",
                  background: "rgba(10,191,188,0.10)",
                  border: "1px solid rgba(10,191,188,0.22)",
                  padding: "3px 9px",
                  borderRadius: "var(--ce-r-sm)",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}>
                  Clinical Reasoning
                </span>
              </div>

              <div style={{ padding: "20px 22px" }}>
                {/* Scenario input */}
                <div style={{
                  fontSize: 12,
                  color: "var(--ce-text-light-sec)",
                  fontStyle: "italic",
                  marginBottom: 16,
                  padding: "10px 13px",
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid var(--ce-line-dark)`,
                  borderRadius: 8,
                  lineHeight: 1.6,
                }}>
                  A fictional practice case reports a change over time.
                </div>

                {/* Urgency badge */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{
                    fontFamily: "var(--ce-font-mono)",
                    fontSize: 9,
                    fontWeight: 700,
                    color: "var(--ce-urgency-mod-dark)",
                    background: "var(--ce-urgency-mod-bg)",
                    border: "1px solid var(--ce-urgency-mod-line)",
                    padding: "3px 9px",
                    borderRadius: "var(--ce-r-sm)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}>Fictional practice</span>
                </div>

                {/* Output preview */}
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <MockCard label="Learning focus" accent="var(--ce-teal-deep)" bg="transparent">
                    Identify the earlier and current findings actually supplied in the fictional case.
                  </MockCard>
                  <MockCard label="Questions to explore" accent="var(--ce-gold-deep)" bg="rgba(212,168,75,0.06)">
                    Write down what changed and what you would want explained, without filling in missing facts.
                  </MockCard>
                </div>
              </div>

              <div style={{
                padding: "12px 22px",
                borderTop: `1px solid var(--ce-line-dark)`,
                fontSize: 11,
                color: "var(--ce-text-dim)",
              }}>
                Explore reported changes and the questions they raise in a fictional scenario.
              </div>
            </div>
          </Fade>

          {/* ── Card 2: Reference learning ── */}
          <Fade delay={120}>
            <div style={{
              background: "var(--ce-navy-700)",
              border: `1px solid rgba(255,255,255,0.07)`,
              borderRadius: "var(--ce-r-lg)",
              overflow: "hidden",
            }}>
              <div style={{
                padding: "14px 20px",
                borderBottom: `1px solid var(--ce-line-dark)`,
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.02)",
              }}>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 9,
                  fontWeight: 700,
                  color: "var(--ce-teal)",
                  background: "rgba(0,194,209,0.08)",
                  border: `1px solid rgba(0,194,209,0.2)`,
                  padding: "3px 9px",
                  borderRadius: "var(--ce-r-sm)",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}>
                  Reference learning
                </span>
              </div>

              <div style={{ padding: "20px 22px" }}>
                <div style={{
                  fontSize: 12,
                  color: "var(--ce-text-light-sec)",
                  fontStyle: "italic",
                  marginBottom: 16,
                  padding: "10px 13px",
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid var(--ce-line-dark)`,
                  borderRadius: 8,
                  lineHeight: 1.6,
                }}>
                  Choose an unfamiliar nursing concept to review in an educational reference.
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{
                    fontFamily: "var(--ce-font-mono)",
                    fontSize: 9,
                    fontWeight: 700,
                    color: "var(--ce-urgency-low-dark)",
                    background: "var(--ce-urgency-low-bg)",
                    border: "1px solid var(--ce-urgency-low-line)",
                    padding: "3px 9px",
                    borderRadius: "var(--ce-r-sm)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}>Fictional practice</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <MockCard label="Learning question" accent="var(--ce-teal-deep)" bg="transparent">
                    What is the concept, and which part do you want to understand?
                  </MockCard>
                  <MockCard label="Further learning" accent="var(--ce-gold-deep)" bg="rgba(212,168,75,0.06)">
                    Use your training, educational references, and preceptor discussions to explore the explanation.
                  </MockCard>
                </div>
              </div>

              <div style={{
                padding: "12px 22px",
                borderTop: `1px solid var(--ce-line-dark)`,
                fontSize: 11,
                color: "var(--ce-text-dim)",
              }}>
                Browse educational references for nursing concepts.
              </div>
            </div>
          </Fade>

          {/* ── Card 3: NCLEX ── */}
          <Fade delay={180}>
            <div style={{
              background: "var(--ce-navy-700)",
              border: `1px solid rgba(255,255,255,0.07)`,
              borderRadius: "var(--ce-r-lg)",
              overflow: "hidden",
            }}>
              <div style={{
                padding: "14px 20px",
                borderBottom: `1px solid var(--ce-line-dark)`,
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.02)",
              }}>
                <span style={{
                  fontFamily: "var(--ce-font-mono)",
                  fontSize: 9,
                  fontWeight: 700,
                  color: "var(--ce-teal)",
                  background: "rgba(10,191,188,0.10)",
                  border: "1px solid rgba(10,191,188,0.22)",
                  padding: "3px 9px",
                  borderRadius: "var(--ce-r-sm)",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}>
                  Reasoning practice
                </span>
              </div>

              <div style={{ padding: "20px 22px" }}>
                <div style={{
                  fontSize: 12,
                  color: "var(--ce-text-light-sec)",
                  fontStyle: "italic",
                  marginBottom: 16,
                  padding: "10px 13px",
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid var(--ce-line-dark)`,
                  borderRadius: 8,
                  lineHeight: 1.6,
                }}>
                  Use a fictional practice case to explore a reasoning question.
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{
                    fontFamily: "var(--ce-font-mono)",
                    fontSize: 9,
                    fontWeight: 700,
                    color: "var(--ce-urgency-low-dark)",
                    background: "var(--ce-urgency-low-bg)",
                    border: "1px solid var(--ce-urgency-low-line)",
                    padding: "3px 9px",
                    borderRadius: "var(--ce-r-sm)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}>Fictional practice</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <MockCard label="Study prompt" accent="var(--ce-teal-deep)" bg="transparent">
                    Which observations are given, and which parts are interpretation?
                  </MockCard>
                  <MockCard label="Discussion prompt" accent="var(--ce-teal-deep)" bg="transparent">
                    What would you ask a preceptor to explain about this fictional scenario?
                  </MockCard>
                </div>
              </div>

              <div style={{
                padding: "12px 22px",
                borderTop: `1px solid var(--ce-line-dark)`,
                fontSize: 11,
                color: "var(--ce-text-dim)",
              }}>
                Practice working through clinical patterns and reasoning.
              </div>
            </div>
          </Fade>

          {/* ── Card 4: Escalation / What I'd Do Right Now ── */}
          <Fade delay={240}>
            <div style={{
              background: "var(--ce-navy-700)",
              border: `1px solid rgba(255,255,255,0.07)`,
              borderRadius: "var(--ce-r-lg)",
              overflow: "hidden",
            }}>
              <div style={{
                padding: "14px 20px",
                borderBottom: `1px solid var(--ce-line-dark)`,
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.02)",
              }}>
                <span style={{
                  fontFamily: "var(--ce-font-mono)",
                  fontSize: 9,
                  fontWeight: 700,
                  color: "var(--ce-teal)",
                  background: "rgba(10,191,188,0.10)",
                  border: "1px solid rgba(10,191,188,0.22)",
                  padding: "3px 9px",
                  borderRadius: "var(--ce-r-sm)",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}>
                  Uncertainty and learning
                </span>
              </div>

              <div style={{ padding: "20px 22px" }}>
                <div style={{
                  fontSize: 12,
                  color: "var(--ce-text-light-sec)",
                  fontStyle: "italic",
                  marginBottom: 16,
                  padding: "10px 13px",
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid var(--ce-line-dark)`,
                  borderRadius: 8,
                  lineHeight: 1.6,
                }}>
                  A fictional practice case leaves some information unknown.
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{
                    fontFamily: "var(--ce-font-mono)",
                    fontSize: 9,
                    fontWeight: 700,
                    color: "var(--ce-urgency-high-dark)",
                    background: "var(--ce-urgency-high-bg)",
                    border: "1px solid var(--ce-urgency-high-line)",
                    padding: "3px 9px",
                    borderRadius: "var(--ce-r-sm)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}>Fictional practice</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <MockCard label="Questions to explore" accent="var(--ce-gold-deep)" bg="rgba(212,168,75,0.06)">
                    Which details are reported, and which are not available?
                  </MockCard>
                  <MockCard label="Learning questions" accent="var(--ce-teal-deep)" bg="transparent">
                    Identify uncertainties and learning questions to discuss with a preceptor.
                  </MockCard>
                </div>
              </div>

              <div style={{
                padding: "12px 22px",
                borderTop: `1px solid var(--ce-line-dark)`,
                fontSize: 11,
                color: "var(--ce-text-dim)",
              }}>
                Organize a practice scenario and identify what remains uncertain.
              </div>
            </div>
          </Fade>

        </div>
      </section>

      {/* ══ SAFETY / GUARDRAILS ══════════════════════════════════════════════════ */}
      <section style={{
        padding: "84px clamp(20px, 6vw, 80px)",
        maxWidth: 880,
        margin: "0 auto",
      }}>
        <Fade>
          <div style={{
            background: "rgba(10,191,188,0.04)",
            border: "1px solid rgba(10,191,188,0.22)",
            borderLeft: "4px solid var(--ce-teal)",
            borderRadius: "var(--ce-r-lg)",
            padding: "52px clamp(28px, 5vw, 64px)",
          }}>
            <div>
              <Label>Educational boundaries</Label>
              <h2 style={{
                fontSize: "clamp(22px, 3vw, 36px)",
                fontWeight: 800,
                color: "var(--ce-text-light)",
                letterSpacing: "-1px",
                lineHeight: 1.15,
                margin: "0 0 32px",
                maxWidth: 520,
              }}>
                Educational boundaries and limitations.
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {[
                  "Does not diagnose or replace clinical judgment",
                  "Not a source of medication orders or dosing instructions",
                  "Use fictional practice scenarios and general nursing education only",
                  "AI can be wrong. Verify information and follow your clinical training and local policy.",
                ].map((point) => (
                  <div key={point} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <Check />
                    <span style={{ fontSize: 15, color: "var(--ce-text-light-body)", lineHeight: 1.65 }}>
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Fade>
      </section>

      {/* ══ HOW IT'S BUILT (the one surviving 3-card grid — §5.8) ═════════════════ */}
      <section style={{
        padding: "84px clamp(20px, 6vw, 80px)",
        maxWidth: 960,
        margin: "0 auto",
      }}>
        <Fade style={{ textAlign: "center", marginBottom: 52 }}>
          <Label>How It's Built</Label>
          <SectionHeading maxWidth={560} style={{ margin: "0 auto 20px" }}>
            A workspace for nursing education and reasoning practice.
          </SectionHeading>
          <p style={{
            fontSize: "clamp(15px, 1.8vw, 17px)",
            fontWeight: 400,
            color: "var(--ce-text-light-body)",
            lineHeight: 1.72,
            margin: "20px auto 0",
            maxWidth: 520,
          }}>
            Use structured scenario entry and focused references to work through learning questions.
          </p>
        </Fade>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(268px, 1fr))",
          gap: 16,
        }}>
          {[
            {
              title: "Nursing-focused practice",
              body: "Structured fictional scenarios provide a starting point for learning questions.",
            },
            {
              title: "Review reported findings",
              body: "Review the information reported in a practice scenario.",
            },
            {
              title: "Explore relationships",
              body: "Use educational references to explore physiology and questions raised by a fictional example.",
            },
          ].map((card, i) => (
            <Fade key={card.title} delay={i * 80}>
              <div style={{
                background: "var(--ce-navy-700)",
                border: "1px solid var(--ce-line-navy)",
                borderLeft: "3px solid var(--ce-teal)",
                borderRadius: "var(--ce-r-md)",
                padding: "32px 28px",
                boxShadow: "var(--ce-shadow-card)",
                height: "100%",
                boxSizing: "border-box",
              }}>
                <div style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--ce-text-light)",
                  letterSpacing: "-0.3px",
                  lineHeight: 1.35,
                  marginBottom: 12,
                }}>
                  {card.title}
                </div>
                <div style={{ fontSize: 14, color: "var(--ce-text-light-body)", lineHeight: 1.72 }}>
                  {card.body}
                </div>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* ══ HOW IT THINKS ════════════════════════════════════════════════════════ */}
      <section style={{
        padding: "84px clamp(20px, 6vw, 80px)",
        maxWidth: 960,
        margin: "0 auto",
      }}>
        <Fade style={{ marginBottom: 52 }}>
          <Label>Practice workflow</Label>
          <SectionHeading maxWidth={480}>
            How to work through a practice scenario
          </SectionHeading>
          <p style={{
            fontSize: "clamp(15px, 1.8vw, 17px)",
            fontWeight: 400,
            color: "var(--ce-text-light-body)",
            lineHeight: 1.72,
            margin: "16px 0 0",
            maxWidth: 460,
          }}>
            Use the fictional details to explore observations, uncertainty, and reasoning.
          </p>
        </Fade>

        <Fade delay={80}>
          <div className="l-flow">
            {[
              { step: "01", label: "Review reported findings",  body: "Start with information explicitly supplied" },
              { step: "02", label: "Explore priorities",       body: "Discuss priorities and their supporting reasoning" },
              { step: "03", label: "Clarify the unknowns",      body: "Review questions that could clarify a fictional scenario" },
              { step: "04", label: "Identify learning questions", body: "Identify uncertainties to discuss with a preceptor" },
            ].map((item, i) => (
              <>
                {i > 0 && (
                  <div key={`arrow-${i}`} className="l-flow-arrow">›</div>
                )}
                <div key={item.step} className="l-flow-step" style={{
                  background: "var(--ce-navy-700)",
                  borderRadius: "var(--ce-r-md)",
                  padding: "24px 22px",
                  border: "1px solid var(--ce-line-navy)",
                  borderLeft: "3px solid var(--ce-teal)",
                }}>
                  <div style={{
                    fontFamily: "var(--ce-font-mono)",
                    fontSize: 9,
                    fontWeight: 700,
                    color: "var(--ce-teal)",
                    letterSpacing: "0.8px",
                    textTransform: "uppercase",
                    marginBottom: 12,
                    opacity: 0.8,
                  }}>
                    {item.step}
                  </div>
                  <div style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--ce-text-light)",
                    letterSpacing: "-0.3px",
                    lineHeight: 1.3,
                    marginBottom: 8,
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: "var(--ce-text-light-body)",
                    lineHeight: 1.65,
                  }}>
                    {item.body}
                  </div>
                </div>
              </>
            ))}
          </div>
        </Fade>
      </section>

      {/* ══ REAL SHIFT MOMENTS — editorial list, not a card grid (§5.8) ═══════════ */}
      <section style={{
        padding: "84px clamp(20px, 6vw, 80px)",
        maxWidth: 760,
        margin: "0 auto",
      }}>
        <Fade style={{ marginBottom: 44 }}>
          <Label>Questions after learning something new</Label>
          <SectionHeading maxWidth={480}>
            A place to work through learning questions.
          </SectionHeading>
          <p style={{
            fontSize: "clamp(15px, 1.8vw, 17px)",
            fontWeight: 400,
            color: "var(--ce-text-light-body)",
            lineHeight: 1.72,
            margin: "20px 0 0",
            maxWidth: 480,
          }}>
            Use a fictional example to explore observations, uncertainty, and reasoning.
          </p>
        </Fade>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {[
            {
              n: "01",
              title: "What changed in the fictional case?",
              body: "Compare only the earlier and current information supplied.",
            },
            {
              n: "02",
              title: "What remains unknown?",
              body: "Separate reported information from assumptions.",
            },
            {
              n: "03",
              title: "What would you like to understand?",
              body: "Write down a physiology or reasoning question to explore with a preceptor.",
            },
          ].map((item, i) => (
            <Fade key={item.n} delay={i * 60}>
              <div style={{
                display: "flex",
                gap: 20,
                padding: "24px 0",
                borderTop: i === 0 ? "none" : "1px solid var(--ce-line-dark)",
              }}>
                <div style={{
                  fontFamily: "var(--ce-font-mono)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--ce-teal)",
                  letterSpacing: "0.3px",
                  flexShrink: 0,
                  paddingTop: 2,
                }}>
                  {item.n}
                </div>
                <div>
                  <div style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--ce-text-light)",
                    letterSpacing: "-0.3px",
                    lineHeight: 1.35,
                    marginBottom: 8,
                  }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 14, color: "var(--ce-text-light-body)", lineHeight: 1.72 }}>
                    {item.body}
                  </div>
                </div>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* ══ BUILT FOR BEDSIDE NURSING — numbered hairline grid (Problem-section recipe) ══ */}
      <section style={{
        padding: "84px clamp(20px, 6vw, 80px)",
        maxWidth: 960,
        margin: "0 auto",
      }}>
        <Fade style={{ textAlign: "center", marginBottom: 52 }}>
          <Label>Developing critical-care reasoning</Label>
          <SectionHeading maxWidth={540} style={{ margin: "0 auto" }}>
            For nurses transitioning into ICU practice.
          </SectionHeading>
          <p style={{
            fontSize: "clamp(15px, 1.8vw, 17px)",
            fontWeight: 400,
            color: "var(--ce-text-light-body)",
            lineHeight: 1.72,
            margin: "20px auto 0",
            maxWidth: 520,
          }}>
            For practicing nurses developing critical-care reasoning, especially during their first two years in ICU.
          </p>
        </Fade>

        <div style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(268px, 1fr))",
          gap: 0,
          background: "var(--ce-line-dark)",
          borderRadius: "var(--ce-r-lg)",
          overflow: "hidden",
          border: "1px solid var(--ce-line-dark)",
        }}>
          {[
            {
              n: "01",
              title: "Transitioning from Med-Surg or telemetry",
              body: "Explore unfamiliar critical-care concepts through education and practice.",
            },
            {
              n: "02",
              title: "Moving from PCU into ICU",
              body: "Work through fictional scenarios and discuss the reasoning with a preceptor.",
            },
            {
              n: "03",
              title: "Developing critical-care understanding",
              body: "Use nursing references and practice scenarios to explore the why.",
            },
          ].map((item, i) => (
            <Fade key={item.n} delay={i * 60} style={{ background: "var(--ce-navy-900)", padding: "40px 34px" }}>
              <div style={{
                fontFamily: "var(--ce-font-mono)",
                fontSize: 11,
                color: "var(--ce-teal)",
                opacity: 0.55,
                letterSpacing: "0.3px",
                marginBottom: 16,
              }}>
                {item.n}
              </div>
              <div style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--ce-text-light)",
                letterSpacing: "-0.3px",
                lineHeight: 1.35,
                marginBottom: 12,
              }}>
                {item.title}
              </div>
              <div style={{ fontSize: 14, color: "var(--ce-text-light-body)", lineHeight: 1.72 }}>
                {item.body}
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* ══ PROBLEM ══════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: "84px clamp(20px, 6vw, 80px)",
        maxWidth: 960,
        margin: "0 auto",
      }}>
        <Fade>
          <Label>Learning during the transition</Label>
          <SectionHeading maxWidth={520}>
            The transition into critical care brings new questions.
          </SectionHeading>
        </Fade>

        {/* 2×2 grid with hairline dividers */}
        <div style={{
          marginTop: 48,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 0,
          background: "var(--ce-line-dark)",
          borderRadius: "var(--ce-r-lg)",
          overflow: "hidden",
          border: "1px solid var(--ce-line-dark)",
        }}>
          {[
            {
              n: "01",
              title: "Several questions at once",
              body: "Complex scenarios can raise several learning questions at once.",
            },
            {
              n: "02",
              title: "Practice and support",
              body: "Developing critical-care reasoning takes practice and support.",
            },
            {
              n: "03",
              title: "Unfamiliar physiology and workflows",
              body: "Moving into ICU can mean learning unfamiliar physiology, devices, and workflows.",
            },
            {
              n: "04",
              title: "Questions at any experience level",
              body: "Unfamiliar concepts can prompt questions at any experience level.",
            },
          ].map((item, i) => (
            <Fade key={item.n} delay={i * 60} style={{ background: "var(--ce-navy-900)", padding: "44px 40px" }}>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                color: "var(--ce-teal)",
                opacity: 0.45,
                letterSpacing: "0.3px",
                marginBottom: 18,
              }}>
                {item.n}
              </div>
              <div style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--ce-text-light)",
                letterSpacing: "-0.3px",
                lineHeight: 1.35,
                marginBottom: 12,
              }}>
                {item.title}
              </div>
              <div style={{ fontSize: 14, color: "var(--ce-text-light-body)", lineHeight: 1.72 }}>
                {item.body}
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* ══ PRODUCT DEMO ═════════════════════════════════════════════════════════ */}
      <section ref={demoRef} style={{
        padding: "84px clamp(20px, 6vw, 80px)",
        maxWidth: 880,
        margin: "0 auto",
        scrollMarginTop: 80,
      }}>
        <Fade style={{ textAlign: "center", marginBottom: 48 }}>
          <Label>Learning outline</Label>
          <SectionHeading maxWidth={480} style={{ margin: "0 auto 20px" }}>
            A fictional practice workflow.
          </SectionHeading>
          <p style={{
            fontSize: "clamp(14px, 1.6vw, 16px)",
            fontWeight: 500,
            color: "var(--ce-teal)",
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: "0.2px",
            margin: "16px auto 0",
            maxWidth: 480,
          }}>
            Illustrative study prompts, not generated output.
          </p>
        </Fade>

        <Fade delay={80}>
          <div style={{
            background: "var(--ce-navy-700)",
            border: "1px solid var(--ce-line-navy)",
            borderRadius: "var(--ce-r-lg)",
            overflow: "hidden",
            boxShadow: "var(--ce-shadow-hero)",
          }}>
            {/* Card chrome — eyebrow + hairline, no traffic lights */}
            <div style={{
              padding: "14px 22px",
              borderBottom: "1px solid var(--ce-line-dark)",
            }}>
              <span style={{
                fontFamily: "var(--ce-font-mono)",
                fontSize: "var(--ce-fs-eyebrow)",
                fontWeight: 700,
                color: "var(--ce-text-dim)",
                letterSpacing: "var(--ce-track-eyebrow)",
                textTransform: "uppercase",
              }}>
                Learning outline — not generated output
              </span>
            </div>

            <div style={{ padding: "32px 36px" }}>
              {/* Input label */}
              <div style={{
                fontFamily: "var(--ce-font-mono)",
                fontSize: 10,
                fontWeight: 500,
                color: "var(--ce-text-dim)",
                textTransform: "uppercase",
                letterSpacing: "1.2px",
                marginBottom: 12,
              }}>
                Fictional practice outline
              </div>

              {/* Scenario text */}
              <div style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(10,191,188,0.18)",
                borderRadius: "var(--ce-r-md)",
                padding: "16px 18px",
                fontSize: 14,
                color: "var(--ce-text-light-body)",
                lineHeight: 1.68,
                marginBottom: 28,
                fontStyle: "italic",
              }}>
                Start with a fictional scenario supplied for learning. Use only the details given; leave unknown information unknown.
              </div>

              {/* Urgency badge row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
                <span style={{
                  fontFamily: "var(--ce-font-mono)",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--ce-urgency-mod-dark)",
                  background: "var(--ce-urgency-mod-bg)",
                  border: "1px solid var(--ce-urgency-mod-line)",
                  padding: "5px 12px",
                  borderRadius: "var(--ce-r-sm)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                  Fictional practice
                </span>
                <span style={{ fontSize: 11, color: "var(--ce-text-dim)", fontFamily: "var(--ce-font-mono)" }}>·</span>
                <span style={{ fontSize: 11, color: "var(--ce-text-dim)", fontFamily: "var(--ce-font-mono)" }}>Study prompts</span>
              </div>

              {/* Sections — real SECTION_CONFIG colors (teal + gold only) */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <MockCard label="Learning focus" accent="var(--ce-teal-deep)" bg="transparent">
                  Which observations are explicitly reported in the fictional scenario?
                </MockCard>
                <MockCard label="Questions to explore" accent="var(--ce-gold-deep)" bg="rgba(212,168,75,0.06)">
                  Which relationships would you want explained through physiology?
                </MockCard>
                <MockCard label="What remains unknown" accent="var(--ce-teal-deep)" bg="transparent">
                  What information is missing, and how does that limit interpretation?
                </MockCard>
                <MockCard label="Discussion questions" accent="var(--ce-gold-deep)" bg="rgba(212,168,75,0.06)">
                  Which reasoning questions would you discuss with a preceptor?
                </MockCard>
              </div>
            </div>
          </div>
        </Fade>
      </section>

      {/* ══ TRUST / SAFETY ═══════════════════════════════════════════════════════ */}
      <section style={{
        padding: "84px clamp(20px, 6vw, 80px)",
        maxWidth: 880,
        margin: "0 auto",
      }}>
        <Fade>
          <div style={{
            background: "var(--ce-navy-700)",
            border: "1px solid rgba(10,191,188,0.22)",
            borderRadius: "var(--ce-r-lg)",
            padding: "64px clamp(28px, 5vw, 72px)",
          }}>
            <div>
              <Label>Structured for nursing education and reasoning practice</Label>

              <h2 style={{
                fontSize: "clamp(24px, 3.5vw, 40px)",
                fontWeight: 800,
                color: "var(--ce-text-light)",
                letterSpacing: "-1.2px",
                lineHeight: 1.12,
                margin: "0 0 28px",
                maxWidth: 500,
              }}>
                Supporting how you think.
                <br />
                <span style={{ color: "var(--ce-teal)" }}>Not replacing your judgment.</span>
              </h2>

              <p style={{
                fontSize: 16,
                color: "var(--ce-text-light-body)",
                lineHeight: 1.75,
                margin: "0 0 40px",
                maxWidth: 540,
              }}>
                Use fictional practice scenarios and educational references alongside your training and preceptor discussions.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 44 }}>
                {[
                  "Not a diagnosis tool",
                  "Not a replacement for your judgment",
                  "AI can be wrong",
                ].map((point) => (
                  <div key={point} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <Check />
                    <span style={{ fontSize: 15, color: "var(--ce-text-light-body)", lineHeight: 1.65 }}>
                      {point}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{
                paddingTop: 28,
                borderTop: "1px solid var(--ce-line-dark)",
                fontSize: 15,
                fontWeight: 600,
                color: "var(--ce-text-light-body)",
                lineHeight: 1.65,
                maxWidth: 560,
              }}>
                A nursing-focused learning workspace. Follow institutional policy, provider orders, and your clinical judgment.
              </div>
            </div>
          </div>
        </Fade>
      </section>

      {/* ══ FINAL CTA ════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: "84px clamp(20px, 6vw, 80px)",
        maxWidth: 720,
        margin: "0 auto",
        textAlign: "center",
      }}>
        <Fade>
          <Label>Start with fictional practice</Label>
          <h2 style={{
            fontSize: "clamp(28px, 4vw, 46px)",
            fontWeight: 800,
            color: "var(--ce-text-light)",
            letterSpacing: "-1.5px",
            lineHeight: 1.1,
            margin: "0 auto 22px",
            maxWidth: 560,
          }}>
            Start with a fictional practice scenario.
          </h2>
          <p style={{
            fontSize: "clamp(15px, 1.8vw, 17px)",
            color: "var(--ce-text-light-body)",
            lineHeight: 1.72,
            margin: "0 auto 48px",
            maxWidth: 440,
          }}>
            Use fictional practice scenarios and general nursing education only. Do not enter real patient information.
          </p>
          <div style={{
            display: "flex",
            gap: 14,
            justifyContent: "center",
            flexWrap: "wrap",
          }}>
            <button
              onClick={() => { trackEvent('landing_primary_cta_clicked', { destination: 'scenario', placement: 'closing' }); onEnterScenario(); }}
              className="l-btn-primary"
              style={{ ...btnPrimary, fontSize: 15, padding: "14px 34px" }}
            >
              Try a fictional practice scenario
            </button>
            <button
              onClick={() => { trackEvent('landing_secondary_cta_clicked', { destination: 'copilot', placement: 'closing' }); onEnterApp(); }}
              className="l-btn-ghost"
              style={{ ...btnGhost, fontSize: 15, padding: "14px 34px" }}
            >
              Open workspace
            </button>
          </div>
        </Fade>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════════════════════ */}
      <footer style={{
        borderTop: `1px solid var(--ce-line-dark)`,
        padding: "38px clamp(20px, 6vw, 80px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
        textAlign: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CELogo size={18} />
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--ce-text-dim)",
            letterSpacing: "-0.1px",
          }}>
            The Clinical Edge
          </span>
        </div>

        <p style={{
          fontSize: 11,
          color: "var(--ce-text-dim)",
          lineHeight: 1.65,
          maxWidth: 520,
          margin: 0,
          fontFamily: "'IBM Plex Mono', monospace",
        }}>
          Clinical Edge is for nursing education and reasoning practice. It does not replace institutional protocols, provider orders, preceptors, or clinical judgment.
        </p>

        <p style={{
          fontSize: 11,
          color: "var(--ce-text-dim)",
          margin: 0,
          fontFamily: "'IBM Plex Mono', monospace",
        }}>
          © {new Date().getFullYear()} The Clinical Edge. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
