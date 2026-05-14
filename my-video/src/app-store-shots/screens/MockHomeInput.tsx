import React from "react";
import { C, S, SANS, MONO } from "./tokens";
import { MockHeader } from "./MockHeader";

const CHIPS = [
  "Something feels off",
  "Before you call",
  "Medication question",
  "Explain to the patient",
  "Wound / device / precautions",
];

const EXAMPLES = [
  "QTc is 520, patient just got Zofran. Should I be worried?",
  "How do I explain why we're keeping them NPO for an ileus?",
  "Just got report — new confusion, sodium 118, poor PO intake. What matters most first?",
];

// ── Inline safety strip ───────────────────────────────────────────────────────
const SafetyStrip: React.FC = () => (
  <div style={{
    background: "rgba(180,83,9,0.045)",
    borderBottom: `1px solid rgba(180,83,9,0.10)`,
    padding: `${5 * S}px ${16 * S}px`,
    display: "flex",
    alignItems: "center",
    gap: 6 * S,
  }}>
    <span style={{ color: "rgba(180,83,9,0.65)", fontSize: 11 * S, flexShrink: 0, lineHeight: 1 }}>ⓘ</span>
    <span style={{
      color: "rgba(27,36,51,0.52)",
      fontSize: 11 * S,
      fontFamily: SANS,
      lineHeight: 1.4,
    }}>
      For clinical support only — not a substitute for your judgment or facility protocol
    </span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

export const MockHomeInput: React.FC = () => (
  <div style={{ background: C.bgApp, width: "100%", fontFamily: SANS }}>
    <MockHeader />
    <SafetyStrip />

    {/* Hero */}
    <div style={{ padding: `${28 * S}px ${18 * S}px ${0}px`, textAlign: "center" }}>
      <div style={{
        color: C.textPrimary,
        fontSize: 26 * S,
        fontWeight: 700,
        letterSpacing: "-0.025em",
        lineHeight: 1.18,
        marginBottom: 9 * S,
      }}>
        Clinical reasoning support for nurses.
      </div>
      <div style={{
        color: "rgba(27,36,51,0.58)",
        fontSize: 15 * S,
        lineHeight: 1.45,
        marginBottom: 22 * S,
        letterSpacing: "-0.01em",
      }}>
        When something feels off. Before you call.
      </div>
    </div>

    {/* Input card */}
    <div style={{
      margin: `0 ${16 * S}px`,
      background: C.bgCard,
      border: `1px solid rgba(0,0,0,0.09)`,
      borderRadius: 12 * S,
      padding: `${18 * S}px ${18 * S}px ${14 * S}px`,
      boxShadow: `0 ${2 * S}px ${14 * S}px rgba(0,0,0,0.07)`,
    }}>
      {/* Mode tabs */}
      <div style={{ display: "flex", gap: 6 * S, marginBottom: 14 * S }}>
        <div style={{
          background: "rgba(14,165,183,0.10)",
          border: `1px solid rgba(14,165,183,0.30)`,
          color: C.teal,
          borderRadius: 6 * S,
          padding: `${4 * S}px ${12 * S}px`,
          fontSize: 11 * S,
          fontWeight: 600,
          fontFamily: MONO,
          letterSpacing: "0.04em",
        }}>
          Clinical Reasoning ✓
        </div>
        <div style={{
          background: "transparent",
          border: `1px solid rgba(0,0,0,0.09)`,
          color: "rgba(27,36,51,0.42)",
          borderRadius: 6 * S,
          padding: `${4 * S}px ${12 * S}px`,
          fontSize: 11 * S,
          fontWeight: 400,
          fontFamily: MONO,
          letterSpacing: "0.04em",
        }}>
          Quick Guidance
        </div>
      </div>

      {/* Typed scenario */}
      <div style={{
        color: C.textPrimary,
        fontSize: 14 * S,
        lineHeight: 1.62,
        paddingBottom: 12 * S,
        borderBottom: `1px solid rgba(0,0,0,0.08)`,
        marginBottom: 12 * S,
        letterSpacing: "-0.01em",
      }}>
        BP dropped to 88/50, HR 122, was stable an hour ago — help me think through this before I call.
      </div>

      {/* Action row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          color: "rgba(27,36,51,0.30)",
          fontFamily: MONO,
          fontSize: 11 * S,
          letterSpacing: "0.02em",
        }}>
          ⌘ + Enter
        </span>
        <div style={{
          background: C.teal,
          color: "#FFFFFF",
          borderRadius: 8 * S,
          padding: `${9 * S}px ${20 * S}px`,
          fontSize: 14 * S,
          fontWeight: 700,
          letterSpacing: "-0.01em",
        }}>
          Ask Copilot
        </div>
      </div>
    </div>

    {/* Helper */}
    <div style={{
      padding: `${11 * S}px ${18 * S}px ${14 * S}px`,
      fontSize: 12 * S,
      color: "rgba(27,36,51,0.48)",
      lineHeight: 1.5,
    }}>
      Used by nurses during real patient care.
    </div>

    {/* Context chips */}
    <div style={{ padding: `0 ${18 * S}px ${16 * S}px` }}>
      <div style={{
        fontSize: 10 * S,
        color: "rgba(27,36,51,0.32)",
        fontFamily: MONO,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        marginBottom: 7 * S,
      }}>
        Common ways nurses use Copilot
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 * S }}>
        {CHIPS.map((chip) => (
          <span key={chip} style={{
            background: "rgba(255,255,255,0.55)",
            border: `1px solid rgba(0,0,0,0.09)`,
            color: "rgba(27,36,51,0.48)",
            borderRadius: 6 * S,
            padding: `${3 * S}px ${9 * S}px`,
            fontSize: 11 * S,
            whiteSpace: "nowrap",
          }}>
            {chip}
          </span>
        ))}
      </div>
    </div>

    {/* Examples */}
    <div style={{ padding: `0 ${18 * S}px ${28 * S}px` }}>
      <div style={{
        fontSize: 10 * S,
        fontWeight: 500,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "rgba(27,36,51,0.38)",
        marginBottom: 7 * S,
        fontFamily: MONO,
      }}>
        Examples
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 * S }}>
        {EXAMPLES.map((ex) => (
          <div key={ex} style={{
            background: "rgba(255,255,255,0.60)",
            border: `1px solid rgba(0,0,0,0.07)`,
            color: "rgba(27,36,51,0.68)",
            padding: `${9 * S}px ${13 * S}px`,
            borderRadius: 9 * S,
            fontSize: 13 * S,
            lineHeight: 1.48,
            display: "flex",
            alignItems: "flex-start",
            gap: 9 * S,
          }}>
            <span style={{ color: C.teal, fontSize: 9 * S, flexShrink: 0, marginTop: 2 * S, opacity: 0.65 }}>▶</span>
            {ex}
          </div>
        ))}
      </div>
    </div>
  </div>
);
