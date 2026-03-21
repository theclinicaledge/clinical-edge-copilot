import { useState, useEffect, useRef } from "react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg:           "#0B1F2A",
  card:         "#112936",
  accent:       "#00C2D1",
  accentDim:    "rgba(0,194,209,0.1)",
  accentGlow:   "rgba(0,194,209,0.06)",
  textPrimary:  "#F8FBFC",
  textSecondary:"#A8C1CC",
  muted:        "#7F99A5",
  subtle:       "#3A5566",
  border:       "rgba(255,255,255,0.07)",
  borderAccent: "rgba(0,194,209,0.2)",
};

// ─── CE Logo ──────────────────────────────────────────────────────────────────
function CELogo({ size = 26 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 225 200"
      xmlns="http://www.w3.org/2000/svg"
      fill={C.accent}
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

// ─── Mono label ───────────────────────────────────────────────────────────────
function Label({ children }) {
  return (
    <div style={{
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 10,
      fontWeight: 500,
      color: C.accent,
      letterSpacing: "1.8px",
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
      color: C.textPrimary,
      letterSpacing: "-1.5px",
      lineHeight: 1.08,
      margin: 0,
      maxWidth,
    }}>
      {children}
    </h2>
  );
}

// ─── Mock section card (for demo panel) ──────────────────────────────────────
function MockCard({ label, accent, bg, border, children }) {
  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 10,
      padding: "14px 18px",
    }}>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 9,
        fontWeight: 700,
        color: accent,
        textTransform: "uppercase",
        letterSpacing: "0.9px",
        marginBottom: 8,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.65 }}>
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
      background: "rgba(0,194,209,0.1)",
      border: "1px solid rgba(0,194,209,0.28)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      marginTop: 2,
    }}>
      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
        <path d="M1 3.5L3.5 6L8 1" stroke="#00C2D1" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

