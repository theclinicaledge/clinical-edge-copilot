import React from "react";
import { C, S, SANS, MONO } from "./tokens";
import { MockHeader } from "./MockHeader";

// ── Reusable sub-components ───────────────────────────────────────────────────

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
    <span style={{ color: "rgba(27,36,51,0.52)", fontSize: 11 * S, fontFamily: SANS, lineHeight: 1.4 }}>
      For clinical support only — not a substitute for your judgment or facility protocol
    </span>
  </div>
);

const BulletRow: React.FC<{ accent: string; children: React.ReactNode }> = ({ accent, children }) => (
  <div style={{ display: "flex", gap: 10 * S, marginBottom: 8 * S, alignItems: "flex-start" }}>
    <span style={{
      color: accent,
      fontWeight: 700,
      flexShrink: 0,
      fontSize: 13 * S,
      lineHeight: 1.65,
      marginTop: 1 * S,
    }}>›</span>
    <span style={{ color: C.textBody, fontSize: 13 * S, lineHeight: 1.65, fontFamily: SANS }}>
      {children}
    </span>
  </div>
);

// ── Main screen ───────────────────────────────────────────────────────────────

export const MockQuickQuestions: React.FC = () => (
  <div style={{ background: C.bgApp, width: "100%", fontFamily: SANS }}>
    <MockHeader />
    <SafetyStrip />

    <div style={{ padding: `${14 * S}px ${16 * S}px 0` }}>

      {/* Common Nursing Actions — green */}
      <div style={{
        background: C.bgCard,
        borderLeft: `3px solid ${C.green}`,
        borderRadius: 10 * S,
        padding: `${14 * S}px ${16 * S}px`,
        marginBottom: 10 * S,
        boxShadow: `0 ${1 * S}px ${8 * S}px rgba(0,0,0,0.06)`,
      }}>
        <div style={{
          fontSize: 10 * S,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1.4px",
          color: C.green,
          fontFamily: MONO,
          marginBottom: 11 * S,
        }}>
          Common Nursing Actions
        </div>
        <BulletRow accent={C.green}>
          Complete bedside assessment now — do not delay for documentation
        </BulletRow>
        <BulletRow accent={C.green}>
          Notify provider with full picture: BP 88/50, HR 122, acute onset, prior stability
        </BulletRow>
        <BulletRow accent={C.green}>
          Increase vital sign monitoring frequency per unit protocol
        </BulletRow>
        <BulletRow accent={C.green}>
          Confirm IV access is patent and adequate; note available gauge
        </BulletRow>
        <BulletRow accent={C.green}>
          Position supine, legs elevated if tolerated and not contraindicated
        </BulletRow>
        <BulletRow accent={C.green}>
          Have rapid response criteria and facility escalation protocol available
        </BulletRow>
      </div>

      {/* Notify Provider / Escalate If — red */}
      <div style={{
        background: C.bgCard,
        borderLeft: `3px solid ${C.red}`,
        borderRadius: 10 * S,
        padding: `${14 * S}px ${16 * S}px`,
        marginBottom: 10 * S,
        boxShadow: `0 ${1 * S}px ${8 * S}px rgba(0,0,0,0.06)`,
      }}>
        <div style={{
          fontSize: 10 * S,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1.4px",
          color: C.red,
          fontFamily: MONO,
          marginBottom: 11 * S,
        }}>
          Notify Provider / Escalate If
        </div>
        <BulletRow accent={C.red}>
          Notify now — acute BP/HR change from a stable baseline warrants immediate contact
        </BulletRow>
        <BulletRow accent={C.red}>
          Initiate rapid response per protocol if there is no timely provider response
        </BulletRow>
        <BulletRow accent={C.red}>
          Escalate further if mental status changes, SpO₂ drops, or deterioration continues
        </BulletRow>
      </div>

      {/* Clinical Insight — amber */}
      <div style={{
        background: C.bgCard,
        borderLeft: `3px solid ${C.amber}`,
        borderRadius: 10 * S,
        padding: `${14 * S}px ${16 * S}px`,
        marginBottom: 14 * S,
        boxShadow: `0 ${1 * S}px ${8 * S}px rgba(0,0,0,0.06)`,
      }}>
        <div style={{
          fontSize: 10 * S,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1.4px",
          color: C.amber,
          fontFamily: MONO,
          marginBottom: 10 * S,
        }}>
          Clinical Insight
        </div>
        <p style={{
          color: "rgba(27,36,51,0.62)",
          fontSize: 14 * S,
          lineHeight: 1.70,
          margin: 0,
          fontStyle: "italic",
        }}>
          Compensation can maintain blood pressure deceptively well — until it can't. A patient who drops this fast from a stable baseline often has less reserve than the current numbers suggest.
        </p>
      </div>

      {/* Footer disclaimer */}
      <p style={{
        color: "rgba(27,36,51,0.30)",
        fontSize: 11 * S,
        lineHeight: 1.5,
        fontStyle: "italic",
        margin: `0 0 ${14 * S}px`,
      }}>
        For educational support only. Use your clinical judgment and follow local protocol.
      </p>

      {/* Action bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8 * S,
        paddingTop: 14 * S,
        borderTop: `1px solid rgba(0,0,0,0.08)`,
        flexWrap: "wrap",
        marginBottom: 16 * S,
      }}>
        {/* Save Case */}
        <div style={{
          background: "rgba(5,150,105,0.06)",
          border: `1px solid rgba(5,150,105,0.22)`,
          color: C.green,
          borderRadius: 8 * S,
          padding: `${9 * S}px ${18 * S}px`,
          fontSize: 13 * S,
          fontWeight: 600,
        }}>
          + Save Case
        </div>
        {/* Copy Response */}
        <div style={{
          background: "transparent",
          border: `1px solid rgba(0,0,0,0.10)`,
          color: "rgba(27,36,51,0.48)",
          borderRadius: 8 * S,
          padding: `${9 * S}px ${16 * S}px`,
          fontSize: 13 * S,
          fontWeight: 400,
        }}>
          Copy Response
        </div>
        {/* Turn into SBAR */}
        <div style={{
          marginLeft: "auto",
          background: "transparent",
          border: `1px solid rgba(14,165,183,0.28)`,
          color: C.teal,
          borderRadius: 8 * S,
          padding: `${9 * S}px ${14 * S}px`,
          fontSize: 13 * S,
          fontWeight: 500,
        }}>
          Turn into SBAR →
        </div>
      </div>

    </div>
  </div>
);
