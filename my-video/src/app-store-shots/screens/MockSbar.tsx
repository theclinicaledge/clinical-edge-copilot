import React from "react";
import { C, S, SANS, MONO } from "./tokens";
import { MockHeader } from "./MockHeader";

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
    borderBottom: last ? "none" : `1px solid rgba(255,255,255,0.05)`,
  }}>
    {/* Letter badge */}
    <div style={{
      background: `rgba(${rgbColor}, 0.12)`,
      color: `rgba(${rgbColor}, 1)`,
      borderRadius: 7 * S,
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
        color: `rgba(${rgbColor}, 0.80)`,
        fontFamily: MONO,
        marginBottom: 5 * S,
      }}>
        {label}
      </div>
      <div style={{
        color: "#BCCDD6",
        fontSize: 13 * S,
        lineHeight: 1.65,
        fontFamily: SANS,
      }}>
        {children}
      </div>
    </div>
  </div>
);

export const MockSbar: React.FC = () => (
  <div style={{ background: C.bgApp, width: "100%", fontFamily: SANS }}>
    <MockHeader />

    <div style={{ padding: `${16 * S}px ${16 * S}px 0` }}>

      {/* SBAR card */}
      <div style={{
        background: "linear-gradient(160deg, rgba(0,194,209,0.038) 0%, rgba(0,150,165,0.022) 100%)",
        border: `1px solid rgba(0,194,209,0.18)`,
        borderRadius: 14 * S,
        padding: `${20 * S}px ${20 * S}px`,
        marginBottom: 14 * S,
        boxShadow: `0 ${2 * S}px ${18 * S}px rgba(0,0,0,0.18)`,
      }}>

        {/* Card header row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 18 * S,
        }}>
          <div style={{
            fontSize: 10 * S,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1.6px",
            color: C.teal,
            fontFamily: MONO,
          }}>
            SBAR Handoff
          </div>
          <div style={{
            marginLeft: "auto",
            background: "rgba(31,191,117,0.08)",
            border: `1px solid rgba(31,191,117,0.22)`,
            color: "#4E9E78",
            borderRadius: 999,
            padding: `${3 * S}px ${10 * S}px`,
            fontSize: 10 * S,
            fontWeight: 600,
            fontFamily: MONO,
            letterSpacing: "0.04em",
          }}>
            Ready to use
          </div>
        </div>

        <SbarRow initial="S" label="Situation" rgbColor="0,194,209">
          BP dropped to 88/50 and HR is 122. He was stable about an hour ago — this happened fast.
        </SbarRow>

        <SbarRow initial="B" label="Background" rgbColor="77,163,255">
          67-year-old with pneumonia, on IV fluids and antibiotics. No recent procedures or medication changes.
        </SbarRow>

        <SbarRow initial="A" label="Assessment" rgbColor="242,185,75">
          I'm concerned about septic shock. He's tachycardic, hypotensive, and his mental status has been slightly off today.
        </SbarRow>

        <SbarRow initial="R" label="Recommendation" rgbColor="31,191,117" last>
          I need you to come assess him now. IV access is confirmed — do you want me to start fluids or draw additional labs?
        </SbarRow>

      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10 * S, marginBottom: 18 * S }}>
        <div style={{
          flex: 1,
          background: "rgba(0,194,209,0.07)",
          border: `1px solid rgba(0,194,209,0.22)`,
          color: C.teal,
          borderRadius: 10 * S,
          padding: `${11 * S}px ${18 * S}px`,
          fontSize: 13 * S,
          fontWeight: 600,
          textAlign: "center" as const,
        }}>
          Copy SBAR
        </div>
        <div style={{
          flex: 1,
          background: "rgba(31,191,117,0.04)",
          border: `1px solid rgba(31,191,117,0.22)`,
          color: "#4E9E78",
          borderRadius: 10 * S,
          padding: `${11 * S}px ${18 * S}px`,
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
        paddingLeft: 16 * S,
        margin: `${4 * S}px 0`,
      }}>
        <p style={{
          color: "rgba(168,193,204,0.65)",
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
