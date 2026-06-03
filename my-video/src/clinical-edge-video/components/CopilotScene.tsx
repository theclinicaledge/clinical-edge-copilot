import React from "react";
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig,
  Img, staticFile, interpolate, spring,
} from "remotion";
import { T } from "../tokens";
import { GrainOverlay } from "./GrainOverlay";
import { ClinicalScenario } from "../data/scenarios";

// ─── Phone frame layout constants ─────────────────────────────────────────────
// Mobile screenshots: 1170×2532 (390×844 viewport @ 3x deviceScaleFactor)
// PNG ratio: 2532/1170 = 2.1641
//
// Display CSS size:
//   width  = 880px  (81.5% of 1080px video width)
//   height = 880 × 2.1641 = 1904px  (fits in 1920px video)
//
// Phone frame positioned centered:
//   left = (1080 - 880) / 2 = 100px
//   top  = (1920 - 1904) / 2 = 8px

const PHONE_W  = 880;
const PHONE_H  = 1904;   // 880 × (2532/1170)
const PHONE_X  = 100;    // centered: (1080 - 880) / 2
const PHONE_Y  = 8;      // centered: (1920 - 1904) / 2
const RADIUS   = 46;     // iPhone 14 Pro corner radius

// ─── Dynamic Island pill ──────────────────────────────────────────────────────
// Pixel-positions in the 3x screenshot → at 2.256x CSS scale:
// Original 390px viewport: island ≈ centered, y≈14px, w≈110px, h≈28px
// At CSS display scale (880/390=2.256): y≈32px, w≈248px... too big.
// Better: use a fixed design island at the top of our phone frame.
const ISLAND_W   = 110;   // CSS pixels in video
const ISLAND_H   = 28;
const ISLAND_Y   = 16;    // from top of phone screen area

// ─── Scene ────────────────────────────────────────────────────────────────────
// Timeline within this 210-frame (7s) sequence:
//   0–22:   phone enters — springs up from below + scale 85%→100%
//  22–70:   empty screenshot (input state) — corner label fades in
//  70–100:  crossfade empty → response screenshot
// 100–210:  response screenshot, very slow upward pan to reveal output cards

interface Props { scenario: ClinicalScenario }

export const CopilotScene: React.FC<Props> = ({ scenario }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Phone enters: springs up from below, scale 86%→100%
  const enterSpring = spring({ frame: Math.max(0, frame), fps, config: { damping: 26, stiffness: 85, mass: 1.3 } });
  const enterY     = interpolate(enterSpring, [0, 1], [220, 0]);
  const enterScale = interpolate(enterSpring, [0, 1], [0.86, 1.0]);

  // Very subtle breathing tilt (±0.4°) for depth
  const tilt = interpolate(Math.sin(frame * 0.018), [-1, 1], [-0.4, 0.4]);

  // Empty screenshot opacity — visible until crossfade
  const emptyOpacity = interpolate(frame, [70, 96], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Response screenshot opacity — fades in during crossfade
  const responseOpacity = interpolate(frame, [72, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Slow upward pan on response — 0 to -110px over the second half of the scene
  const scrollY = interpolate(frame, [110, durationInFrames - 10], [0, -110], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Corner label fades in, then fades out when response appears
  const labelIn  = interpolate(frame, [18, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelOut = interpolate(frame, [68, 80], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelOpacity = labelIn * labelOut;

  // Background glow pulses
  const glow = interpolate(Math.sin(frame * 0.022), [-1, 1], [0.05, 0.11]);

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut, backgroundColor: T.pageBg, overflow: "hidden" }}>

      {/* ── Dark BG with ambient teal bloom ── */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        width: 1000, height: 1000, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(10,191,188,${glow.toFixed(3)}) 0%, transparent 55%)`,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }} />

      <GrainOverlay opacity={0.020} />

      {/* ── Phone frame wrapper — spring entrance ── */}
      <div style={{
        position: "absolute",
        left: PHONE_X,
        top: PHONE_Y,
        width: PHONE_W,
        height: PHONE_H,
        transform: `translateY(${enterY}px) scale(${enterScale}) rotate(${tilt}deg)`,
        transformOrigin: "50% 50%",
        willChange: "transform",
      }}>

        {/* Phone shell */}
        <div style={{
          position: "absolute",
          inset: 0,
          borderRadius: RADIUS,
          border: "1.5px solid rgba(255,255,255,0.14)",
          boxShadow: [
            "0 60px 140px rgba(0,0,0,0.75)",
            "0 20px 60px rgba(0,0,0,0.50)",
            "0 0 0 1px rgba(0,0,0,0.8)",
            `0 0 80px rgba(10,191,188,0.08)`,
          ].join(", "),
          overflow: "hidden",
          background: "#0B0F17",
        }}>

          {/* ── Empty state screenshot ── */}
          <div style={{
            position: "absolute", inset: 0,
            opacity: emptyOpacity,
          }}>
            <Img
              src={staticFile("screenshots/mobile-copilot-empty.png")}
              style={{ width: PHONE_W, height: PHONE_H, display: "block" }}
            />
          </div>

          {/* ── Response screenshot with pan ── */}
          <div style={{
            position: "absolute", inset: 0,
            opacity: responseOpacity,
            transform: `translateY(${scrollY}px)`,
            willChange: "transform",
          }}>
            <Img
              src={staticFile("screenshots/mobile-copilot-response.png")}
              style={{ width: PHONE_W, height: PHONE_H, display: "block" }}
            />
          </div>

          {/* Dynamic Island — sits on top of screenshot */}
          <div style={{
            position: "absolute",
            top: ISLAND_Y,
            left: "50%",
            transform: "translateX(-50%)",
            width: ISLAND_W,
            height: ISLAND_H,
            borderRadius: ISLAND_H / 2,
            background: "#000000",
            zIndex: 10,
          }} />

          {/* Specular edge highlight — top-left shine */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 30%)",
            borderRadius: RADIUS,
            pointerEvents: "none",
            zIndex: 11,
          }} />

        </div>

        {/* Screen-edge glow ring behind the phone */}
        <div style={{
          position: "absolute",
          inset: -1,
          borderRadius: RADIUS + 2,
          background: "transparent",
          boxShadow: `0 0 40px rgba(10,191,188,0.14)`,
          pointerEvents: "none",
        }} />

      </div>

      {/* ── Corner label — "Clinical Edge Copilot" — fades out when response shows ── */}
      <div style={{
        position: "absolute",
        top: 34,
        left: 0, right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: labelOpacity,
        pointerEvents: "none",
      }}>
        <span style={{
          fontSize: 20,
          fontWeight: 500,
          color: "rgba(248,251,252,0.60)",
          fontFamily: T.mono,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          background: "rgba(17,24,39,0.55)",
          padding: "6px 20px",
          borderRadius: 99,
          backdropFilter: "blur(8px)",
        }}>
          {scenario.scenarioLabel}
        </span>
      </div>

      {/* Left + right soft shadow to blend phone edges into dark BG */}
      <div style={{
        position: "absolute", inset: 0,
        background: `
          linear-gradient(90deg, ${T.pageBg} 0px, transparent ${PHONE_X - 10}px),
          linear-gradient(-90deg, ${T.pageBg} 0px, transparent ${PHONE_X - 10}px)
        `,
        pointerEvents: "none",
      }} />

    </AbsoluteFill>
  );
};
