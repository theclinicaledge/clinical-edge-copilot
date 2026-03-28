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

// ─── Copilot block ────────────────────────────────────────────────────────────
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

// ─── Scenario Data ────────────────────────────────────────────────────────────
const SCENARIOS = [
  {
    id: "01",
    unit: "Med-Surg Step-Down · Night Shift · 3 AM",
    stepOneTitle: "Something doesn't add up.",
    vitals: [
      { label: "HR",      value: "98",       was: "was 74"     },
      { label: "BP",      value: "102/64",   was: "was 128/78" },
      { label: "RR",      value: "18",       was: null         },
      { label: "SpO₂",   value: "96% RA",   was: null         },
      { label: "Temp",    value: "37.1°C",   was: null         },
      { label: "UO (2h)", value: "18 mL/hr", was: null         },
    ],
    questions: [
      "What stands out to you in that vitals trend since midnight?",
      "What concerns you most — and why does the clean dressing almost make it harder, not easier?",
      "What would you check or do in the next 5 minutes before you call anyone?",
    ],
    closingLine: "His numbers aren't critical yet. That's exactly why this is the moment to move — not wait.",
  },
  {
    id: "02",
    unit: "General Medicine Floor · Day Shift · 2 PM",
    stepOneTitle: "He was getting better.",
    vitals: [
      { label: "HR",      value: "112",      was: "was 84"     },
      { label: "BP",      value: "96/58",    was: "was 122/74" },
      { label: "RR",      value: "22",       was: "was 16"     },
      { label: "SpO₂",   value: "92% 2L",   was: "was 97% RA" },
      { label: "Temp",    value: "38.8°C",   was: "was 37.1"   },
      { label: "UO (2h)", value: "20 mL/hr", was: null         },
    ],
    questions: [
      "He was improving — does that change how seriously you take these vitals right now?",
      "What's the single most concerning change in this picture, and why?",
      "Before you call the team, what would you want to have ready?",
    ],
    closingLine: "The hardest patients to catch are the ones who were getting better. Don't let yesterday's labs talk you out of what you're seeing right now.",
  },
  {
    id: "03",
    unit: "Cardiac Step-Down · Evening Shift · 7 PM",
    stepOneTitle: "She says it's probably nothing.",
    vitals: [
      { label: "HR",      value: "94",       was: "was 72"    },
      { label: "BP",      value: "148/88",   was: "was 118/74" },
      { label: "RR",      value: "18",       was: null         },
      { label: "SpO₂",   value: "95% RA",   was: "was 98%"    },
      { label: "Temp",    value: "37.0°C",   was: null         },
      { label: "Troponin","value": "neg ×1", was: "drawn 22h ago" },
    ],
    questions: [
      "She says she feels fine now — does that change how urgently you act?",
      "What two or three details in this picture concern you most, and why?",
      "What would you do in the next 3 minutes before calling anyone?",
    ],
    closingLine: "Resolved chest pain in a high-risk woman is not reassuring. It's a reason to move faster.",
  },
];

