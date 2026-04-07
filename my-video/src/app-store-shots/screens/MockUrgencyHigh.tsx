import React from "react";
import { C, S, SANS, MONO } from "./tokens";
import { MockHeader } from "./MockHeader";

interface SectionCardProps {
  label: string;
  accent: string;
  bg: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ label, accent, bg, children }) => (
  <div style={{
    background: bg,
    borderLeft: `${3}px solid ${accent}`,
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
      color: accent,
      fontFamily: MONO,
      marginBottom: 12 * S,
      opacity: 0.88,
    }}>
      {label}
    </div>
    {children}
  </div>
);

const Bullet: React.FC<{ accent: string; children: React.ReactNode }> = ({ accent, children }) => (
  <div style={{ display: "flex", gap: 11 * S, marginBottom: 8 * S, alignItems: "flex-start" }}>
    <span style={{ color: accent, fontWeight: 700, flexShrink: 0, fontSize: 14 * S, lineHeight: 1.7, marginTop: 1 * S }}>›</span>
    <span style={{ color: "#BCCDD6", fontSize: 14 * S, lineHeight: 1.7, fontFamily: SANS }}>{children}</span>
  </div>
);

export const MockUrgencyHigh: React.FC = () => (
  <div style={{ background: C.bgApp, width: "100%", fontFamily: SANS }}>
    <MockHeader />

    <div style={{ padding: `${16 * S}px ${16 * S}px 0` }}>

      {/* Urgency badge */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10 * S,
        background: C.urgHighBg,
        border: `1px solid ${C.urgHighBorder}`,
        borderRadius: 10 * S,
        padding: `${10 * S}px ${16 * S}px`,
        marginBottom: 16 * S,
      }}>
        <span style={{
          width: 7 * S,
          height: 7 * S,
          borderRadius: "50%",
          background: C.urgHigh,
          flexShrink: 0,
          boxShadow: `0 0 ${7 * S}px ${C.urgHigh}99`,
          display: "inline-block",
        }} />
        <span style={{
          fontSize: 11 * S,
          fontWeight: 700,
          color: C.urgHigh,
          fontFamily: MONO,
          letterSpacing: "1.2px",
          textTransform: "uppercase",
        }}>
          Urgency: High
        </span>
      </div>

      {/* Warning box */}
      <div style={{
        background: C.amberBg,
        border: `1px solid ${C.amberBorder}`,
        borderRadius: 10 * S,
        padding: `${12 * S}px ${16 * S}px`,
        marginBottom: 20 * S,
        display: "flex",
        gap: 10 * S,
        alignItems: "flex-start",
      }}>
        <span style={{ fontSize: 16 * S, lineHeight: 1.4, flexShrink: 0 }}>⚠️</span>
        <span style={{
          color: C.amberText,
          fontSize: 13 * S,
          lineHeight: 1.55,
          fontWeight: 500,
        }}>
          This may represent acute clinical deterioration.{"\n"}Prioritize immediate bedside assessment and escalation.
        </span>
      </div>

      {/* What this could be */}
      <SectionCard label="What this could be" accent={C.blue} bg={C.bgBlue}>
        <p style={{ color: "#BCCDD6", fontSize: 14 * S, lineHeight: 1.75, margin: `0 0 ${10 * S}px`, fontFamily: SANS }}>
          Rapid BP drop with compensatory tachycardia — the body is working to maintain perfusion.
        </p>
        <p style={{ color: "#BCCDD6", fontSize: 13 * S, lineHeight: 1.6, margin: `0 0 ${6 * S}px`, fontFamily: SANS, opacity: 0.85 }}>
          Could be:
        </p>
        {["Volume loss (bleeding or third-spacing)", "Sepsis catching up", "Cardiac event", "PE"].map((item) => (
          <div key={item} style={{ display: "flex", gap: 8 * S, marginBottom: 5 * S, alignItems: "flex-start" }}>
            <span style={{ color: C.blue, fontSize: 11 * S, flexShrink: 0, marginTop: 3 * S }}>•</span>
            <span style={{ color: "#BCCDD6", fontSize: 13 * S, lineHeight: 1.5, fontFamily: SANS }}>{item}</span>
          </div>
        ))}
      </SectionCard>

      {/* What concerns me most */}
      <SectionCard label="What concerns me most" accent={C.red} bg={C.bgRed}>
        <Bullet accent={C.red}>Compensation is active right now — when it breaks, the drop accelerates</Bullet>
        <Bullet accent={C.red}>The trajectory is the red flag: stable an hour ago is the part I'm not ignoring</Bullet>
        <Bullet accent={C.red}>Any mental status change or labored breathing and this escalates fast</Bullet>
      </SectionCard>

    </div>
  </div>
);
