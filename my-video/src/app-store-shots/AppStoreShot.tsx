import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { SHOTS, type ShotConfig } from "./shots.config";

// ─── Clinical Edge master palette ─────────────────────────────────────────────
const BG        = "#E7E2D8";   // warm background — same as real app content bg
const NAVY      = "#162033";   // primary headline text
const SECONDARY = "#5D687C";   // secondary / subtext
const TEAL      = "#19C2D1";   // accent — matches real app teal
const FONT_SANS = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", system-ui, sans-serif';
const FONT_MONO = '"IBM Plex Mono", "SF Mono", "Courier New", monospace';

// ─── Layout constants ──────────────────────────────────────────────────────────
//
// Canvas:     1284 × 2778 px
// Top zone:   0 → PHONE_TOP — warm bg, brand mark + headline + subtext
// Shot zone:  PHONE_TOP → bottom — real app screenshot, rounded top corners
//
const PHONE_TOP = 700;   // px where the screenshot begins
const PAD_H     = 80;    // horizontal text padding

// ─── CE Logo ──────────────────────────────────────────────────────────────────
const CELogo: React.FC = () => (
  <svg
    width="44"
    height="39"
    viewBox="0 0 225 200"
    xmlns="http://www.w3.org/2000/svg"
    fill={TEAL}
    aria-label="Clinical Edge"
  >
    <path d="M 159.1,24.3 A 96,96 0 1,0 159.1,175.7 L 135.7,145.7 A 58,58 0 1,1 135.7,54.3 Z"/>
    <path d="M 144.0,57 L 208,45 L 218,58 L 208,70 L 150.0,71 Z"/>
    <path d="M 158.0,92 L 215,82 L 225,95 L 215,107 L 158.0,108 Z"/>
    <path d="M 150.0,129 L 208,130 L 218,142 L 208,155 L 144.0,143 Z"/>
  </svg>
);

// ─── Main composition ──────────────────────────────────────────────────────────
//
// Layout:
//   Top zone   — warm #E7E2D8 background, brand mark, headline, subtext
//   Shot zone  — real app screenshot embedded via staticFile()
//   Fade       — bottom edge gradient for a clean crop
//
// Screenshot files must be placed in  my-video/public/screenshots/
// See shots.config.ts for filename mapping.
//
export const AppStoreShot: React.FC<{ slideIndex: number }> = ({ slideIndex }) => {
  const config: ShotConfig = SHOTS[slideIndex] ?? SHOTS[0];

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: FONT_SANS, overflow: "hidden" }}>

      {/* ── Very subtle teal ambient glow from top ── */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: PHONE_TOP + 220,
        background: "radial-gradient(ellipse 75% 55% at 50% -8%, rgba(25,194,209,0.07) 0%, transparent 68%)",
        pointerEvents: "none",
      }} />

      {/* ── Brand mark — CE logo + name ── */}
      <div style={{
        position: "absolute",
        top: 96,
        left: PAD_H,
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}>
        <CELogo />
        <span style={{
          color: TEAL,
          fontFamily: FONT_MONO,
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: "3.5px",
          textTransform: "uppercase",
        }}>
          Clinical Edge
        </span>
      </div>

      {/* ── Marketing headline + subtext ── */}
      <div style={{
        position: "absolute",
        top: 218,
        left: PAD_H,
        right: PAD_H,
      }}>
        {/* Headline — large, dark, sharp */}
        <div style={{
          color: NAVY,
          fontSize: 84,
          fontWeight: 800,
          lineHeight: 1.03,
          letterSpacing: "-0.040em",
          whiteSpace: "pre-line",
          marginBottom: 26,
        }}>
          {config.headline}
        </div>

        {/* Subtext */}
        <div style={{
          color: SECONDARY,
          fontSize: 33,
          fontWeight: 400,
          lineHeight: 1.52,
          letterSpacing: "-0.010em",
          maxWidth: 980,
        }}>
          {config.subtext}
        </div>
      </div>

      {/* ── Real app screenshot ── */}
      {/* Rounded top corners give the "card dropping in from below" effect.     */}
      {/* The screenshot fills canvas width; excess height is clipped at bottom. */}
      <div style={{
        position: "absolute",
        top: PHONE_TOP,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: "36px 36px 0 0",
        overflow: "hidden",
        boxShadow: "0 -22px 80px rgba(0,0,0,0.10), 0 -5px 24px rgba(0,0,0,0.07)",
      }}>
        <Img
          src={staticFile(config.shotFile)}
          style={{ width: "100%", display: "block" }}
        />
      </div>

      {/* ── Bottom-edge fade — softens the lower crop ── */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: 140,
        background: `linear-gradient(to top, ${BG} 0%, transparent 100%)`,
        pointerEvents: "none",
        zIndex: 10,
      }} />

    </AbsoluteFill>
  );
};
