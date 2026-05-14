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

const Dot: React.FC<{ color: string }> = ({ color }) => (
  <span style={{
    display: "inline-block",
    width: 6 * S,
    height: 6 * S,
    borderRadius: "50%",
    background: color,
    flexShrink: 0,
    marginTop: 5 * S,
  }} />
);

// ── Main screen ───────────────────────────────────────────────────────────────

export const MockUrgencyHigh: React.FC = () => (
  <div style={{ background: C.bgApp, width: "100%", fontFamily: SANS }}>
    <MockHeader />
    <SafetyStrip />

    <div style={{ padding: `${14 * S}px ${16 * S}px 0` }}>

      {/* Scenario echo */}
      <div style={{
        background: "rgba(255,255,255,0.50)",
        border: `1px solid rgba(0,0,0,0.07)`,
        borderRadius: 10 * S,
        padding: `${10 * S}px ${14 * S}px`,
        marginBottom: 12 * S,
        fontSize: 13 * S,
        color: "rgba(27,36,51,0.60)",
        lineHeight: 1.5,
        fontStyle: "italic",
      }}>
        "BP dropped to 88/50, HR 122, was stable an hour ago — help me think through this before I call."
      </div>

      {/* Urgency badge */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 9 * S,
        background: C.urgHighBg,
        border: `1px solid ${C.urgHighBorder}`,
        borderRadius: 8 * S,
        padding: `${9 * S}px ${14 * S}px`,
        marginBottom: 10 * S,
      }}>
        <span style={{
          width: 7 * S,
          height: 7 * S,
          borderRadius: "50%",
          background: C.urgHigh,
          flexShrink: 0,
          display: "inline-block",
        }} />
        <span style={{
          fontSize: 11 * S,
          fontWeight: 700,
          color: C.urgHigh,
          fontFamily: MONO,
          letterSpacing: "1.2px",
          textTransform: "uppercase",
          flex: 1,
        }}>
          Urgency: HIGH
        </span>
        <span style={{
          fontSize: 12 * S,
          color: C.urgHigh,
          opacity: 0.80,
        }}>
          ⚠
        </span>
      </div>

      {/* Urgent deterioration warning */}
      <div style={{
        background: "rgba(220,38,38,0.04)",
        border: `1px solid rgba(220,38,38,0.14)`,
        borderRadius: 8 * S,
        padding: `${10 * S}px ${14 * S}px`,
        marginBottom: 12 * S,
        display: "flex",
        gap: 9 * S,
        alignItems: "flex-start",
      }}>
        <span style={{ fontSize: 14 * S, flexShrink: 0, lineHeight: 1.4 }}>⚠️</span>
        <span style={{
          color: "#9B1C1C",
          fontSize: 13 * S,
          lineHeight: 1.55,
          fontWeight: 500,
        }}>
          This pattern is consistent with acute hemodynamic instability. Prompt bedside assessment and provider notification are typically indicated.
        </span>
      </div>

      {/* Most Likely Issue — blue card */}
      <div style={{
        background: C.bgCard,
        borderLeft: `3px solid ${C.blue}`,
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
          color: C.blue,
          fontFamily: MONO,
          marginBottom: 10 * S,
        }}>
          Most Likely Issue
        </div>
        <p style={{
          color: C.textBody,
          fontSize: 14 * S,
          lineHeight: 1.70,
          margin: `0 0 ${10 * S}px`,
        }}>
          Acute hemodynamic compromise — BP 88/50 with HR 122 in a patient who was stable an hour ago suggests the body is actively compensating for a perfusion deficit.
        </p>
        <p style={{
          color: "rgba(27,36,51,0.55)",
          fontSize: 13 * S,
          lineHeight: 1.55,
          margin: `0 0 ${8 * S}px`,
        }}>
          The trend matters more than any single reading. This is an acute change, not a chronic state.
        </p>
      </div>

      {/* What this could be — blue card */}
      <div style={{
        background: C.bgCard,
        borderLeft: `3px solid ${C.blue}`,
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
          color: C.blue,
          fontFamily: MONO,
          marginBottom: 10 * S,
        }}>
          What this could be
        </div>
        {[
          "Volume loss — bleeding, third-spacing, or inadequate intake",
          "Sepsis — vasodilation from an infectious source catching up",
          "Cardiac dysfunction — rate-related, ischemic, or structural",
          "Pulmonary embolism — obstructive pattern",
          "Medication effect — vasodilators, diuretics, or other agents",
        ].map((item) => (
          <div key={item} style={{
            display: "flex",
            gap: 9 * S,
            marginBottom: 7 * S,
            alignItems: "flex-start",
          }}>
            <Dot color={C.blue} />
            <span style={{ color: C.textBody, fontSize: 13 * S, lineHeight: 1.55 }}>{item}</span>
          </div>
        ))}
      </div>

      {/* Urgency summary card */}
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
          Urgency Summary
        </div>
        <p style={{
          color: C.textBody,
          fontSize: 14 * S,
          lineHeight: 1.70,
          margin: 0,
        }}>
          Hypotension + tachycardia with a rapid onset in a previously stable patient warrants immediate assessment. Do not wait for additional data points before going to the bedside.
        </p>
      </div>

      {/* Footer disclaimer */}
      <p style={{
        color: "rgba(27,36,51,0.30)",
        fontSize: 11 * S,
        lineHeight: 1.5,
        fontStyle: "italic",
        margin: `0 0 ${16 * S}px`,
      }}>
        For educational support only. Use your clinical judgment and follow local protocol.
      </p>

    </div>
  </div>
);
