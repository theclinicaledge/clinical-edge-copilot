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

        .l-flow { display: flex; align-items: flex-start; gap: 0; width: 100%; }
        .l-flow-arrow { flex-shrink: 0; align-self: center; color: #3A5566; font-size: 20px; padding: 0 6px; margin-bottom: 8px; line-height: 1; }
        .l-flow-step { flex: 1; min-width: 0; }

        @media (max-width: 640px) {
          .l-hero-btns { flex-direction: column !important; }
          .l-hero-btns button { width: 100% !important; }
          .l-flow { flex-direction: column !important; gap: 0 !important; }
          .l-flow-arrow { transform: rotate(90deg); align-self: flex-start; margin-left: 22px; padding: 4px 0; margin-bottom: 0; }
        }
      `}</style>

      {/* ══ NAV ══════════════════════════════════════════════════════════════════ */}
      <nav style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 100,
        paddingTop: "env(safe-area-inset-top)",
        background: scrolled ? "rgba(11,31,42,0.97)" : "rgba(11,31,42,0)",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
        transition: "all 0.3s ease",
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
        </div>{/* end inner nav row */}
      </nav>

      {/* ══ HERO ═════════════════════════════════════════════════════════════════ */}
      <section style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "calc(120px + env(safe-area-inset-top)) clamp(20px, 6vw, 80px) 80px",
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
            <br />
            When it matters most.
          </h1>

          {/* Subhead */}
          <p className="l-h3-anim" style={{
            fontSize: "clamp(16px, 2vw, 19px)",
            fontWeight: 400,
            color: C.textSecondary,
            lineHeight: 1.72,
            margin: "0 auto 50px",
            maxWidth: 580,
          }}>
            Clinical Edge Copilot helps you think through patient situations, medication questions, and clinical decisions — whether you're learning, practicing, or leading.
          </p>

          {/* Bridge line */}
          <p className="l-h3-anim" style={{
            fontSize: "clamp(13px, 1.5vw, 14px)",
            fontWeight: 500,
            color: C.muted,
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: "0.3px",
            margin: "-32px auto 50px",
            maxWidth: 480,
          }}>
            Built for how nurses actually think — not just what textbooks say.
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
            <button onClick={onEnterScenario} className="l-btn-primary" style={{ ...btnPrimary, fontSize: 15, padding: "14px 34px", borderRadius: 11 }}>
              Try a real scenario →
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

      {/* ══ SAFETY / GUARDRAILS ══════════════════════════════════════════════════ */}
      <section style={{
        padding: "84px clamp(20px, 6vw, 80px)",
        maxWidth: 880,
        margin: "0 auto",
      }}>
        <Fade>
          <div style={{
            background: "rgba(0,194,209,0.04)",
            border: `1px solid rgba(0,194,209,0.22)`,
            borderLeft: `4px solid ${C.accent}`,
            borderRadius: 16,
            padding: "52px clamp(28px, 5vw, 64px)",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Corner glow */}
            <div style={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 240,
              height: 240,
              background: "radial-gradient(circle, rgba(0,194,209,0.06) 0%, transparent 65%)",
              pointerEvents: "none",
            }} />

            <div style={{ position: "relative" }}>
              <Label>Designed with Clinical Guardrails</Label>
              <h2 style={{
                fontSize: "clamp(22px, 3vw, 36px)",
                fontWeight: 800,
                color: C.textPrimary,
                letterSpacing: "-1px",
                lineHeight: 1.15,
                margin: "0 0 32px",
                maxWidth: 520,
              }}>
                Designed with clinical guardrails — not generic AI.
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {[
                  "Does NOT diagnose or replace provider judgment",
                  "Does NOT tell you to blindly give medications",
                  "Emphasizes assessment, trends, and escalation",
                  "Reinforces safe clinical decision-making at every step",
                ].map((point) => (
                  <div key={point} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <Check />
                    <span style={{ fontSize: 15, color: C.textSecondary, lineHeight: 1.65 }}>
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Fade>
      </section>

      {/* ══ WHY DIFFERENT (CONSOLIDATED) ════════════════════════════════════════ */}
      <section style={{
        padding: "84px clamp(20px, 6vw, 80px)",
        maxWidth: 960,
        margin: "0 auto",
      }}>
        <Fade style={{ textAlign: "center", marginBottom: 52 }}>
          <Label>This isn't another AI chatbot.</Label>
          <SectionHeading maxWidth={560} style={{ margin: "0 auto 20px" }}>
            Not another AI tool telling you what to do.
          </SectionHeading>
          <p style={{
            fontSize: "clamp(15px, 1.8vw, 17px)",
            fontWeight: 400,
            color: C.textSecondary,
            lineHeight: 1.72,
            margin: "20px auto 0",
            maxWidth: 520,
          }}>
            Most tools give generic answers. Clinical Edge Copilot helps you break down what's actually happening — step by step, like an experienced nurse would.
          </p>
        </Fade>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(268px, 1fr))",
          gap: 16,
        }}>
          {[
            {
              title: "Thinks like a nurse",
              body: "Every response follows real clinical reasoning — not textbook explanations or AI-generated fluff.",
            },
            {
              title: "Shows what matters",
              body: "Cuts through noise and highlights the patterns you actually need to act on.",
            },
            {
              title: "Helps you connect the dots",
              body: "Vitals, symptoms, labs, and context — organized into a clear clinical picture.",
            },
          ].map((card, i) => (
            <Fade key={card.title} delay={i * 80}>
              <div style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderTop: `2px solid ${C.accent}`,
                borderRadius: 14,
                padding: "32px 28px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
                height: "100%",
                boxSizing: "border-box",
              }}>
                <div style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: C.textPrimary,
                  letterSpacing: "-0.3px",
                  lineHeight: 1.35,
                  marginBottom: 12,
                }}>
                  {card.title}
                </div>
                <div style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.72 }}>
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
          <Label>How It Thinks</Label>
          <SectionHeading maxWidth={480}>
            How it breaks down a situation
          </SectionHeading>
          <p style={{
            fontSize: "clamp(15px, 1.8vw, 17px)",
            fontWeight: 400,
            color: C.textSecondary,
            lineHeight: 1.72,
            margin: "16px 0 0",
            maxWidth: 460,
          }}>
            Not more information — better thinking.
          </p>
        </Fade>

        <Fade delay={80}>
          <div className="l-flow">
            {[
              { step: "01", label: "Recognizes the pattern",  body: "Identifies what's clinically concerning",    accent: C.accent,   accentRgb: "0,194,209"   },
              { step: "02", label: "Prioritizes risk",       body: "Surfaces urgency and red flags first",        accent: "#4da3ff",  accentRgb: "77,163,255"  },
              { step: "03", label: "Guides assessment",      body: "Shows what to check and why",                 accent: "#F2B94B",  accentRgb: "242,185,75"  },
              { step: "04", label: "Suggests next steps",    body: "What to do, watch, and escalate",             accent: "#1FBF75",  accentRgb: "31,191,117"  },
            ].map((item, i) => (
              <>
                {i > 0 && (
                  <div key={`arrow-${i}`} className="l-flow-arrow">›</div>
                )}
                <div key={item.step} className="l-flow-step" style={{
                  borderTop: `3px solid ${item.accent}`,
                  background: C.card,
                  borderRadius: 12,
                  padding: "24px 22px",
                  border: `1px solid ${C.border}`,
                  borderTopColor: item.accent,
                  borderTopWidth: 3,
                }}>
                  <div style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 9,
                    fontWeight: 700,
                    color: item.accent,
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
                    color: C.textPrimary,
                    letterSpacing: "-0.3px",
                    lineHeight: 1.3,
                    marginBottom: 8,
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: C.textSecondary,
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

      {/* ══ REAL SHIFT MOMENTS ═══════════════════════════════════════════════════ */}
      <section style={{
        padding: "84px clamp(20px, 6vw, 80px)",
        maxWidth: 960,
        margin: "0 auto",
      }}>
        <Fade style={{ textAlign: "center", marginBottom: 52 }}>
          <Label>Real Shift Moments</Label>
          <SectionHeading maxWidth={480} style={{ margin: "0 auto 20px" }}>
            The moment something feels off.
          </SectionHeading>
          <p style={{
            fontSize: "clamp(15px, 1.8vw, 17px)",
            fontWeight: 400,
            color: C.textSecondary,
            lineHeight: 1.72,
            margin: "20px auto 0",
            maxWidth: 480,
          }}>
            Vitals are changing. The patient looks different. You know you need to think clearly — fast.
          </p>
        </Fade>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(268px, 1fr))",
          gap: 16,
        }}>
          {[
            {
              n: "01",
              title: "A subtle BP drop becomes a trend.",
              body: "Not crashing. Not normal. You need to decide what matters now.",
            },
            {
              n: "02",
              title: "The patient looks worse before the numbers catch up.",
              body: "Something changed. You feel it. Now you need to connect the dots.",
            },
            {
              n: "03",
              title: "You're not looking for more noise.",
              body: "You need help sorting what's urgent, what to assess, and when to escalate.",
            },
          ].map((card, i) => (
            <Fade key={card.n} delay={i * 80}>
              <div style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderTop: `2px solid ${C.accent}`,
                borderRadius: 14,
                padding: "32px 30px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
                height: "100%",
                boxSizing: "border-box",
              }}>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  fontWeight: 600,
                  color: C.accent,
                  opacity: 0.55,
                  letterSpacing: "0.5px",
                  marginBottom: 20,
                }}>
                  {card.n}
                </div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: C.textPrimary,
                  letterSpacing: "-0.3px",
                  lineHeight: 1.35,
                  marginBottom: 14,
                }}>
                  {card.title}
                </div>
                <div style={{
                  fontSize: 14,
                  color: C.textSecondary,
                  lineHeight: 1.72,
                }}>
                  {card.body}
                </div>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* ══ HOW IT HELPS YOU THINK ═══════════════════════════════════════════════ */}
      <section style={{
        padding: "84px clamp(20px, 6vw, 80px)",
        maxWidth: 960,
        margin: "0 auto",
      }}>
        <Fade style={{ textAlign: "center", marginBottom: 52 }}>
          <Label>It doesn't just answer — it organizes your thinking</Label>
          <SectionHeading maxWidth={520}>
            It doesn't just answer — it organizes your thinking.
          </SectionHeading>
          <p style={{
            fontSize: "clamp(15px, 1.8vw, 17px)",
            fontWeight: 400,
            color: C.textSecondary,
            lineHeight: 1.72,
            margin: "20px auto 0",
            maxWidth: 460,
          }}>
            You don't need more information in a critical moment. You need clarity.
          </p>
        </Fade>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(268px, 1fr))",
          gap: 16,
        }}>
          {[
            {
              n: "01",
              title: "You describe what's happening.",
              body: "Vitals, symptoms, changes — just like you'd explain it to another nurse.",
            },
            {
              n: "02",
              title: "It organizes the clinical picture.",
              body: "Surfaces patterns, flags concerns, and highlights what actually matters.",
            },
            {
              n: "03",
              title: "You move with clarity.",
              body: "What to assess next. What to watch. When to escalate.",
            },
          ].map((card, i) => (
            <Fade key={card.n} delay={i * 80}>
              <div style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderTop: `2px solid ${C.accent}`,
                borderRadius: 14,
                padding: "32px 30px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
                height: "100%",
                boxSizing: "border-box",
              }}>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  fontWeight: 600,
                  color: C.accent,
                  opacity: 0.55,
                  letterSpacing: "0.5px",
                  marginBottom: 20,
                }}>
                  {card.n}
                </div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: C.textPrimary,
                  letterSpacing: "-0.3px",
                  lineHeight: 1.35,
                  marginBottom: 14,
                }}>
                  {card.title}
                </div>
                <div style={{
                  fontSize: 14,
                  color: C.textSecondary,
                  lineHeight: 1.72,
                }}>
                  {card.body}
                </div>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* ══ BUILT FOR BEDSIDE NURSING ════════════════════════════════════════════ */}
      <section style={{
        padding: "84px clamp(20px, 6vw, 80px)",
        maxWidth: 960,
        margin: "0 auto",
      }}>
        <Fade style={{ textAlign: "center", marginBottom: 52 }}>
          <Label>Built for real clinical thinking</Label>
          <SectionHeading maxWidth={540}>
            Built for wherever you are in your clinical journey.
          </SectionHeading>
          <p style={{
            fontSize: "clamp(15px, 1.8vw, 17px)",
            fontWeight: 400,
            color: C.textSecondary,
            lineHeight: 1.72,
            margin: "20px auto 0",
            maxWidth: 520,
          }}>
            Whether you're building your clinical eye or making fast decisions on a busy shift — structured thinking helps at every stage.
          </p>
        </Fade>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(268px, 1fr))",
          gap: 16,
        }}>
          {[
            {
              n: "01",
              title: "For students building clinical judgment",
              body: "Learn to recognize patterns, connect the dots, and understand the 'why' behind what you're seeing.",
            },
            {
              n: "02",
              title: "For new grads gaining confidence",
              body: "Stop second-guessing every assessment. Build structured thinking from your first real shifts.",
            },
            {
              n: "03",
              title: "For nurses making decisions in real time",
              body: "When things are moving fast and you need clarity — not more noise.",
            },
          ].map((card, i) => (
            <Fade key={card.n} delay={i * 80}>
              <div style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderTop: `2px solid ${C.accent}`,
                borderRadius: 14,
                padding: "32px 30px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
                height: "100%",
                boxSizing: "border-box",
              }}>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  fontWeight: 600,
                  color: C.accent,
                  opacity: 0.55,
                  letterSpacing: "0.5px",
                  marginBottom: 20,
                }}>
                  {card.n}
                </div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: C.textPrimary,
                  letterSpacing: "-0.3px",
                  lineHeight: 1.35,
                  marginBottom: 14,
                }}>
                  {card.title}
                </div>
                <div style={{
                  fontSize: 14,
                  color: C.textSecondary,
                  lineHeight: 1.72,
                }}>
                  {card.body}
                </div>
              </div>
            </Fade>
          ))}
        </div>

        <Fade style={{ textAlign: "center", marginTop: 48 }}>
          <p style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 13,
            fontWeight: 500,
            color: C.muted,
            letterSpacing: "0.2px",
          }}>
            No noise. No fluff. Just better thinking — at every stage.
          </p>
        </Fade>
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
          <SectionHeading maxWidth={480} style={{ margin: "0 auto 20px" }}>
            From bedside concern to structured clinical reasoning.
          </SectionHeading>
          <p style={{
            fontSize: "clamp(14px, 1.6vw, 16px)",
            fontWeight: 500,
            color: C.accent,
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: "0.2px",
            margin: "16px auto 0",
            maxWidth: 480,
          }}>
            What you get in seconds — not a Google rabbit hole.
          </p>
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
              <Label>Grounded in real clinical frameworks</Label>

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
                Responses are structured around real nursing assessment patterns and clinical reasoning — not generic AI outputs.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 44 }}>
                {[
                  "Not a diagnosis tool",
                  "Not a replacement for your judgment",
                  "Not a shortcut",
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
                fontSize: 15,
                fontWeight: 600,
                color: C.textSecondary,
                lineHeight: 1.65,
                maxWidth: 560,
              }}>
                A second set of clinical eyes when you need to think clearly.
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
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Ambient glow */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 380,
          background: "radial-gradient(ellipse, rgba(0,194,209,0.06) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        <Fade style={{ position: "relative" }}>
          <Label>Start Thinking Clearly on Shift</Label>
          <h2 style={{
            fontSize: "clamp(30px, 5vw, 54px)",
            fontWeight: 800,
            color: C.textPrimary,
            letterSpacing: "-2px",
            lineHeight: 1.07,
            margin: "0 auto 22px",
            maxWidth: 560,
          }}>
            Think clearer. Move faster. Feel more confident.
          </h2>
          <p style={{
            fontSize: "clamp(15px, 1.8vw, 17px)",
            color: C.textSecondary,
            lineHeight: 1.72,
            margin: "0 auto 48px",
            maxWidth: 440,
          }}>
            Try a real scenario and see how it breaks it down.
          </p>
          <div style={{
            display: "flex",
            gap: 14,
            justifyContent: "center",
            flexWrap: "wrap",
          }}>
            <button
              onClick={onEnterScenario}
              className="l-btn-primary"
              style={{ ...btnPrimary, fontSize: 15, padding: "14px 34px", borderRadius: 11, boxShadow: "0 6px 30px rgba(0,194,209,0.22)" }}
            >
              Try Clinical Edge Copilot
            </button>
            <button
              onClick={onEnterApp}
              className="l-btn-ghost"
              style={{ ...btnGhost, fontSize: 15, padding: "14px 34px", borderRadius: 11 }}
            >
              Open Copilot
            </button>
          </div>
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
          Clinical Edge Copilot provides clinical reasoning support and nursing education only. It does not replace institutional protocols, provider orders, or clinical judgment.
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
