import React from "react";
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig,
  spring, interpolate,
} from "remotion";
import { CELogo } from "../../clinical-edge-video/components/CELogo";
import { AppFlutterStrip } from "./AppFlutterStrip";

const RL = {
  bgBase:      "#111827",
  bgSurface:   "#1E2A3A",
  textPrimary: "#F0EDE6",
  textSec:     "#94A3B8",
  accent:      "#0ABFBC",
  urgentOrange:"#f97316",
  border:      "#2D3B4E",
  fontSans:    "'IBM Plex Sans', system-ui, sans-serif",
  fontMono:    "'IBM Plex Mono', monospace",
};

// ─── Safe-zone layout constants ───────────────────────────────────────────────
const SAFE_TOP    = 140;
const SAFE_BOTTOM = 220;
const BRAND_H     = 60;
const STRIP_TOP   = SAFE_TOP + BRAND_H;   // 200
const STRIP_H     = 300;                  // shorter — reveal panel is the hero
const STRIP_END   = STRIP_TOP + STRIP_H;  // 500
const PANEL_BOT   = 1920 - SAFE_BOTTOM;   // 1700

const SPR = { damping: 20, stiffness: 120, mass: 1.0 };

export const RevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const brandOp = interpolate(frame, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Diagnosis card — springs in at frame 12
  const hF  = Math.max(0, frame - 12);
  const hSp = spring({ frame: hF, fps, config: SPR });
  const hY  = interpolate(hSp, [0, 1], [36, 0]);
  const hSc = interpolate(hSp, [0, 1], [0.90, 1.0]);
  const hOp = interpolate(hF, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  // Teal glow on diagnosis name
  const diagGlow = interpolate(frame, [42, 60], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  }) * interpolate(Math.sin(frame * 0.042), [-1, 1], [0.5, 1.0]);

  // "Why:" label and check cards
  const whyOp = interpolate(frame, [48, 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  function cardAnim(i: number) {
    const f  = Math.max(0, frame - (58 + i * 14));
    const sp = spring({ frame: f, fps, config: SPR });
    return {
      y:  interpolate(sp, [0, 1], [28, 0]),
      sc: interpolate(sp, [0, 1], [0.93, 1.0]),
      op: interpolate(f, [0, 12], [0, 1], { extrapolateRight: "clamp" }),
    };
  }

  const CHECKS = [
    { text: "Regular rhythm", color: "#F2B94B" },
    { text: "Flutter waves",  color: "#0ABFBC" },
    { text: "Narrow QRS",     color: "#1FBF75" },
  ];

  // Available height for panel content
  const panelH   = PANEL_BOT - STRIP_END;  // 1200
  // Allocate: diagnosis card ~260px, gap 20, why label ~60, gap 16, 3 check cards fill rest
  const checkH   = Math.floor((panelH - 260 - 20 - 60 - 16 - 32 * 2 - 16 * 2) / 3);  // ~206

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut, backgroundColor: RL.bgBase, overflow: "hidden" }}>

      {/* ── Brand lockup ── */}
      <div style={{
        position: "absolute",
        top: SAFE_TOP, left: 0, right: 0,
        height: BRAND_H,
        display: "flex", alignItems: "center",
        padding: "0 32px", gap: 14,
        opacity: brandOp, zIndex: 10,
      }}>
        <CELogo size={42} />
        <span style={{
          fontFamily: RL.fontSans, fontSize: 36, fontWeight: 700,
          color: RL.textPrimary, letterSpacing: "-0.02em",
        }}>
          Clinical Edge
        </span>
        <span style={{ color: RL.border, fontSize: 26 }}>·</span>
        <span style={{ fontFamily: RL.fontSans, fontSize: 36, fontWeight: 600, color: RL.accent }}>
          Rhythm Lab
        </span>
      </div>

      {/* ── ECG Strip — still present, shorter ── */}
      <div style={{
        position: "absolute",
        top: STRIP_TOP, left: 0, right: 0,
        height: STRIP_H,
        background: RL.bgBase,
        zIndex: 7,
      }}>
        <AppFlutterStrip width={1080} height={STRIP_H} staticStrip />
      </div>

      {/* ── Reveal panel ── */}
      <div style={{
        position: "absolute",
        top: STRIP_END, left: 0, right: 0,
        height: panelH,
        background: RL.bgBase,
        padding: "32px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        zIndex: 6,
        overflow: "hidden",
      }}>

        {/* Diagnosis card */}
        <div style={{
          height: 260,
          background: RL.bgSurface,
          border: `1px solid ${RL.border}`,
          borderLeft: `5px solid ${RL.accent}`,
          borderRadius: 20,
          padding: "32px 36px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          transform: `translateY(${hY}px) scale(${hSc})`,
          opacity: hOp,
          transformOrigin: "left top",
          willChange: "transform, opacity",
          flexShrink: 0,
        }}>
          <p style={{
            fontFamily: RL.fontMono, fontSize: 22, fontWeight: 600,
            color: RL.accent, letterSpacing: "0.10em",
            textTransform: "uppercase", marginBottom: 14,
          }}>
            Rhythm Identified
          </p>
          <p style={{
            fontFamily: RL.fontSans, fontSize: 64, fontWeight: 800,
            color: RL.textPrimary, letterSpacing: "-0.04em",
            lineHeight: 1.0,
            textShadow: `0 0 ${52 * diagGlow}px rgba(10,191,188,${(0.40 * diagGlow).toFixed(3)})`,
          }}>
            Atrial Flutter
          </p>
        </div>

        {/* "Why:" label */}
        <p style={{
          fontFamily: RL.fontMono, fontSize: 30, fontWeight: 600,
          color: RL.textSec, letterSpacing: "0.08em",
          textTransform: "uppercase",
          opacity: whyOp,
          flexShrink: 0,
          paddingLeft: 4,
        }}>
          Why:
        </p>

        {/* Check cards */}
        {CHECKS.map(({ text, color }, i) => {
          const { y, sc, op } = cardAnim(i);
          return (
            <div key={text} style={{
              height: checkH,
              background: RL.bgSurface,
              border: `1px solid ${RL.border}`,
              borderRadius: 18,
              padding: "0 32px",
              display: "flex",
              alignItems: "center",
              gap: 24,
              transform: `translateY(${y}px) scale(${sc})`,
              opacity: op,
              willChange: "transform, opacity",
              flexShrink: 0,
            }}>
              {/* Check circle */}
              <div style={{
                width: 60, height: 60,
                borderRadius: "50%",
                background: `${color}1A`,
                border: `2px solid ${color}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{
                  fontSize: 30, color, fontWeight: 700,
                  fontFamily: RL.fontSans, lineHeight: 1,
                }}>
                  ✓
                </span>
              </div>
              <p style={{
                fontFamily: RL.fontSans, fontSize: 38, fontWeight: 700,
                color: RL.textPrimary, letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}>
                {text}
              </p>
            </div>
          );
        })}

      </div>

    </AbsoluteFill>
  );
};
