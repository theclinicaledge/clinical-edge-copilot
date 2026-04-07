import React from "react";
import { C, S, SANS, MONO } from "./tokens";
import { MockHeader } from "./MockHeader";

const Bullet: React.FC<{ accent: string; children: React.ReactNode }> = ({ accent, children }) => (
  <div style={{ display: "flex", gap: 10 * S, marginBottom: 7 * S, alignItems: "flex-start" }}>
    <span style={{ color: accent, fontWeight: 700, flexShrink: 0, fontSize: 13 * S, lineHeight: 1.7, marginTop: 1 * S }}>›</span>
    <span style={{ color: "#BCCDD6", fontSize: 13 * S, lineHeight: 1.65, fontFamily: SANS }}>{children}</span>
  </div>
);

export const MockQuickQuestions: React.FC = () => (
  <div style={{ background: C.bgApp, width: "100%", fontFamily: SANS }}>
    <MockHeader />

    <div style={{ padding: `${16 * S}px ${16 * S}px 0` }}>

      {/* Mode selector pills */}
      <div style={{ display: "flex", gap: 8 * S, marginBottom: 14 * S, alignItems: "center" }}>
        <div style={{
          border: `1px solid rgba(255,255,255,0.07)`,
          color: C.textMuted,
          borderRadius: 999,
          padding: `${4 * S}px ${14 * S}px`,
          fontSize: 11 * S,
          fontWeight: 400,
          fontFamily: MONO,
          letterSpacing: "0.04em",
        }}>
          Clinical Reasoning
        </div>
        <div style={{
          background: "rgba(0,194,209,0.10)",
          border: `1px solid ${C.tealBorder}`,
          color: C.teal,
          borderRadius: 999,
          padding: `${4 * S}px ${14 * S}px`,
          fontSize: 11 * S,
          fontWeight: 600,
          fontFamily: MONO,
          letterSpacing: "0.04em",
        }}>
          Quick Guidance ✓
        </div>
      </div>

      {/* Question bubble */}
      <div style={{
        background: "rgba(0,194,209,0.03)",
        border: `1px solid rgba(0,194,209,0.10)`,
        borderRadius: 12 * S,
        padding: `${14 * S}px ${16 * S}px`,
        marginBottom: 12 * S,
        fontSize: 14 * S,
        color: C.textBody,
        lineHeight: 1.55,
        fontStyle: "italic",
        letterSpacing: "-0.01em",
      }}>
        "QTc is 520, patient just got Zofran. Should I be worried?"
      </div>

      {/* Urgency badge */}
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8 * S,
        background: C.amberBg,
        border: `1px solid ${C.amberBorder}`,
        borderRadius: 8 * S,
        padding: `${6 * S}px ${14 * S}px`,
        marginBottom: 12 * S,
      }}>
        <span style={{
          color: C.amberText,
          fontSize: 10 * S,
          fontWeight: 700,
          fontFamily: MONO,
          letterSpacing: "1.2px",
          textTransform: "uppercase",
        }}>
          ⚑ Urgency: Moderate
        </span>
      </div>

      {/* What this is — blue section */}
      <div style={{
        background: C.bgBlue,
        borderLeft: `3px solid ${C.blue}`,
        borderRadius: 12 * S,
        padding: `${14 * S}px ${18 * S}px`,
        marginBottom: 10 * S,
      }}>
        <div style={{
          fontSize: 9 * S,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1.3px",
          color: C.blue,
          fontFamily: MONO,
          marginBottom: 8 * S,
        }}>
          What this is
        </div>
        <div style={{ color: "#BCCDD6", fontSize: 14 * S, lineHeight: 1.65 }}>
          QTc is prolonged — Zofran increases QT risk.{"\n\n"}This raises concern for dangerous arrhythmias like torsades.
        </div>
      </div>

      {/* What to do — yellow section */}
      <div style={{
        background: C.bgYellow,
        borderLeft: `3px solid ${C.yellow}`,
        borderRadius: 12 * S,
        padding: `${14 * S}px ${18 * S}px`,
        marginBottom: 10 * S,
      }}>
        <div style={{
          fontSize: 9 * S,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1.3px",
          color: C.yellow,
          fontFamily: MONO,
          marginBottom: 10 * S,
        }}>
          What to do now
        </div>
        <Bullet accent={C.yellow}>Notify provider before giving more</Bullet>
        <Bullet accent={C.yellow}>Hold next dose unless cleared</Bullet>
        <Bullet accent={C.yellow}>Check for other QT-prolonging meds</Bullet>
        <Bullet accent={C.yellow}>Place on telemetry if not already</Bullet>
      </div>

      {/* Safety note */}
      <div style={{
        borderLeft: `3px solid rgba(168,193,204,0.15)`,
        paddingLeft: 14 * S,
        margin: `${12 * S}px 0`,
      }}>
        <p style={{
          color: "rgba(168,193,204,0.45)",
          fontSize: 12 * S,
          lineHeight: 1.6,
          fontStyle: "italic",
          margin: 0,
        }}>
          Real bedside questions. Real answers.
        </p>
      </div>

    </div>
  </div>
);
