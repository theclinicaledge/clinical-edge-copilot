import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { SHOTS, type ShotConfig } from "./shots.config";

// ─── Design tokens (match frontend exactly) ────────────────────────────────────
const BG    = "#0A1B26";
const TEAL  = "#00C2D1";
const WHITE = "#F8FBFC";
const MUTED = "rgba(168,193,204,0.72)";

// System font stack — uses SF Pro Display on macOS (where rendering runs).
// Fallback is clean Helvetica Neue / system-ui on other platforms.
const FONT_SANS = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", system-ui, sans-serif';
const FONT_MONO = '"IBM Plex Mono", "SF Mono", "Courier New", monospace';

// ─── CE Logo SVG (exact paths from the live app) ───────────────────────────────
const CELogo: React.FC = () => (
  <svg
    width="42"
    height="37"
    viewBox="0 0 225 200"
    xmlns="http://www.w3.org/2000/svg"
    fill={TEAL}
    aria-label="Clinical Edge"
  >
    <path d="M 159.1,24.3 A 96,96 0 1,0 159.1,175.7 L 135.7,145.7 A 58,58 0 1,1 135.7,54.3 Z" />
    <path d="M 144.0,57 L 208,45 L 218,58 L 208,70 L 150.0,71 Z" />
    <path d="M 158.0,92 L 215,82 L 225,95 L 215,107 L 158.0,108 Z" />
    <path d="M 150.0,129 L 208,130 L 218,142 L 208,155 L 144.0,143 Z" />
  </svg>
);

// ─── Layout constants ─────────────────────────────────────────────────────────
//
// Canvas: 1290 × 2796 (App Store 6.7" display size)
//
// Text zone:       0 → SCREENSHOT_TOP  (dark background, brand + copy)
// Gradient bridge: GRADIENT_START → SCREENSHOT_TOP + GRADIENT_H  (seamless fade)
// Screenshot zone: SCREENSHOT_TOP → 2796  (real screenshot, overflow-hidden crop)
//
const SCREENSHOT_TOP = 680;   // px where screenshot container begins
const GRADIENT_H     = 100;   // height of the top-of-screenshot gradient fade
const PAD_H          = 72;    // horizontal padding for text zone
const BOTTOM_FADE_H  = 140;   // bottom gradient height (softens screenshot crop)

// ─── Main component ────────────────────────────────────────────────────────────
export const AppStoreShot: React.FC<{ slideIndex: number }> = ({ slideIndex }) => {
  const config: ShotConfig = SHOTS[slideIndex] ?? SHOTS[0];

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: FONT_SANS, overflow: "hidden" }}>

      {/* ── Top glow — adds the subtle depth the app uses ── */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: 500,
        background: "radial-gradient(ellipse 90% 50% at 50% 0%, rgba(0,194,209,0.13) 0%, transparent 72%)",
        pointerEvents: "none",
      }} />

      {/* ── Brand mark ── */}
      <div style={{
        position: "absolute",
        top: 80,
        left: PAD_H,
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}>
        <CELogo />
        <div>
          <div style={{
            color: WHITE,
            fontSize: 26,
            fontWeight: 600,
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
            opacity: 0.85,
          }}>
            COPILOT
          </div>
        </div>
      </div>

      {/* ── Text content zone ── */}
      <div style={{
        position: "absolute",
        top: 210,
        left: PAD_H,
        right: PAD_H,
      }}>

        {/* Eyebrow */}
        {config.eyebrow && (
          <div style={{
            color: TEAL,
            fontFamily: FONT_MONO,
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: "2.8px",
            textTransform: "uppercase",
            marginBottom: 26,
            opacity: 0.88,
          }}>
            {config.eyebrow}
          </div>
        )}

        {/* Headline — the hero element */}
        <div style={{
          color: WHITE,
          fontSize: 84,
          fontWeight: 800,
          lineHeight: 1.03,
          letterSpacing: "-0.038em",
          marginBottom: 32,
          whiteSpace: "pre-line",
        }}>
          {config.headline}
        </div>

        {/* Subtext */}
        <div style={{
          color: MUTED,
          fontSize: 30,
          fontWeight: 400,
          lineHeight: 1.55,
          letterSpacing: "-0.01em",
          maxWidth: 1080,
        }}>
          {config.subtext}
        </div>
      </div>

      {/* ── Screenshot container ── */}
      <div style={{
        position: "absolute",
        top: SCREENSHOT_TOP,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
      }}>
        {/* Gradient bridge — fades from background color into screenshot */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: GRADIENT_H,
          background: `linear-gradient(to bottom, ${BG} 0%, transparent 100%)`,
          zIndex: 2,
          pointerEvents: "none",
        }} />

        {/* The real screenshot */}
        <Img
          src={staticFile(`screenshots/${config.screenshotFile}`)}
          style={{
            width: "100%",
            display: "block",
            transform: `translateY(-${config.scrollY}px)`,
          }}
        />
      </div>

      {/* ── Bottom fade — softens the screenshot's lower crop edge ── */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: BOTTOM_FADE_H,
        background: `linear-gradient(to top, rgba(10,27,38,0.88) 0%, transparent 100%)`,
        pointerEvents: "none",
        zIndex: 10,
      }} />

    </AbsoluteFill>
  );
};
