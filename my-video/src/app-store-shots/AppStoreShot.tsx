import React from "react";
import { AbsoluteFill } from "remotion";
import { SHOTS, type ShotConfig } from "./shots.config";
import { MockHomeInput }       from "./screens/MockHomeInput";
import { MockUrgencyHigh }     from "./screens/MockUrgencyHigh";
import { MockResponseActions } from "./screens/MockResponseActions";
import { MockQuickQuestions }  from "./screens/MockQuickQuestions";
import { MockSbar }            from "./screens/MockSbar";

// ─── Screen components indexed by slide ───────────────────────────────────────
const SCREENS = [
  MockHomeInput,
  MockUrgencyHigh,
  MockResponseActions,
  MockQuickQuestions,
  MockSbar,
];

// ─── Design tokens ─────────────────────────────────────────────────────────────
//
// Outer marketing layer  →  warm stone/cream — clearly distinct from the app UI
// Phone card (app area)  →  dark navy — app stays premium and dark inside
//
const BG_OUTER   = "#F0ECE6";               // warm stone/cream marketing bg
const PHONE_BG   = "#0B1F2A";              // dark navy inside phone card
const HEADLINE   = "#091422";              // near-black navy — high contrast on cream
const BODY_TEXT  = "#3B5468";              // medium navy — subtext on cream
const TEAL       = "#00B8C8";              // slightly deeper teal, legible on cream
const TEAL_VIVID = "#00C2D1";              // full teal for logo fill

const FONT_SANS  = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", system-ui, sans-serif';
const FONT_MONO  = '"IBM Plex Mono", "SF Mono", "Courier New", monospace';

// ─── Layout constants ─────────────────────────────────────────────────────────
//
// Canvas:    1290 × 2796  (App Store 6.7" display)
// Top zone:  0 → PHONE_TOP  — warm bg, brand mark + marketing copy
// Phone card: PHONE_TOP → bottom  — full-width dark card (rounded top corners)
//             Visually simulates a device frame, clearly separates app from bg
//
const PHONE_TOP   = 710;   // px where the dark phone card begins
const PAD_H       = 72;    // horizontal text padding
const GRADIENT_H  = 100;   // gradient bridge height inside phone card
const BOTTOM_FADE = 140;   // bottom edge fade height

// ─── CE Logo SVG ──────────────────────────────────────────────────────────────
const CELogo: React.FC = () => (
  <svg
    width="42"
    height="37"
    viewBox="0 0 225 200"
    xmlns="http://www.w3.org/2000/svg"
    fill={TEAL_VIVID}
    aria-label="Clinical Edge"
  >
    <path d="M 159.1,24.3 A 96,96 0 1,0 159.1,175.7 L 135.7,145.7 A 58,58 0 1,1 135.7,54.3 Z" />
    <path d="M 144.0,57 L 208,45 L 218,58 L 208,70 L 150.0,71 Z" />
    <path d="M 158.0,92 L 215,82 L 225,95 L 215,107 L 158.0,108 Z" />
    <path d="M 150.0,129 L 208,130 L 218,142 L 208,155 L 144.0,143 Z" />
  </svg>
);

// ─── Main component ────────────────────────────────────────────────────────────
export const AppStoreShot: React.FC<{ slideIndex: number }> = ({ slideIndex }) => {
  const config: ShotConfig = SHOTS[slideIndex] ?? SHOTS[0];
  const Screen = SCREENS[slideIndex] ?? SCREENS[0];

  return (
    <AbsoluteFill style={{ background: BG_OUTER, fontFamily: FONT_SANS, overflow: "hidden" }}>

      {/* ── Very subtle teal tint from top — ties the brand into the warm bg ── */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: 520,
        background: "radial-gradient(ellipse 80% 55% at 50% -5%, rgba(0,194,209,0.09) 0%, transparent 72%)",
        pointerEvents: "none",
      }} />

      {/* ── Brand mark — dark navy text on cream bg ── */}
      <div style={{
        position: "absolute",
        top: 82,
        left: PAD_H,
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}>
        <CELogo />
        <div>
          <div style={{
            color: HEADLINE,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.022em",
            lineHeight: 1.1,
          }}>
            Clinical Edge
          </div>
          <div style={{
            color: TEAL,
            fontSize: 13,
            fontFamily: FONT_MONO,
            letterSpacing: "3px",
            textTransform: "uppercase",
            marginTop: 3,
            opacity: 0.90,
          }}>
            COPILOT
          </div>
        </div>
      </div>

      {/* ── Marketing copy — headline + eyebrow + subtext on cream bg ── */}
      <div style={{
        position: "absolute",
        top: 218,
        left: PAD_H,
        right: PAD_H,
      }}>

        {/* Eyebrow */}
        {config.eyebrow && (
          <div style={{
            color: TEAL,
            fontFamily: FONT_MONO,
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "2.6px",
            textTransform: "uppercase",
            marginBottom: 28,
            opacity: 0.82,
          }}>
            {config.eyebrow}
          </div>
        )}

        {/* Headline — dark navy, large, sharp */}
        <div style={{
          color: HEADLINE,
          fontSize: 86,
          fontWeight: 800,
          lineHeight: 1.03,
          letterSpacing: "-0.040em",
          marginBottom: 30,
          whiteSpace: "pre-line",
        }}>
          {config.headline}
        </div>

        {/* Subtext */}
        <div style={{
          color: BODY_TEXT,
          fontSize: 30,
          fontWeight: 400,
          lineHeight: 1.55,
          letterSpacing: "-0.01em",
          maxWidth: 1100,
        }}>
          {config.subtext}
        </div>
      </div>

      {/* ── Phone card — full width, rounded top, dark ── */}
      {/* Creates clear visual separation: warm marketing bg → dark premium app */}
      <div style={{
        position: "absolute",
        top: PHONE_TOP,
        left: 0,
        right: 0,
        bottom: 0,
        background: PHONE_BG,
        borderRadius: "58px 58px 0 0",
        overflow: "hidden",
        boxShadow: "0 -12px 72px rgba(0,0,0,0.20), 0 -3px 28px rgba(0,0,0,0.14)",
      }}>

        {/* Dynamic island pill — centered at top of card, mimics iPhone */}
        <div style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 128,
          height: 34,
          background: "#040C14",
          borderRadius: "0 0 20px 20px",
          zIndex: 5,
        }} />

        {/* Gradient bridge — fades phone bg colour into the app content below */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: GRADIENT_H,
          background: `linear-gradient(to bottom, ${PHONE_BG} 0%, transparent 100%)`,
          zIndex: 2,
          pointerEvents: "none",
        }} />

        {/* App screen — code-driven mock, renders at full card width */}
        <Screen />

      </div>

      {/* ── Bottom edge fade — softens the lower crop ── */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: BOTTOM_FADE,
        background: "linear-gradient(to top, rgba(10,19,30,0.94) 0%, transparent 100%)",
        pointerEvents: "none",
        zIndex: 10,
      }} />

    </AbsoluteFill>
  );
};