// ─── Main Scenario Component ──────────────────────────────────────────────────
export default function Scenario({ onBack, onEnterApp, onQuickStart }) {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [step, setStep] = useState(1);

  const sc = SCENARIOS[scenarioIndex];

  const switchScenario = (idx) => {
    setScenarioIndex(idx);
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
    transition: "opacity 0.18s ease",
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
    border: "1px solid rgba(255,255,255,0.12)",
    cursor: "pointer",
    letterSpacing: "-0.2px",
    transition: "border-color 0.18s ease, color 0.18s ease",
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', sans-serif", color: C.textPrimary }}>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(20px, 5vw, 60px)", height: 62,
        background: "rgba(11,31,42,0.88)",
        backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <button onClick={onBack} style={{
          background: "none", border: "none", color: C.muted,
          fontFamily: "'Inter', sans-serif", fontSize: 13, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6, padding: 0,
        }}>
          <span style={{ fontSize: 15 }}>←</span> Back
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <CELogo size={22} />
          <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.4px", color: C.textPrimary }}>
            Clinical Edge Copilot
          </span>
        </div>
        <button onClick={onEnterApp} style={{
          background: "none", border: `1px solid ${C.borderAccent}`,
          color: C.accent, fontFamily: "'Inter', sans-serif",
          fontSize: 12, fontWeight: 600, padding: "7px 16px",
          borderRadius: 8, cursor: "pointer",
        }}>
          Open App
        </button>
      </nav>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "60px clamp(20px, 5vw, 40px) 100px" }}>

        {/* ── Credibility frame ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            fontWeight: 500,
            color: C.accent,
            letterSpacing: "1.8px",
            textTransform: "uppercase",
            marginBottom: 8,
          }}>
            Real Shift Scenarios
          </div>
          <p style={{
            fontSize: 13,
            color: C.muted,
            margin: 0,
            letterSpacing: "-0.1px",
          }}>
            Built from common bedside deterioration patterns.
          </p>
        </div>

        {/* ── Scenario selector ─────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 36 }}>
          {SCENARIOS.map((s, idx) => {
            const active = scenarioIndex === idx;
            return (
              <button
                key={s.id}
                onClick={() => switchScenario(idx)}
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: `1px solid ${active ? C.accent : C.subtle}`,
                  background: active ? "rgba(0,194,209,0.1)" : "transparent",
                  color: active ? C.accent : C.muted,
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                }}
              >
                Scenario {s.id}
              </button>
            );
          })}
        </div>

        {/* ── Step indicator ────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 40 }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: step >= n ? C.accent : "transparent",
                border: `1.5px solid ${step >= n ? C.accent : C.subtle}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 700,
                color: step >= n ? "#0B1F2A" : C.subtle,
                transition: "all 0.3s ease", flexShrink: 0,
              }}>
                {n}
              </div>
              {n < 3 && (
                <div style={{
                  width: 32, height: 1.5,
                  background: step > n ? C.accent : C.subtle,
                  opacity: step > n ? 1 : 0.3,
                  transition: "all 0.3s ease",
                }} />
              )}
            </div>
          ))}
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: C.muted,
            letterSpacing: "0.5px", marginLeft: 6,
          }}>
            {step === 1 ? "The scenario" : step === 2 ? "Your thinking" : "Copilot analysis"}
          </span>
        </div>

        {/* ══ STEP 1: Scenario ════════════════════════════════════════════════ */}
        {step === 1 && (
          <div>
            <Label>Patient Scenario</Label>
            <h1 style={{
              fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800,
              color: C.textPrimary, letterSpacing: "-1.2px", lineHeight: 1.1,
              margin: "0 0 32px",
            }}>
              {sc.stepOneTitle}
            </h1>

            <div style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 16, padding: "32px 30px", marginBottom: 32,
            }}>
              {/* Unit badge */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(0,194,209,0.08)", border: `1px solid ${C.borderAccent}`,
                borderRadius: 6, padding: "6px 12px", marginBottom: 24,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent }} />
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
                  color: C.accent, letterSpacing: "0.8px", textTransform: "uppercase",
                }}>
                  {sc.unit}
                </span>
              </div>

              {/* ── Scenario 1 narrative ──────────────────────────────────── */}
              {scenarioIndex === 0 && (
                <>
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
                </>
              )}

              {/* ── Scenario 2 narrative ──────────────────────────────────── */}
              {scenarioIndex === 1 && (
                <>
                  <p style={{ fontSize: 15, color: C.textSecondary, lineHeight: 1.82, margin: "0 0 18px" }}>
                    Your CNA pulls you aside during afternoon rounds. <strong style={{ color: C.textPrimary }}>Mr. Torres, 58M, admitted 3 days ago for community-acquired pneumonia.</strong> On IV ceftriaxone and azithromycin. Yesterday's WBC was 9.8 — down from 16.2 on admission. The team was talking about stepping him to oral antibiotics, maybe discharge tomorrow.
                  </p>
                  <p style={{ fontSize: 15, color: C.textSecondary, lineHeight: 1.82, margin: "0 0 18px" }}>
                    He's awake. Answering questions. Nothing dramatic.
                  </p>
                  <p style={{ fontSize: 15, color: C.textPrimary, fontWeight: 600, lineHeight: 1.82, margin: "0 0 24px" }}>
                    But he's not the same as this morning.
                  </p>
                  <p style={{ fontSize: 15, color: C.textSecondary, lineHeight: 1.82, margin: "0 0 28px" }}>
                    His answers come slowly. He says he feels <em style={{ color: C.textPrimary }}>"just tired."</em> He ate breakfast but refused lunch — says his stomach feels off. New crackles on the right, worse than yesterday. No chest pain. No obvious source change.
                    <br /><br />
                    The labs said he was getting better. The team said so too. But you're standing in this room, and something has shifted.
                  </p>
                </>
              )}

              {/* ── Scenario 3 narrative ──────────────────────────────────── */}
              {scenarioIndex === 2 && (
                <>
                  <p style={{ fontSize: 15, color: C.textSecondary, lineHeight: 1.82, margin: "0 0 18px" }}>
                    You walk into Room 8 after seeing a tech note from 20 minutes ago: <em style={{ color: C.textPrimary }}>"Patient c/o chest discomfort, resolved."</em> <strong style={{ color: C.textPrimary }}>Mrs. Patel, 64F, admitted yesterday for hypertensive urgency.</strong> HTN, DM2, former smoker — quit 10 years ago. No known cardiac history. She was being transitioned from IV nicardipine to oral meds and doing well.
                  </p>
                  <p style={{ fontSize: 15, color: C.textSecondary, lineHeight: 1.82, margin: "0 0 18px" }}>
                    She's sitting up, watching TV. Looks at you and waves.
                  </p>
                  <p style={{ fontSize: 15, color: C.textPrimary, fontWeight: 600, lineHeight: 1.82, margin: "0 0 24px" }}>
                    "Oh, I'm fine now. It was probably just gas."
                  </p>
                  <p style={{ fontSize: 15, color: C.textSecondary, lineHeight: 1.82, margin: "0 0 28px" }}>
                    You ask her to describe it. She pauses. <em style={{ color: C.textPrimary }}>"Pressure, like something sitting on my chest."</em> Lasted maybe 5–10 minutes. She mentions it went into her left shoulder — then quickly adds, "but it's gone now, really." She looks a little pale. When you lean in, there's a faint sheen of perspiration on her forehead.
                    <br /><br />
                    She says she had something similar about 6 months ago, never got it checked out.
                  </p>
                </>
              )}

              {/* Vitals table — shared structure, scenario-specific data */}
              <div style={{
                background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`,
                borderRadius: 10, padding: "20px 22px", marginBottom: 20,
              }}>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: C.muted,
                  textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14,
                }}>
                  Current Vitals
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px 24px" }}>
                  {sc.vitals.map(v => (
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

              {/* Scenario-specific footnote */}
              {scenarioIndex === 0 && (
                <p style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.72, margin: 0 }}>
                  Abdomen soft. Wound dressing clean and dry. Last Hgb <strong style={{ color: C.textPrimary }}>11.2 on POD #1.</strong>
                </p>
              )}
              {scenarioIndex === 1 && (
                <p style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.72, margin: 0 }}>
                  Yesterday's WBC: <strong style={{ color: C.textPrimary }}>9.8</strong> (improving). This morning's labs not yet resulted. Skin warm, no rash. Cap refill 3 seconds.
                </p>
              )}
              {scenarioIndex === 2 && (
                <p style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.72, margin: 0 }}>
                  Tech-performed 12-lead on file — <strong style={{ color: C.textPrimary }}>"no obvious ST changes"</strong> per tech read. You haven't reviewed it yet. No current orders for troponin repeat. Skin slightly pale, mild diaphoresis on exam.
                </p>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setStep(2)} style={btnPrimary}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                Think it through →
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 2: Reflection ══════════════════════════════════════════════ */}
        {step === 2 && (
          <div>
            <Label>Your Thinking</Label>
            <h1 style={{
              fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800,
              color: C.textPrimary, letterSpacing: "-1.2px", lineHeight: 1.1,
              margin: "0 0 12px",
            }}>
              What are you thinking?
            </h1>
            <p style={{ fontSize: 15, color: C.textSecondary, lineHeight: 1.72, margin: "0 0 36px" }}>
              Before you do anything — sit with this for a second.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
              {sc.questions.map((q, i) => (
                <div key={i} style={{
                  background: C.card, border: `1px solid ${C.border}`,
                  borderLeft: `3px solid ${C.accent}`, borderRadius: 12,
                  padding: "22px 24px", display: "flex", gap: 18, alignItems: "flex-start",
                }}>
                  <div style={{
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 600,
                    color: C.accent, opacity: 0.6, flexShrink: 0, paddingTop: 2,
                  }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <p style={{ fontSize: 15, color: C.textPrimary, lineHeight: 1.65, margin: 0, fontWeight: 500 }}>
                    {q}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <button
                onClick={() => setStep(1)} style={btnGhost}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.textPrimary; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = C.textSecondary; }}
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)} style={btnPrimary}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                See Copilot Thinking →
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 3: Copilot Response ════════════════════════════════════════ */}
        {step === 3 && (
          <div>
            <Label>Copilot Analysis</Label>
            <h1 style={{
              fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800,
              color: C.textPrimary, letterSpacing: "-1.2px", lineHeight: 1.1,
              margin: "0 0 8px",
            }}>
              Here's how a sharp nurse reads this room.
            </h1>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65, margin: "0 0 32px" }}>
              Structured thinking — not a lecture.
            </p>

            <div style={{ marginBottom: 28 }}>

              {/* ── Scenario 1 Copilot blocks ─────────────────────────────── */}
              {scenarioIndex === 0 && (
                <>
                  <CopilotBlock label="Pattern Recognition" accent="#4da3ff" bg="rgba(77,163,255,0.05)" border="rgba(77,163,255,0.18)">
                    This is a <strong style={{ color: C.textPrimary }}>slow bleed until proven otherwise.</strong> Nothing is screaming — that's the problem. HR up 24 points, MAP dropped, UO borderline, and a patient who's compensating quietly. Post-op abdominal surgery + these trends = internal hemorrhage stays on the differential until you've ruled it out. A clean wound dressing means nothing about what's happening inside.
                  </CopilotBlock>
                  <CopilotBlock label="What Concerns Me Most" accent="#e05572" bg="rgba(224,85,114,0.05)" border="rgba(224,85,114,0.18)">
                    He's compensating. Not showing classic shock — <em>yet.</em> That's the window you're working in right now. Compensated hemorrhagic shock looks exactly like this: mild tachycardia, soft BP drop, low urine output, patient who feels "just tired." <strong style={{ color: C.textPrimary }}>The body is working hard not to show you how bad it is.</strong>
                  </CopilotBlock>
                  <CopilotBlock label="Assess Next — In This Order" accent="#1FBF75" bg="rgba(31,191,117,0.05)" border="rgba(31,191,117,0.18)">
                    <ol style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                      <li>Lay hands on the abdomen — rigidity, distension, involuntary guarding?</li>
                      <li>Check for bleeding not visible externally: Foley output color, drain output if present</li>
                      <li>Orthostatic vitals if he can tolerate it — a significant drop confirms volume depletion</li>
                      <li>Review the last two sets of vitals with fresh eyes — is this a trend or a snapshot?</li>
                    </ol>
                  </CopilotBlock>
                  <CopilotBlock label="Early Action Priorities" accent="#f59e0b" bg="rgba(245,158,11,0.05)" border="rgba(245,158,11,0.18)">
                    <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                      <li>IV access — confirm patent, get a second large-bore if only one in</li>
                      <li><strong style={{ color: C.textPrimary }}>Notify the surgical resident now,</strong> not when it's worse — lead with the trend: <em>"He was 128/78 at midnight, now 102/64, HR up to 98, UO dropping — I'm concerned."</em></li>
                      <li>Type &amp; Screen on your radar if not done today</li>
                      <li>Keep him flat, keep monitoring, don't leave the room until someone else is aware</li>
                    </ul>
                  </CopilotBlock>
                </>
              )}

              {/* ── Scenario 2 Copilot blocks ─────────────────────────────── */}
              {scenarioIndex === 1 && (
                <>
                  <CopilotBlock label="Pattern Recognition" accent="#4da3ff" bg="rgba(77,163,255,0.05)" border="rgba(77,163,255,0.18)">
                    New fever, tachycardia, hypotension, worsening SpO₂, and a subtle mental status change — in a patient who was <strong style={{ color: C.textPrimary }}>improving.</strong> That pattern is sepsis physiology until proven otherwise. The pneumonia may be progressing, a new source may have developed, or this is treatment failure. The improving WBC from yesterday is now working against you — it'll create cognitive bias in anyone you call.
                  </CopilotBlock>
                  <CopilotBlock label="What Concerns Me Most" accent="#e05572" bg="rgba(224,85,114,0.05)" border="rgba(224,85,114,0.18)">
                    The mental status change. <em>Subtle is dangerous.</em> A patient who "seems slow" or "just tired" in the context of fever, tachycardia, and hypotension is showing early signs of septic encephalopathy — that's organ dysfunction. That's not just infection. <strong style={{ color: C.textPrimary }}>That's sepsis.</strong> And the fact that yesterday's labs were reassuring makes this moment easier to miss and harder to escalate.
                  </CopilotBlock>
                  <CopilotBlock label="Assess Next — In This Order" accent="#1FBF75" bg="rgba(31,191,117,0.05)" border="rgba(31,191,117,0.18)">
                    <ol style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                      <li>Full neuro check — GCS, orientation, compare directly to this morning's baseline</li>
                      <li>Lung exam — new or worsening crackles, breath sounds changed since this AM?</li>
                      <li>Skin: mottling, cap refill, temperature of extremities — perfusion clues</li>
                      <li>Urine — output trend, color, clarity; any Foley UA pending or available?</li>
                      <li>Review the vitals trend for the last 4 hours — when did the HR start climbing?</li>
                    </ol>
                  </CopilotBlock>
                  <CopilotBlock label="Early Action Priorities" accent="#f59e0b" bg="rgba(245,158,11,0.05)" border="rgba(245,158,11,0.18)">
                    <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                      <li><strong style={{ color: C.textPrimary }}>Call the team now — lead with the trend:</strong> <em>"He was afebrile and 97% on room air yesterday. He's now 38.8, HR 112, BP 96/58, 92% on 2L, and his mental status has changed."</em></li>
                      <li>Blood cultures × 2 STAT before any antibiotic changes — don't let them change the meds first</li>
                      <li>Request lactate, repeat CBC/BMP, portable CXR</li>
                      <li>Confirm large-bore IV access, fluid challenge is likely coming</li>
                      <li>If team doesn't respond quickly — this is a rapid response conversation</li>
                    </ul>
                  </CopilotBlock>
                </>
              )}
              {/* ── Scenario 3 Copilot blocks ─────────────────────────────── */}
              {scenarioIndex === 2 && (
                <>
                  <CopilotBlock label="Pattern Recognition" accent="#4da3ff" bg="rgba(77,163,255,0.05)" border="rgba(77,163,255,0.18)">
                    Classic atypical ACS presentation in a woman. <strong style={{ color: C.textPrimary }}>Pressure-quality chest discomfort with left shoulder radiation, diaphoresis, BP spike, HR trending up, SpO₂ drop</strong> — in a 64F with HTN, DM2, and a smoking history. Women frequently present with atypical symptoms, and "it resolved" does not rule out ACS. One negative troponin drawn 22 hours ago means nothing right now. The window for a first troponin to rise is 3–6 hours. You're outside that window and don't have a second value.
                  </CopilotBlock>
                  <CopilotBlock label="What Concerns Me Most" accent="#e05572" bg="rgba(224,85,114,0.05)" border="rgba(224,85,114,0.18)">
                    Two things. First: the symptom description — pressure plus left shoulder radiation is a textbook anginal equivalent, regardless of how she's minimizing it. Second: <strong style={{ color: C.textPrimary }}>she's downplaying it.</strong> Patients who minimize chest pain are often the ones who waited too long once before. The 6-month history of similar symptoms that was never worked up should be treated as a prior event until proven otherwise.
                  </CopilotBlock>
                  <CopilotBlock label="Assess Next — In This Order" accent="#1FBF75" bg="rgba(31,191,117,0.05)" border="rgba(31,191,117,0.18)">
                    <ol style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                      <li><strong style={{ color: C.textPrimary }}>Pull the 12-lead and read it yourself</strong> — don't rely on the tech's read; look for ST changes, T-wave inversions, new Q waves</li>
                      <li>Full symptom characterization: onset, quality, radiation, duration, associated nausea/diaphoresis/dyspnea</li>
                      <li>Skin exam: pallor, diaphoresis, cap refill — what do her hands and face look like right now?</li>
                      <li>Confirm when last troponin was drawn — you need timing before you call</li>
                    </ol>
                  </CopilotBlock>
                  <CopilotBlock label="Early Action Priorities" accent="#f59e0b" bg="rgba(245,158,11,0.05)" border="rgba(245,158,11,0.18)">
                    <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                      <li>Call provider now — lead with the clinical picture: <em>"64F with HTN/DM2, had 5–10 min of pressure-type chest pain with left shoulder radiation, now resolved, mild diaphoresis on exam, BP spiked to 148/88, SpO₂ down to 95%, last troponin was 22 hours ago."</em></li>
                      <li>Repeat troponin and 12-lead stat — you need a current data point</li>
                      <li>Aspirin 325mg — ask before giving, confirm no contraindication</li>
                      <li>Keep her in bed, IV access confirmed, O2 if SpO₂ drops below 94%</li>
                      <li>Nothing by mouth until provider evaluates in person</li>
                    </ul>
                  </CopilotBlock>
                </>
              )}
            </div>

            {/* The closing line */}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 24, marginBottom: 40 }}>
              <p style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 500,
                color: C.accent, lineHeight: 1.65, margin: 0,
              }}>
                {sc.closingLine}
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <button
                onClick={() => setStep(2)} style={btnGhost}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.textPrimary; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = C.textSecondary; }}
              >
                ← Back
              </button>

              {/* Chain: 01 → 02 → 03 → app */}
              {scenarioIndex === 0 && (
                <button
                  onClick={() => switchScenario(1)} style={btnPrimary}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  Try Scenario 02 →
                </button>
              )}
              {scenarioIndex === 1 && (
                <button
                  onClick={() => switchScenario(2)} style={btnPrimary}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  Try Scenario 03 →
                </button>
              )}
              {scenarioIndex === 2 && (
                <button
                  onClick={onQuickStart} style={btnPrimary}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  Try it on your own patient →
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
