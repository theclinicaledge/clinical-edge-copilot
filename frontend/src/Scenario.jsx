import { useState } from "react";

// ─── Design Tokens (mirrors Landing.jsx) ──────────────────────────────────────
const C = {
  bg:           "#0B1F2A",
  card:         "#112936",
  accent:       "#00C2D1",
  accentDim:    "rgba(0,194,209,0.1)",
  textPrimary:  "#F8FBFC",
  textSecondary:"#A8C1CC",
  muted:        "#7F99A5",
  subtle:       "#3A5566",
  border:       "rgba(255,255,255,0.07)",
  borderAccent: "rgba(0,194,209,0.2)",
};

// ─── CE Logo ──────────────────────────────────────────────────────────────────
function CELogo({ size = 24 }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 225 200"
      xmlns="http://www.w3.org/2000/svg" fill={C.accent}
      style={{ flexShrink: 0, display: "block" }}
    >
      <path d="M 159.1,24.3 A 96,96 0 1,0 159.1,175.7 L 135.7,145.7 A 58,58 0 1,1 135.7,54.3 Z" />
      <path d="M 144.0,57 L 208,45 L 218,58 L 208,70 L 150.0,71 Z" />
      <path d="M 158.0,92 L 215,82 L 225,95 L 215,107 L 158.0,108 Z" />
      <path d="M 150.0,129 L 208,130 L 218,142 L 208,155 L 144.0,143 Z" />
    </svg>
  );
}

// ─── Mono label ───────────────────────────────────────────────────────────────
function Label({ children, style }) {
  return (
    <div style={{
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 10,
      fontWeight: 500,
      color: C.accent,
      letterSpacing: "1.8px",
      textTransform: "uppercase",
      marginBottom: 16,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Copilot block (for structured response) ──────────────────────────────────
function CopilotBlock({ label, accent = C.accent, bg = "rgba(0,194,209,0.05)", border = "rgba(0,194,209,0.18)", children }) {
  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 10,
      padding: "18px 20px",
      marginBottom: 12,
    }}>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 9,
        fontWeight: 700,
        color: accent,
        textTransform: "uppercase",
        letterSpacing: "1px",
        marginBottom: 10,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.72 }}>
        {children}
      </div>
    </div>
  );
}

