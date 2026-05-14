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

interface SbarRowProps {
  initial: string;
  label: string;
  rgbColor: string;
  children: React.ReactNode;
  last?: boolean;
}

const SbarRow: React.FC<SbarRowProps> = ({ initial, label, rgbColor, children, last }) => (
  <div style={{
    display: "flex",
    gap: 12 * S,
    alignItems: "flex-start",
    marginBottom: last ? 0 : 14 * S,
    paddingBottom: last ? 0 : 14 * S,
    borderBottom: last ? "none" : `1px solid rgba(255,255,255,0.07)`,
  }}>
    {/* Letter badge */}
    <div style={{
      background: `rgba(${rgbColor}, 0.18)`,
      color: `rgba(${rgbColor}, 1)`,
      borderRadius: 6 * S,
      width: 24 * S,
      height: 24 * S,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 12 * S,
      fontWeight: 800,
      fontFamily: MONO,
      marginTop: 1 * S,
    }}>
      {initial}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{
        fontSize: 9 * S,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "1.2px",
        color: `rgba(${rgbColor}, 0.85)`,
        fontFamily: MONO,
        marginBottom: 5 * S,
      }}>
        {label}
      </div>
      <div style={{
        color: "#C8D8E2",
        fontSize: 13 * S,
        lineHeight: 1.68,
        fontFamily: SANS,
      }}>
        {children}
      </div>
    </div>
  </div>
);

// ── Main screen ───────────────────────────────────────────────────────────────

export const MockSbar: React.FC = () => (
  <div style={{ background: C.bgApp, width: "100%", fontFamily: SANS }}>
    <MockHeader />
    <SafetyStrip />

    <div style={{ padding: `${14 * S}px ${16 * S}px 0` }}>

      {/* Section label */}
      <div style={{
        fontSize: 10 * S,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "1.5px",
        color: C.teal,
        fontFamily: MONO,
        marginBottom: 10 * S,
      }}>
        SBAR Handoff Draft
      </div>

      {/* SBAR card — intentionally dark, visual contrast on warm bg */}
      <div style={{
        background: "#0A1D33",
        border: `1px solid rgba(14,165,183,0.20)`,
        borderRadius: 12 * S,
        padding: `${18 * S}px ${18 * S}px`,
        marginBottom: 12 * S,
        boxShadow: `0 ${3 * S}px ${18 * S}px rgba(0,0,0,0.16)`,
      }}>

        {/* Card header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 16 * S,
        }}>
          <div style={{
            fontSize: 10 * S,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1.6px",
            color: "#22D3EE",
            fontFamily: MONO,
          }}>
            SBAR Handoff
          </div>
          <div style={{
            marginLeft: "auto",
            background: "rgba(5,150,105,0.12)",
            border: `1px solid rgba(5,150,105,0.28)`,
            color: "#34D399",
            borderRadius: 6 * S,
            padding: `${3 * S}px ${9 * S}px`,
            fontSize: 10 * S,
            fontWeight: 600,
            fontFamily: MONO,
            letterSpacing: "0.04em",
          }}>
            Ready to use
          </div>
        </div>

        <SbarRow initial="S" label="Situation" rgbColor="14,165,183">
          I'm calling about my patient in room [X]. Their BP just dropped to 88/50 and their heart rate is up to 122 — they were stable about an hour ago.
        </SbarRow>

        <SbarRow initial="B" label="Background" rgbColor="77,163,255">
          [Age]-year-old admitted for [reason]. Currently on IV fluids and [current medications]. No prior history of hemodynamic instability on this admission.
        </SbarRow>

        <SbarRow initial="A" label="Assessment" rgbColor="217,119,6">
          They're looking more lethargic now and their skin feels slightly cool. I'm concerned — this feels like an acute change from where they were. Something is different.
        </SbarRow>

        <SbarRow initial="R" label="Recommendation" rgbColor="5,150,105" last>
          I'd like you to come assess. In the meantime — are there any orders you'd like me to start, or should I activate rapid response per protocol?
        </SbarRow>

      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 9 * S, marginBottom: 16 * S }}>
        <div style={{
          flex: 1,
          background: "rgba(14,165,183,0.07)",
          border: `1px solid rgba(14,165,183,0.24)`,
          color: C.teal,
          borderRadius: 8 * S,
          padding: `${10 * S}px 0`,
          fontSize: 13 * S,
          fontWeight: 600,
          textAlign: "center" as const,
        }}>
          Copy SBAR
        </div>
        <div style={{
          flex: 1,
          background: "rgba(5,150,105,0.06)",
          border: `1px solid rgba(5,150,105,0.22)`,
          color: C.green,
          borderRadius: 8 * S,
          padding: `${10 * S}px 0`,
          fontSize: 13 * S,
          fontWeight: 600,
          textAlign: "center" as const,
        }}>
          + Save Case
        </div>
      </div>

      {/* Closing note */}
      <div style={{
        borderLeft: `3px solid ${C.teal}`,
        paddingLeft: 14 * S,
        marginBottom: 16 * S,
      }}>
        <p style={{
          color: "rgba(27,36,51,0.52)",
          fontSize: 13 * S,
          lineHeight: 1.65,
          fontStyle: "italic",
          margin: 0,
        }}>
          Ready in seconds. Built for how nurses actually communicate.
        </p>
      </div>

    </div>
  </div>
);
