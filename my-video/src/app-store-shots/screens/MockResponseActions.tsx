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

interface CardProps {
  label: string;
  accent: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<CardProps> = ({ label, accent, children }) => (
  <div style={{
    background: C.bgCard,
    borderLeft: `3px solid ${accent}`,
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
      color: accent,
      fontFamily: MONO,
      marginBottom: 11 * S,
    }}>
      {label}
    </div>
    {children}
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

const DotRow: React.FC<{ accent: string; children: React.ReactNode }> = ({ accent, children }) => (
  <div style={{ display: "flex", gap: 9 * S, marginBottom: 7 * S, alignItems: "flex-start" }}>
    <span style={{
      display: "inline-block",
      width: 6 * S,
      height: 6 * S,
      borderRadius: "50%",
      background: accent,
      flexShrink: 0,
      marginTop: 5 * S,
    }} />
    <span style={{ color: C.textBody, fontSize: 13 * S, lineHeight: 1.55 }}>{children}</span>
  </div>
);

// ── Main screen ───────────────────────────────────────────────────────────────

export const MockResponseActions: React.FC = () => (
  <div style={{ background: C.bgApp, width: "100%", fontFamily: SANS }}>
    <MockHeader />
    <SafetyStrip />

    <div style={{ padding: `${14 * S}px ${16 * S}px 0` }}>

      {/* Clinical Pattern Recognition */}
      <SectionCard label="Clinical Pattern Recognition" accent={C.blue}>
        <p style={{
          color: C.textBody,
          fontSize: 14 * S,
          lineHeight: 1.70,
          margin: `0 0 ${10 * S}px`,
        }}>
          Hypotension with compensatory tachycardia is a classic shock pattern. The body is attempting to maintain cardiac output by increasing heart rate to offset the falling blood pressure.
        </p>
        <p style={{
          color: "rgba(27,36,51,0.55)",
          fontSize: 13 * S,
          lineHeight: 1.55,
          margin: 0,
        }}>
          The acute onset — stable just an hour ago — is the key clinical signal here.
        </p>
      </SectionCard>

      {/* Immediate Nursing Assessments — green */}
      <SectionCard label="Immediate Nursing Assessments" accent={C.green}>
        <BulletRow accent={C.green}>
          Mental status — oriented and at baseline, or changed since last assessment?
        </BulletRow>
        <BulletRow accent={C.green}>
          Skin — color, temperature, moisture, and capillary refill
        </BulletRow>
        <BulletRow accent={C.green}>
          Work of breathing — rate, effort, accessory muscle use, SpO₂ trend
        </BulletRow>
        <BulletRow accent={C.green}>
          Pain — any new or worsening pain, especially chest or abdomen
        </BulletRow>
        <BulletRow accent={C.green}>
          IV access — confirm patency and gauge; note available lines
        </BulletRow>
        <BulletRow accent={C.green}>
          Urine output — last void or catheter output if applicable
        </BulletRow>
      </SectionCard>

      {/* Possible Clinical Causes — blue */}
      <SectionCard label="Possible Clinical Causes" accent={C.blue}>
        <DotRow accent={C.blue}>Volume depletion — active bleeding, GI losses, poor intake, third-spacing</DotRow>
        <DotRow accent={C.blue}>Septic process — source may not be obvious; temperature and WBC may lag</DotRow>
        <DotRow accent={C.blue}>Acute cardiac event — MI, new arrhythmia, or decompensated pump failure</DotRow>
        <DotRow accent={C.blue}>Pulmonary embolism — sudden onset with risk factors</DotRow>
        <DotRow accent={C.blue}>Medication effect — vasodilators, diuretics, recent sedation or opioids</DotRow>
      </SectionCard>

      {/* Footer */}
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