// ─── Main Scenario Component ──────────────────────────────────────────────────
export default function Scenario({ onBack, onEnterApp }) {
  const [step, setStep] = useState(1);

  const btnPrimary = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: C.accent,
    color: "#0B1F2A",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    fontSize: 15,
    padding: "14px 34px",
    borderRadius: 11,
    border: "none",
    cursor: "pointer",
    letterSpacing: "-0.2px",
    boxShadow: "0 6px 24px rgba(0,194,209,0.2)",
    transition: "opacity 0.18s ease, transform 0.18s ease",
  };

  const btnGhost = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    color: C.textSecondary,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: 15,
    padding: "14px 34px",
    borderRadius: 11,
    border: `1px solid rgba(255,255,255,0.12)`,
    cursor: "pointer",
    letterSpacing: "-0.2px",
    transition: "border-color 0.18s ease, color 0.18s ease",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      fontFamily: "'Inter', sans-serif",
      color: C.textPrimary,
    }}>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 clamp(20px, 5vw, 60px)",
        height: 62,
        background: "rgba(11,31,42,0.88)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: C.muted,
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: 0,
            letterSpacing: "-0.1px",
          }}
        >
          <span style={{ fontSize: 15 }}>←</span> Back
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <CELogo size={22} />
          <span style={{
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: "-0.4px",
            color: C.textPrimary,
          }}>
            Clinical Edge Copilot
          </span>
        </div>

        <button onClick={onEnterApp} style={{
          background: "none",
          border: `1px solid ${C.borderAccent}`,
          color: C.accent,
          fontFamily: "'Inter', sans-serif",
          fontSize: 12,
          fontWeight: 600,
          padding: "7px 16px",
          borderRadius: 8,
          cursor: "pointer",
          letterSpacing: "-0.1px",
        }}>
          Open App
        </button>
      </nav>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <main style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "60px clamp(20px, 5vw, 40px) 100px",
      }}>

        {/* Step indicator */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 40,
        }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: step >= n ? C.accent : "transparent",
                border: `1.5px solid ${step >= n ? C.accent : C.subtle}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                fontWeight: 700,
                color: step >= n ? "#0B1F2A" : C.subtle,
                transition: "all 0.3s ease",
                flexShrink: 0,
              }}>
                {n}
              </div>
              {n < 3 && (
                <div style={{
                  width: 32,
                  height: 1.5,
                  background: step > n ? C.accent : C.subtle,
                  opacity: step > n ? 1 : 0.3,
                  transition: "all 0.3s ease",
                }} />
              )}
            </div>
          ))}
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            color: C.muted,
            letterSpacing: "0.5px",
            marginLeft: 6,
          }}>
            {step === 1 ? "The scenario" : step === 2 ? "Your thinking" : "Copilot analysis"}
          </span>
        </div>

        {/* ── STEP 1: Scenario ──────────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <Label>Patient Scenario</Label>
            <h1 style={{
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: 800,
              color: C.textPrimary,
              letterSpacing: "-1.2px",
              lineHeight: 1.1,
              margin: "0 0 32px",
            }}>
              Something doesn't add up.
            </h1>

            <div style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: "32px 30px",
              marginBottom: 32,
            }}>
              {/* Unit context badge */}
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(0,194,209,0.08)",
                border: `1px solid ${C.borderAccent}`,
                borderRadius: 6,
                padding: "6px 12px",
                marginBottom: 24,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent }} />
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  color: C.accent,
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                }}>
                  Med-Surg Step-Down · Night Shift · 3 AM
                </span>
              </div>

              <p style={{ fontSize: 15, color: C.textSecondary, lineHeight: 1.82, margin: "0 0 18px" }}>
                You're doing routine rounding and walk into Room 14. <strong style={{ color: C.textPrimary }}>Mr. Okafor, 67M, POD #2 from elective right hemi-colectomy.</strong> Uncomplicated surgery, no real history except mild hypertension — controlled on one med. He was fine at midnight.
              </p>
              <p style={{ fontSize: 15, color: C.textSecondary, lineHeight: 1.82, margin: "0 0 18px" }}>
                He's awake. Sitting up. Looks at you when you walk in.
              </p>
              <p style={{ fontSize: 15, color: C.textPrimary, fontWeight: 600, lineHeight: 1.82, margin: "0 0 24px" }}>
                But something's off.
              </p>
              <p style={{ fontSize: 15, color: C.textSecondary, lineHeight: 1.82, margin: "0 0 28px" }}>
                He's not distressed. He's not clutching his chest. He's not telling you anything is wrong. He just looks... pale. Quieter than earlier. When you ask how he's feeling he says <em style={{ color: C.textPrimary }}>"a little tired, probably just the surgery."</em>
              </p>

              {/* Vitals table */}
              <div style={{
                background: "rgba(255,255,255,0.02)",
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: "20px 22px",
                marginBottom: 20,
              }}>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 9,
                  color: C.muted,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: 14,
                }}>
                  Current Vitals
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px 24px" }}>
                  {[
                    { label: "HR", value: "98", was: "was 74" },
                    { label: "BP", value: "102/64", was: "was 128/78" },
                    { label: "RR", value: "18", was: null },
                    { label: "SpO₂", value: "96% RA", was: null },
                    { label: "Temp", value: "37.1°C", was: null },
                    { label: "UO (2h)", value: "18 mL/hr", was: null },
                  ].map(v => (
                    <div key={v.label}>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: C.muted, letterSpacing: "0.5px", marginBottom: 3 }}>
                        {v.label}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: v.was ? "#fca5a5" : C.textPrimary, letterSpacing: "-0.3px" }}>
                        {v.value}
                      </div>
                      {v.was && (
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: C.muted, marginTop: 2 }}>
                          {v.was}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <p style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.72, margin: 0 }}>
                Abdomen soft. Wound dressing clean and dry. Last Hgb <strong style={{ color: C.textPrimary }}>11.2 on POD #1.</strong>
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setStep(2)}
                style={btnPrimary}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                Think it through →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Reflection ────────────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <Label>Your Thinking</Label>
            <h1 style={{
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: 800,
              color: C.textPrimary,
              letterSpacing: "-1.2px",
              lineHeight: 1.1,
              margin: "0 0 12px",
            }}>
              What are you thinking?
            </h1>
            <p style={{ fontSize: 15, color: C.textSecondary, lineHeight: 1.72, margin: "0 0 36px" }}>
              Before you do anything — sit with this for a second.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
              {[
                {
                  n: "01",
                  q: "What stands out to you in that vitals trend since midnight?",
                },
                {
                  n: "02",
                  q: "What concerns you most — and why does the clean dressing almost make it harder, not easier?",
                },
                {
                  n: "03",
                  q: "What would you check or do in the next 5 minutes before you call anyone?",
                },
              ].map(item => (
                <div key={item.n} style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderLeft: `3px solid ${C.accent}`,
                  borderRadius: 12,
                  padding: "22px 24px",
                  display: "flex",
                  gap: 18,
                  alignItems: "flex-start",
                }}>
                  <div style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10,
                    fontWeight: 600,
                    color: C.accent,
                    opacity: 0.6,
                    flexShrink: 0,
                    paddingTop: 2,
                  }}>
                    {item.n}
                  </div>
                  <p style={{ fontSize: 15, color: C.textPrimary, lineHeight: 1.65, margin: 0, fontWeight: 500 }}>
                    {item.q}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <button
                onClick={() => setStep(1)}
                style={btnGhost}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.textPrimary; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = C.textSecondary; }}
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                style={btnPrimary}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                See Copilot Thinking →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Copilot Response ──────────────────────────────────────── */}
        {step === 3 && (
          <div>
            <Label>Copilot Analysis</Label>
            <h1 style={{
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: 800,
              color: C.textPrimary,
              letterSpacing: "-1.2px",
              lineHeight: 1.1,
              margin: "0 0 8px",
            }}>
              Here's how a sharp nurse reads this room.
            </h1>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65, margin: "0 0 32px" }}>
              Structured thinking — not a lecture.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 28 }}>
              <CopilotBlock
                label="Pattern Recognition"
                accent="#4da3ff"
                bg="rgba(77,163,255,0.05)"
                border="rgba(77,163,255,0.18)"
              >
                This is a <strong style={{ color: C.textPrimary }}>slow bleed until proven otherwise.</strong> Nothing is screaming — that's the problem. HR up 24 points, MAP dropped, UO borderline, and a patient who's compensating quietly. Post-op abdominal surgery + these trends = internal hemorrhage stays on the differential until you've ruled it out. A clean wound dressing means nothing about what's happening inside.
              </CopilotBlock>

              <CopilotBlock
                label="What Concerns Me Most"
                accent="#e05572"
                bg="rgba(224,85,114,0.05)"
                border="rgba(224,85,114,0.18)"
              >
                He's compensating. Not showing classic shock — <em>yet.</em> That's the window you're working in right now. Compensated hemorrhagic shock looks exactly like this: mild tachycardia, soft BP drop, low urine output, patient who feels "just tired." <strong style={{ color: C.textPrimary }}>The body is working hard not to show you how bad it is.</strong>
              </CopilotBlock>

              <CopilotBlock
                label="Assess Next — In This Order"
                accent="#1FBF75"
                bg="rgba(31,191,117,0.05)"
                border="rgba(31,191,117,0.18)"
              >
                <ol style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                  <li>Lay hands on the abdomen — rigidity, distension, involuntary guarding?</li>
                  <li>Check for bleeding not visible externally: Foley output color, drain output if present</li>
                  <li>Orthostatic vitals if he can tolerate it — a significant drop confirms volume depletion</li>
                  <li>Review the last two sets of vitals with fresh eyes — is this a trend or a snapshot?</li>
                </ol>
              </CopilotBlock>

              <CopilotBlock
                label="Early Action Priorities"
                accent="#f59e0b"
                bg="rgba(245,158,11,0.05)"
                border="rgba(245,158,11,0.18)"
              >
                <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                  <li>IV access — confirm patent, get a second large-bore if only one in</li>
                  <li><strong style={{ color: C.textPrimary }}>Notify the surgical resident now,</strong> not when it's worse — lead with the trend: <em>"He was 128/78 at midnight, now 102/64, HR up to 98, UO dropping — I'm concerned."</em></li>
                  <li>Type &amp; Screen on your radar if not done today</li>
                  <li>Keep him flat, keep monitoring, don't leave the room until someone else is aware</li>
                </ul>
              </CopilotBlock>
            </div>

            {/* The Line */}
            <div style={{
              borderTop: `1px solid ${C.border}`,
              paddingTop: 24,
              marginBottom: 40,
            }}>
              <p style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 13,
                fontWeight: 500,
                color: C.accent,
                lineHeight: 1.65,
                margin: 0,
              }}>
                His numbers aren't critical yet. That's exactly why this is the moment to move — not wait.
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <button
                onClick={() => setStep(2)}
                style={btnGhost}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.textPrimary; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = C.textSecondary; }}
              >
                ← Back
              </button>
              <button
                onClick={onEnterApp}
                style={btnPrimary}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                Try it on your own patient →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