// ─── Main Landing Component ───────────────────────────────────────────────────
export default function Landing({ onEnterApp }) {
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

  const btnPrimary = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: C.accent,
    color: "#0B1F2A",
    fontWeight: 700,
    fontSize: 15,
    padding: "13px 30px",
    borderRadius: 10,
    border: "none",
    letterSpacing: "-0.2px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 20px rgba(0,194,209,0.18)",
    fontFamily: "'Inter', sans-serif",
  };

  const btnGhost = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    color: C.muted,
    fontWeight: 600,
    fontSize: 15,
    padding: "13px 30px",
    borderRadius: 10,
    border: `1px solid ${C.border}`,
    letterSpacing: "-0.2px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "'Inter', sans-serif",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.textSecondary,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflowX: "hidden",
    }}>
      {/* ── Global styles ────────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }

        @keyframes lFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-7px); }
        }
        @keyframes lGlow {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 0.9; }
        }

        .l-h1-anim { animation: lFadeUp 0.9s ease 0.05s both; }
        .l-h2-anim { animation: lFadeUp 0.9s ease 0.2s  both; }
        .l-h3-anim { animation: lFadeUp 0.9s ease 0.35s both; }
        .l-h4-anim { animation: lFadeUp 0.9s ease 0.5s  both; }
        .l-h5-anim { animation: lFadeUp 0.9s ease 0.65s both; }
        .l-card-anim { animation: lFadeUp 0.9s ease 0.75s both; }

        .l-card-float { animation: lFloat 5s ease-in-out infinite; }

        .l-btn-primary:hover {
          background: #19D3E0 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 8px 30px rgba(0,194,209,0.3) !important;
        }
        .l-btn-primary:active { transform: translateY(0) !important; }

        .l-btn-ghost:hover {
          border-color: rgba(0,194,209,0.35) !important;
          color: #A8C1CC !important;
          background: rgba(0,194,209,0.04) !important;
        }

        .l-step:hover {
          border-color: rgba(0,194,209,0.22) !important;
          background: rgba(17,41,54,0.95) !important;
        }
        .l-diff:hover {
          border-color: rgba(0,194,209,0.18) !important;
          background: rgba(17,41,54,0.7) !important;
        }
        .l-nav-link:hover { color: #F8FBFC !important; }

        @media (max-width: 640px) {
          .l-hero-btns { flex-direction: column !important; }
          .l-hero-btns button { width: 100% !important; }
        }
      `}</style>

      {/* ══ NAV ══════════════════════════════════════════════════════════════════ */}
      <nav style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 100,
        height: 62,
        display: "flex",
        alignItems: "center",
        padding: "0 clamp(20px, 5vw, 64px)",
        background: scrolled ? "rgba(11,31,42,0.97)" : "rgba(11,31,42,0)",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
        transition: "all 0.3s ease",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CELogo size={25} />
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{
              fontSize: 14,
              fontWeight: 700,
              color: C.textPrimary,
              letterSpacing: "-0.2px",
              lineHeight: 1.15,
            }}>
              Clinical Edge
            </span>
            <span style={{
              fontSize: 9,
              fontWeight: 500,
              color: C.muted,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              fontFamily: "'IBM Plex Mono', monospace",
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
              color: C.muted,
              fontWeight: 500,
              cursor: "pointer",
              transition: "color 0.2s ease",
              padding: 0,
              display: "none",
            }}
          >
            See Demo
          </button>
          <button
            onClick={onEnterApp}
            className="l-btn-primary"
            style={{ ...btnPrimary, fontSize: 13, padding: "9px 20px", borderRadius: 8 }}
          >
            Open App
          </button>
        </div>
      </nav>

      {/* ══ HERO ═════════════════════════════════════════════════════════════════ */}
      <section style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px clamp(20px, 6vw, 80px) 80px",
        position: "relative",
        textAlign: "center",
        overflow: "hidden",
      }}>
        {/* Ambient glow */}
        <div style={{
          position: "absolute",
          top: "35%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700,
          height: 500,
          background: "radial-gradient(ellipse, rgba(0,194,209,0.07) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 800, position: "relative" }}>
          {/* Eyebrow */}
          <div className="l-h1-anim" style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              background: C.accentDim,
              border: `1px solid ${C.borderAccent}`,
              borderRadius: 100,
              padding: "7px 16px",
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: C.accent,
                display: "inline-block",
                animation: "lGlow 2.5s ease-in-out infinite",
              }} />
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                fontWeight: 500,
                color: C.accent,
                letterSpacing: "0.5px",
              }}>
                Clinical Reasoning Support for Nurses
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="l-h2-anim" style={{
            fontSize: "clamp(38px, 6.5vw, 70px)",
            fontWeight: 800,
            color: C.textPrimary,
            lineHeight: 1.06,
            letterSpacing: "-2.5px",
            margin: "0 0 28px",
          }}>
            Less second-guessing.
            <br />
            <span style={{ color: C.accent, whiteSpace: "nowrap" }}>More clinical confidence.</span>
          </h1>

          {/* Subhead */}
          <p className="l-h3-anim" style={{
            fontSize: "clamp(16px, 2vw, 19px)",
            fontWeight: 400,
            color: C.textSecondary,
            lineHeight: 1.72,
            margin: "0 auto 50px",
            maxWidth: 560,
          }}>
            When something doesn't add up, you don't need more information — you need better thinking. Clinical Edge Copilot helps you connect the dots in real time.
          </p>

          {/* CTAs */}
          <div
            className="l-h4-anim l-hero-btns"
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button onClick={onEnterApp} className="l-btn-primary" style={{ ...btnPrimary, fontSize: 15, padding: "14px 34px", borderRadius: 11 }}>
              Try a Patient Scenario
            </button>
            <button onClick={scrollToDemo} className="l-btn-ghost" style={{ ...btnGhost, fontSize: 15, padding: "14px 34px", borderRadius: 11 }}>
              See How It Thinks
            </button>
          </div>
        </div>

        {/* Hero mock card */}
        <div className="l-card-anim" style={{ marginTop: 80, maxWidth: 620, width: "100%", position: "relative" }}>
          {/* Under-card glow */}
          <div style={{
            position: "absolute",
            bottom: -24,
            left: "50%",
            transform: "translateX(-50%)",
            width: "75%",
            height: 60,
            background: "radial-gradient(ellipse, rgba(0,194,209,0.18) 0%, transparent 70%)",
            filter: "blur(18px)",
            pointerEvents: "none",
          }} />

          <div
            className="l-card-float"
            style={{
              background: C.card,
              border: `1px solid rgba(255,255,255,0.09)`,
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            {/* Card chrome */}
            <div style={{
              padding: "13px 20px",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: "rgba(255,255,255,0.02)",
            }}>
              {["rgba(255,95,87,0.8)", "rgba(255,189,46,0.8)", "rgba(39,201,63,0.8)"].map((c, i) => (
                <div key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />
              ))}
              <span style={{
                marginLeft: 10,
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                color: C.subtle,
              }}>
                Clinical Edge Copilot
              </span>
            </div>

            <div style={{ padding: "24px 26px", textAlign: "left" }}>
              {/* Scenario input preview */}
              <div style={{
                fontSize: 12,
                color: "#2E4A5C",
                fontStyle: "italic",
                marginBottom: 20,
                padding: "11px 14px",
                background: "rgba(255,255,255,0.02)",
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                lineHeight: 1.6,
              }}>
                "BP dropped to 88/50, HR 122, was stable 20 min ago..."
              </div>

              {/* Urgency badge row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#fca5a5",
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  padding: "4px 11px",
                  borderRadius: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                  Urgency: HIGH
                </span>
                <span style={{ fontSize: 10, color: C.subtle, fontFamily: "'IBM Plex Mono', monospace" }}>·</span>
                <span style={{ fontSize: 10, color: C.subtle, fontFamily: "'IBM Plex Mono', monospace" }}>Clinical Reasoning</span>
              </div>

              {/* Section cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                <MockCard label="Most Likely Issue" accent="#e05572" bg="rgba(224,85,114,0.06)" border="rgba(224,85,114,0.18)">
                  Acute hemodynamic compromise — cardiogenic or distributive shock
                </MockCard>
                <MockCard label="Clinical Pattern Recognition" accent="#4da3ff" bg="rgba(77,163,255,0.06)" border="rgba(77,163,255,0.18)">
                  Hypotension + tachycardia + acute onset = shock physiology. Assess JVD, lung sounds, skin perfusion, cap refill.
                </MockCard>
                <MockCard label="Immediate Nursing Assessments" accent="#1FBF75" bg="rgba(31,191,117,0.06)" border="rgba(31,191,117,0.18)">
                  Full reassessment, IV access ×2, 12-lead ECG, fluid responsiveness, notify provider now
                </MockCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PROBLEM ══════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: "84px clamp(20px, 6vw, 80px)",
        maxWidth: 960,
        margin: "0 auto",
      }}>
        <Fade>
          <Label>The Reality of Bedside Nursing</Label>
          <SectionHeading maxWidth={520}>
            Nursing school didn't teach you how to think like this.
          </SectionHeading>
        </Fade>

        {/* 2×2 grid with hairline dividers */}
        <div style={{
          marginTop: 48,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 0,
          background: C.border,
          borderRadius: 18,
          overflow: "hidden",
          border: `1px solid ${C.border}`,
        }}>
          {[
            {
              n: "01",
              title: "Early signals get lost in the noise",
              body: "A subtle HR trend, a mildly worsening lactate, a patient who seems 'off' — these patterns are easy to miss when you're managing five patients at once.",
            },
            {
              n: "02",
              title: "Pattern recognition takes years",
              body: "Senior nurses recognize deterioration earlier because they've seen it hundreds of times. That clinical intuition isn't easy to teach — or learn quickly.",
            },
            {
              n: "03",
              title: "New nurses carry disproportionate uncertainty",
              body: "Early in your career, you're constantly asking: is this normal? Should I call? Am I missing something? That uncertainty costs cognitive energy and time.",
            },
            {
              n: "04",
              title: "Even experienced nurses second-guess",
              body: "When you're tired, at the end of a shift, or dealing with an unfamiliar presentation — a structured second opinion helps anyone think more clearly.",
            },
          ].map((item, i) => (
            <Fade key={item.n} delay={i * 60} style={{ background: C.bg, padding: "44px 40px" }}>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                color: C.accent,
                opacity: 0.45,
                letterSpacing: "0.3px",
                marginBottom: 18,
              }}>
                {item.n}
              </div>
              <div style={{
                fontSize: 16,
                fontWeight: 700,
                color: C.textPrimary,
                letterSpacing: "-0.3px",
                lineHeight: 1.35,
                marginBottom: 12,
              }}>
                {item.title}
              </div>
              <div style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.72 }}>
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
          <Label>See It In Action</Label>
          <SectionHeading maxWidth={480} style={{ margin: "0 auto" }}>
            From bedside concern to structured clinical reasoning.
          </SectionHeading>
        </Fade>

        <Fade delay={80}>
          <div style={{
            background: C.card,
            border: `1px solid rgba(255,255,255,0.09)`,
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 40px 100px rgba(0,0,0,0.45)",
          }}>
            {/* Window chrome */}
            <div style={{
              padding: "14px 22px",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: "rgba(255,255,255,0.02)",
            }}>
              {["rgba(255,95,87,0.8)", "rgba(255,189,46,0.8)", "rgba(39,201,63,0.8)"].map((c, i) => (
                <div key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />
              ))}
              <span style={{ marginLeft: 12, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: C.subtle }}>
                Clinical Edge Copilot — Clinical Reasoning Mode
              </span>
            </div>

            <div style={{ padding: "32px 36px" }}>
              {/* Input label */}
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                fontWeight: 500,
                color: C.subtle,
                textTransform: "uppercase",
                letterSpacing: "1.2px",
                marginBottom: 12,
              }}>
                Clinical Scenario
              </div>

              {/* Scenario text */}
              <div style={{
                background: "rgba(255,255,255,0.025)",
                border: `1px solid rgba(0,194,209,0.18)`,
                borderRadius: 10,
                padding: "16px 18px",
                fontSize: 14,
                color: C.textSecondary,
                lineHeight: 1.68,
                marginBottom: 28,
                fontStyle: "italic",
              }}>
                "Patient is a 68-year-old with CHF admitted yesterday. Oxygen went from 2L nasal cannula to 6L over the past 3 hours. HR up to 108, BP 148/92, increasing respiratory rate, bilateral crackles on auscultation."
              </div>

              {/* Urgency badge row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#fcd34d",
                  background: "rgba(245,158,11,0.12)",
                  border: "1px solid rgba(245,158,11,0.32)",
                  padding: "5px 12px",
                  borderRadius: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                  Urgency: MODERATE
                </span>
                <span style={{ fontSize: 11, color: C.subtle, fontFamily: "'IBM Plex Mono', monospace" }}>·</span>
                <span style={{ fontSize: 11, color: C.subtle, fontFamily: "'IBM Plex Mono', monospace" }}>Clinical Reasoning</span>
              </div>

              {/* Sections */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <MockCard label="Most Likely Issue" accent="#e05572" bg="rgba(224,85,114,0.06)" border="rgba(224,85,114,0.16)">
                  Acute decompensated heart failure with progressive fluid overload and early respiratory failure
                </MockCard>
                <MockCard label="Clinical Pattern Recognition" accent="#4da3ff" bg="rgba(77,163,255,0.06)" border="rgba(77,163,255,0.16)">
                  Escalating O₂ requirement + bilateral crackles + tachycardia in a CHF patient = classic ADHF pattern. The trend over 3 hours is the concern — this is not compensating.
                </MockCard>
                <MockCard label="Immediate Nursing Assessments" accent="#1FBF75" bg="rgba(31,191,117,0.06)" border="rgba(31,191,117,0.16)">
                  Work of breathing, O₂ sat trend, lung sounds, lower extremity edema, urine output, daily weight delta, JVP. Upright positioning now. Notify provider.
                </MockCard>
                <MockCard label="Notify Provider / Escalate If" accent="#e07a3a" bg="rgba(224,122,58,0.06)" border="rgba(224,122,58,0.16)">
                  O₂ requirement continues rising, SpO₂ &lt;92%, respiratory rate &gt;28, patient can't speak in full sentences, or mental status changes.
                </MockCard>
              </div>
            </div>
          </div>
        </Fade>
      </section>

      {/* ══ HOW IT WORKS ═════════════════════════════════════════════════════════ */}
      <section style={{
        padding: "84px clamp(20px, 6vw, 80px)",
        maxWidth: 960,
        margin: "0 auto",
      }}>
        <Fade style={{ textAlign: "center", marginBottom: 54 }}>
          <Label>How It Works</Label>
          <SectionHeading maxWidth={440} style={{ margin: "0 auto" }}>
            Three steps to better clinical thinking.
          </SectionHeading>
        </Fade>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 16,
        }}>
          {[
            {
              step: "01",
              title: "Enter a patient scenario",
              body: "Describe what you're seeing — vitals, symptoms, labs, anything relevant. No special format required. Just speak clinically.",
            },
            {
              step: "02",
              title: "AI analyzes clinical patterns",
              body: "The copilot identifies patterns, weighs differential causes, and maps your scenario to structured clinical reasoning frameworks.",
            },
            {
              step: "03",
              title: "Get structured reasoning",
              body: "Nine consistent sections: pattern recognition, assessment priorities, possible causes, nursing actions, escalation criteria, and more.",
            },
          ].map((item, i) => (
            <Fade key={item.step} delay={i * 80}>
              <div className="l-step" style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: "34px 30px",
                height: "100%",
                transition: "all 0.25s ease",
              }}>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 32,
                  fontWeight: 400,
                  color: C.accent,
                  opacity: 0.2,
                  letterSpacing: "-1px",
                  marginBottom: 24,
                  lineHeight: 1,
                }}>
                  {item.step}
                </div>
                <div style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: C.textPrimary,
                  letterSpacing: "-0.4px",
                  marginBottom: 12,
                  lineHeight: 1.3,
                }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.72 }}>
                  {item.body}
                </div>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* ══ WHY DIFFERENT ════════════════════════════════════════════════════════ */}
      <section style={{
        padding: "84px clamp(20px, 6vw, 80px)",
        maxWidth: 960,
        margin: "0 auto",
      }}>
        <Fade style={{ marginBottom: 46 }}>
          <Label>What Makes It Different</Label>
          <SectionHeading maxWidth={380}>
            Not just another AI tool.
          </SectionHeading>
        </Fade>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
          gap: 12,
        }}>
          {[
            {
              title: "Built for nurses",
              body: "Every section, every phrase, every response is designed around how nurses actually think at the bedside — not how physicians chart or how AI typically responds.",
            },
            {
              title: "Structured clinical reasoning",
              body: "Nine consistent sections per response: pattern recognition, nursing assessments, possible causes, escalation criteria. No rambling. No ambiguity.",
            },
            {
              title: "Focused on bedside decisions",
              body: "Not a research tool. Not a differential generator. Built for the specific moment you're at the bedside and need a structured second opinion — fast.",
            },
            {
              title: "Not generic AI responses",
              body: "Built on clinical reasoning frameworks designed by a master's-prepared RN with critical care experience. Purpose-built clinical cognition — not a repurposed chatbot.",
            },
          ].map((item, i) => (
            <Fade key={item.title} delay={i * 55}>
              <div className="l-diff" style={{
                background: "rgba(17,41,54,0.35)",
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: "28px 26px",
                transition: "all 0.25s ease",
              }}>
                <div style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: C.accent,
                  opacity: 0.7,
                  marginBottom: 20,
                }} />
                <div style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: C.textPrimary,
                  letterSpacing: "-0.3px",
                  marginBottom: 10,
                  lineHeight: 1.3,
                }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.72 }}>
                  {item.body}
                </div>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* ══ TRUST / SAFETY ═══════════════════════════════════════════════════════ */}
      <section style={{
        padding: "84px clamp(20px, 6vw, 80px)",
        maxWidth: 880,
        margin: "0 auto",
      }}>
        <Fade>
          <div style={{
            background: C.card,
            border: `1px solid ${C.borderAccent}`,
            borderRadius: 20,
            padding: "64px clamp(28px, 5vw, 72px)",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Corner glow */}
            <div style={{
              position: "absolute",
              top: -60,
              right: -60,
              width: 260,
              height: 260,
              background: "radial-gradient(circle, rgba(0,194,209,0.07) 0%, transparent 65%)",
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute",
              bottom: -40,
              left: -40,
              width: 200,
              height: 200,
              background: "radial-gradient(circle, rgba(0,194,209,0.04) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            <div style={{ position: "relative" }}>
              <Label>Built for Clinical Reasoning — Not Diagnosis</Label>

              <h2 style={{
                fontSize: "clamp(24px, 3.5vw, 40px)",
                fontWeight: 800,
                color: C.textPrimary,
                letterSpacing: "-1.2px",
                lineHeight: 1.12,
                margin: "0 0 28px",
                maxWidth: 500,
              }}>
                Supporting how you think.
                <br />
                <span style={{ color: C.accent }}>Not replacing your judgment.</span>
              </h2>

              <p style={{
                fontSize: 16,
                color: C.textSecondary,
                lineHeight: 1.75,
                margin: "0 0 40px",
                maxWidth: 540,
              }}>
                Clinical Edge Copilot is designed to support how nurses think — not replace clinical judgment.
                It does not diagnose. It does not prescribe. Instead, it helps you:
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 44 }}>
                {[
                  "Recognize patterns earlier — before they become crises",
                  "Connect subtle changes across vitals, labs, and clinical presentation",
                  "Think through what matters most for this patient right now",
                ].map((point) => (
                  <div key={point} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <Check />
                    <span style={{ fontSize: 15, color: C.textSecondary, lineHeight: 1.65 }}>
                      {point}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{
                paddingTop: 28,
                borderTop: `1px solid ${C.border}`,
                fontSize: 13,
                color: C.muted,
                lineHeight: 1.7,
                maxWidth: 560,
              }}>
                Every response is structured to guide assessment, prioritization, and escalation — not to replace the clinical judgment that only you, at the bedside, can provide.
              </div>
            </div>
          </div>
        </Fade>
      </section>

      {/* ══ FINAL CTA ════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: "84px clamp(20px, 6vw, 80px) 100px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Ambient glow */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 560,
          height: 360,
          background: "radial-gradient(ellipse, rgba(0,194,209,0.07) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        <Fade style={{ position: "relative" }}>
          <Label>Get Started</Label>
          <h2 style={{
            fontSize: "clamp(34px, 5.5vw, 62px)",
            fontWeight: 800,
            color: C.textPrimary,
            letterSpacing: "-2.5px",
            lineHeight: 1.05,
            margin: "0 auto 22px",
            maxWidth: 580,
          }}>
            Start thinking at a higher clinical level.
          </h2>
          <p style={{
            fontSize: 17,
            color: C.muted,
            lineHeight: 1.65,
            margin: "0 auto 52px",
            maxWidth: 400,
          }}>
            No setup. No login. Open the copilot and start reasoning through your next patient.
          </p>
          <button
            onClick={onEnterApp}
            className="l-btn-primary"
            style={{ ...btnPrimary, fontSize: 16, padding: "16px 42px", borderRadius: 12, boxShadow: "0 6px 30px rgba(0,194,209,0.22)" }}
          >
            Open Copilot
          </button>
        </Fade>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════════════════════ */}
      <footer style={{
        borderTop: `1px solid ${C.border}`,
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
            color: C.muted,
            letterSpacing: "-0.1px",
          }}>
            The Clinical Edge
          </span>
        </div>

        <p style={{
          fontSize: 11,
          color: C.subtle,
          lineHeight: 1.65,
          maxWidth: 520,
          margin: 0,
          fontFamily: "'IBM Plex Mono', monospace",
        }}>
          Clinical Edge Copilot is a clinical reasoning support tool for registered nurses. It is not a diagnostic tool and does not replace clinical judgment. Always follow your institution's policies and escalate through appropriate channels.
        </p>

        <p style={{
          fontSize: 11,
          color: C.subtle,
          margin: 0,
          fontFamily: "'IBM Plex Mono', monospace",
        }}>
          © {new Date().getFullYear()} The Clinical Edge. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
