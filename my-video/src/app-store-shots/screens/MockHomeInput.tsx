import React from "react";
import { C, S, SANS, MONO } from "./tokens";
import { MockHeader } from "./MockHeader";

const CHIPS = [
  "Something feels off", "Before you call", "Medication question",
  "Explain to the patient", "Precautions / wound / device",
];

const EXAMPLES = [
  "QTc is 520, patient just got Zofran. Should I be worried?",
  "How do I explain why we're keeping them NPO for an ileus?",
  "BP dropped to 88/50, HR 122, was stable an hour ago — help me think through this before I call.",
  "Just got report — new confusion, sodium 118, poor PO intake. What matters most first?",
];

export const MockHomeInput: React.FC = () => (
  <div style={{ background: C.bgApp, width: "100%", fontFamily: SANS }}>
    <MockHeader />

    {/* Hero */}
    <div style={{ padding: `${36 * S}px ${18 * S}px ${0}px`, textAlign: "center" }}>
      <div style={{
        color: C.textPrimary,
        fontSize: 30 * S,
        fontWeight: 700,
        letterSpacing: "-0.025em",
        lineHeight: 1.15,
        marginBottom: 10 * S,
      }}>
        Clinical reasoning support for nurses.
      </div>
      <div style={{
        color: "rgba(230,238,242,0.82)",
        fontSize: 16 * S,
        lineHeight: 1.4,
        marginBottom: 24 * S,
        letterSpacing: "-0.01em",
      }}>
        When something feels off. Before you call.
      </div>
    </div>

    {/* Input card */}
    <div style={{
      margin: `0 ${16 * S}px`,
      background: "linear-gradient(160deg, rgba(20,48,66,0.99) 0%, rgba(15,35,50,0.99) 100%)",
      border: `1px solid rgba(255,255,255,0.13)`,
      borderRadius: 14 * S,
      padding: 22 * S,
      boxShadow: `0 ${14 * S}px ${40 * S}px rgba(0,0,0,0.26)`,
    }}>
      {/* Filled text */}
      <div style={{
        color: C.textPrimary,
        fontSize: 14 * S,
        lineHeight: 1.6,
        paddingBottom: 8 * S,
        borderBottom: `1px solid rgba(255,255,255,0.09)`,
        marginBottom: 14 * S,
        letterSpacing: "-0.01em",
      }}>
        BP dropped to 88/50, HR 122, was stable an hour ago — help me think through this before I call.
      </div>
      {/* Action row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ color: C.textHint, fontFamily: MONO, fontSize: 11 * S, letterSpacing: "0.02em" }}>
          ⌘ + Enter
        </div>
        <div style={{
          background: C.teal,
          color: "#0B1F2A",
          borderRadius: 9 * S,
          padding: `${10 * S}px ${22 * S}px`,
          fontSize: 15 * S,
          fontWeight: 700,
          letterSpacing: "-0.01em",
        }}>
          Ask Copilot
        </div>
      </div>
    </div>

    {/* Helper line */}
    <div style={{
      padding: `${13 * S}px ${18 * S}px ${16 * S}px`,
      fontSize: 13 * S,
      color: "rgba(200,214,222,0.70)",
      lineHeight: 1.5,
    }}>
      Used by nurses during real patient care.
    </div>

    {/* Context chips */}
    <div style={{ padding: `0 ${18 * S}px ${18 * S}px` }}>
      <div style={{
        fontSize: 11 * S,
        color: "rgba(168,188,198,0.28)",
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
            border: `1px solid rgba(255,255,255,0.055)`,
            color: "rgba(168,193,204,0.30)",
            borderRadius: 999,
            padding: `${3 * S}px ${10 * S}px`,
            fontSize: 11 * S,
            whiteSpace: "nowrap",
          }}>
            {chip}
          </span>
        ))}
      </div>
    </div>

    {/* Examples */}
    <div style={{ padding: `0 ${18 * S}px ${24 * S}px` }}>
      <div style={{
        fontSize: 11 * S,
        fontWeight: 500,
        letterSpacing: "0.09em",
        textTransform: "uppercase",
        color: "rgba(168,188,198,0.45)",
        marginBottom: 8 * S,
        fontFamily: MONO,
      }}>
        Examples
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 * S }}>
        {EXAMPLES.map((ex) => (
          <div key={ex} style={{
            background: "rgba(255,255,255,0.025)",
            border: `1px solid rgba(255,255,255,0.07)`,
            color: "rgba(168,193,204,0.70)",
            padding: `${10 * S}px ${14 * S}px`,
            borderRadius: 10 * S,
            fontSize: 13 * S,
            lineHeight: 1.45,
            display: "flex",
            alignItems: "flex-start",
            gap: 10 * S,
          }}>
            <span style={{ color: "rgba(0,194,209,0.35)", fontSize: 10 * S, flexShrink: 0, marginTop: 2 * S }}>▶</span>
            {ex}
          </div>
        ))}
      </div>
    </div>
  </div>
);
