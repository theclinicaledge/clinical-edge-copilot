import React from "react";
import { C, S, SANS, MONO } from "./tokens";

const CELogo: React.FC = () => (
  <svg width={26 * S} height={23 * S} viewBox="0 0 225 200" fill={C.teal} aria-hidden>
    <path d="M 159.1,24.3 A 96,96 0 1,0 159.1,175.7 L 135.7,145.7 A 58,58 0 1,1 135.7,54.3 Z" />
    <path d="M 144.0,57 L 208,45 L 218,58 L 208,70 L 150.0,71 Z" />
    <path d="M 158.0,92 L 215,82 L 225,95 L 215,107 L 158.0,108 Z" />
    <path d="M 150.0,129 L 208,130 L 218,142 L 208,155 L 144.0,143 Z" />
  </svg>
);

export const MockHeader: React.FC = () => (
  <div style={{
    background: "rgba(11,31,42,0.97)",
    borderBottom: `1px solid rgba(255,255,255,0.05)`,
    display: "flex",
    alignItems: "center",
    gap: 11 * S,
    padding: `${17 * S}px ${16 * S}px ${14 * S}px`,
  }}>
    {/* Logo + name — left-aligned, exactly as in the real app */}
    <CELogo />
    <div>
      <div style={{
        color: C.textPrimary,
        fontFamily: SANS,
        fontSize: 16 * S,
        fontWeight: 600,
        letterSpacing: "-0.01em",
        lineHeight: 1.2,
      }}>
        Clinical Edge
      </div>
      <div style={{
        color: C.teal,
        fontFamily: MONO,
        fontSize: 10 * S,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginTop: 2 * S,
      }}>
        COPILOT
      </div>
    </div>

    {/* BETA + Learn more — right-aligned */}
    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 * S }}>
      <div style={{
        border: `1px solid ${C.teal}`,
        color: C.teal,
        fontFamily: MONO,
        fontSize: 10 * S,
        fontWeight: 600,
        padding: `${3 * S}px ${8 * S}px`,
        borderRadius: 999,
        letterSpacing: "0.05em",
      }}>
        BETA
      </div>
      <div style={{
        color: "rgba(168,193,204,0.5)",
        fontFamily: SANS,
        fontSize: 13 * S,
      }}>
        Learn more
      </div>
    </div>
  </div>
);
