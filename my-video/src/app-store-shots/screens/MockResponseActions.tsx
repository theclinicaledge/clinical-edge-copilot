import React from "react";
import { C, S, SANS, MONO } from "./tokens";
import { MockHeader } from "./MockHeader";

const Bullet: React.FC<{ accent: string; children: React.ReactNode }> = ({ accent, children }) => (
  <div style={{ display: "flex", gap: 11 * S, marginBottom: 8 * S, alignItems: "flex-start" }}>
    <span style={{ color: accent, fontWeight: 700, flexShrink: 0, fontSize: 14 * S, lineHeight: 1.7, marginTop: 1 * S }}>›</span>
    <span style={{ color: "#BCCDD6", fontSize: 14 * S, lineHeight: 1.7, fontFamily: SANS }}>{children}</span>
  </div>
);

export const MockResponseActions: React.FC = () => (
  <div style={{ background: C.bgApp, width: "100%", fontFamily: SANS }}>
    <MockHeader />

    <div style={{ padding: `${16 * S}px ${16 * S}px 0` }}>

      {/* What I'd do right now */}
      <div style={{
        background: C.bgYellow,
        borderLeft: `3px solid ${C.yellow}`,
        borderRadius: 12 * S,
        padding: `${18 * S}px ${20 * S}px`,
        marginBottom: 10 * S,
        boxShadow: `0 ${2 * S}px ${14 * S}px rgba(0,0,0,0.13)`,
      }}>
        <div style={{
          fontSize: 10 * S,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          color: C.yellow,
          fontFamily: MONO,
          marginBottom: 12 * S,
          opacity: 0.88,
        }}>
          What I'd do right now
        </div>
        <Bullet accent={C.yellow}>Get to the bedside — you need eyes on this patient before anything else</Bullet>
        <Bullet accent={C.yellow}>Notify the provider now — lead with the BP, HR, and how fast it dropped</Bullet>
        <Bullet accent={C.yellow}>Loop in your charge nurse — this isn't a solo call</Bullet>
        <Bullet accent={C.yellow}>Confirm IV access and have fluids ready to run pending orders</Bullet>
      </div>

      {/* Closing */}
      <div style={{
        borderLeft: `3px solid ${C.teal}`,
        paddingLeft: 16 * S,
        margin: `${16 * S}px 0`,
      }}>
        <p style={{
          color: "rgba(168,193,204,0.75)",
          fontSize: 14 * S,
          lineHeight: 1.7,
          fontStyle: "italic",
          margin: 0,
        }}>
          Built for real decisions — not textbook scenarios.
        </p>
      </div>

      {/* Action bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10 * S,
        marginTop: 18 * S,
        paddingTop: 18 * S,
        borderTop: `1px solid rgba(255,255,255,0.07)`,
        flexWrap: "wrap",
      }}>
        {/* Save Case */}
        <div style={{
          background: "rgba(31,191,117,0.04)",
          border: `1px solid rgba(31,191,117,0.22)`,
          color: "#4E9E78",
          borderRadius: 9 * S,
          padding: `${9 * S}px ${20 * S}px`,
          fontSize: 13 * S,
          fontWeight: 600,
          letterSpacing: "-0.1px",
        }}>
          + Save Case
        </div>
        {/* Copy Response */}
        <div style={{
          background: "transparent",
          border: `1px solid rgba(255,255,255,0.08)`,
          color: "#3D5E6E",
          borderRadius: 9 * S,
          padding: `${9 * S}px ${18 * S}px`,
          fontSize: 13 * S,
          fontWeight: 400,
          letterSpacing: "-0.1px",
        }}>
          Copy Response
        </div>
        {/* Turn into SBAR */}
        <div style={{
          marginLeft: "auto",
          background: "transparent",
          border: `1px solid rgba(0,194,209,0.14)`,
          color: "#00A8B5",
          borderRadius: 9 * S,
          padding: `${9 * S}px ${16 * S}px`,
          fontSize: 12 * S,
          fontWeight: 500,
          letterSpacing: "-0.1px",
        }}>
          Turn into SBAR
        </div>
      </div>

      {/* Anything change? */}
      <div style={{
        marginTop: 22 * S,
        background: "linear-gradient(160deg, rgba(0,194,209,0.028) 0%, rgba(0,150,165,0.018) 100%)",
        border: `1px solid rgba(0,194,209,0.12)`,
        borderRadius: 12 * S,
        padding: `${16 * S}px ${18 * S}px`,
      }}>
        <div style={{
          fontSize: 9 * S,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1.3px",
          color: C.teal,
          marginBottom: 10 * S,
          fontFamily: MONO,
        }}>
          Anything change?
        </div>
        <div style={{
          color: C.textHint,
          fontSize: 14 * S,
          lineHeight: 1.6,
          paddingBottom: 8 * S,
          borderBottom: `1px solid rgba(0,194,209,0.12)`,
          marginBottom: 10 * S,
        }}>
          New vitals, labs, or anything different?
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{
            background: "transparent",
            border: `1px solid rgba(255,255,255,0.08)`,
            color: "#3A5566",
            borderRadius: 7 * S,
            padding: `${7 * S}px ${16 * S}px`,
            fontSize: 12 * S,
            fontWeight: 600,
          }}>
            Send update
          </div>
        </div>
      </div>

    </div>
  </div>
);
