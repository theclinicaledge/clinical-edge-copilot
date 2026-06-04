import React from "react";
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig,
  spring, interpolate,
} from "remotion";
import { CELogo } from "../../clinical-edge-video/components/CELogo";
import { AppFlutterStrip } from "./AppFlutterStrip";

const RL = {
  bgBase:    "#111827",
  bgSurface: "#1E2A3A",
  textPrimary:"#F0EDE6",
  textSec:   "#94A3B8",
  accent:    "#0ABFBC",
  border:    "#2D3B4E",
  fontSans:  "'IBM Plex Sans', system-ui, sans-serif",
  fontMono:  "'IBM Plex Mono', monospace",
};

// ─── Safe-zone layout constants ───────────────────────────────────────────────
const SAFE_TOP    = 140;
const SAFE_BOTTOM = 220;
const BRAND_H     = 60;
const STRIP_TOP   = SAFE_TOP + BRAND_H;   // 200
const STRIP_H     = 380;
const STRIP_END   = STRIP_TOP + STRIP_H;  // 580
const PANEL_BOT   = 1920 - SAFE_BOTTOM;   // 1700
const CANVAS_W    = 1080;

// ─── Callout pin over the strip ───────────────────────────────────────────────
function CalloutPin({
  label, color, xPos, yStrip, frame, fps, entryFrame,
}: {
  label: string; color: string;
  xPos: number; yStrip: number;
  frame: number; fps: number; entryFrame: number;
}) {
  const f   = Math.max(0, frame - entryFrame);
  const sp  = spring({ frame: f, fps, config: { damping: 22, stiffness: 130, mass: 0.9 } });
  const ty  = interpolate(sp, [0, 1], [-36, 0]);
  const sc  = interpolate(sp, [0, 1], [0.86, 1.0]);
  const op  = interpolate(f, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  const pinAbsY = STRIP_TOP + yStrip;
  const chipW   = 180;
  const left    = Math.min(Math.max(xPos - chipW / 2, 12), CANVAS_W - chipW - 12);

  return (
    <div style={{
      position: "absolute",
      left, top: pinAbsY - 76, width: chipW,
      transform: `translateY(${ty}px) scale(${sc})`,
      opacity: op, transformOrigin: "center bottom",
      willChange: "transform, opacity",
      zIndex: 15,
    }}>
      <div style={{
        background: color, borderRadius: 10,
        padding: "10px 18px",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 6px 24px rgba(0,0,0,0.50)`,
      }}>
        <span style={{
          fontFamily: RL.fontMono, fontSize: 18, fontWeight: 700,
          color: "#fff", letterSpacing: "0.05em", textTransform: "uppercase",
        }}>
          {label}
        </span>
      </div>
      <div style={{ width: 2, height: 24, background: color, margin: "0 auto", opacity: 0.7, borderRadius: 1 }} />
      <div style={{
        width: 12, height: 12, borderRadius: "50%",
        background: color, margin: "0 auto", marginTop: -5,
        boxShadow: `0 0 14px ${color}`,
      }} />
    </div>
  );
}

export const PatternScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Brand + header row
  const brandOp = interpolate(frame, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Header text — springs in at frame 8
  const hF  = Math.max(0, frame - 8);
  const hSp = spring({ frame: hF, fps, config: { damping: 20, stiffness: 130, mass: 1.0 } });
  const hY  = interpolate(hSp, [0, 1], [20, 0]);
  const hOp = interpolate(hF, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  // Pin vertical position — midpoint of strip
  const pinY = STRIP_H * 0.48;

  // Panel cards
  const CLUES = [
    { label: "Rate",       value: "About 150 bpm",  color: "#4da3ff" },
    { label: "Regularity", value: "Regular",         color: "#F2B94B" },
    { label: "P waves",    value: "Flutter waves",   color: "#0ABFBC" },
    { label: "QRS",        value: "Narrow",          color: "#1FBF75" },
  ];

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
        <CELogo size={32} />
        <span style={{
          fontFamily: RL.fontSans, fontSize: 26, fontWeight: 700,
          color: RL.textPrimary, letterSpacing: "-0.02em",
        }}>
          Clinical Edge
        </span>
        <span style={{ color: RL.border, fontSize: 20 }}>·</span>
        <span style={{ fontFamily: RL.fontSans, fontSize: 26, fontWeight: 600, color: RL.accent }}>
          Rhythm Lab
        </span>
      </div>

      {/* ── ECG Strip ── */}
      <div style={{
        position: "absolute",
        top: STRIP_TOP, left: 0, right: 0,
        height: STRIP_H,
        background: RL.bgBase,
        zIndex: 7,
      }}>
        <AppFlutterStrip width={CANVAS_W} height={STRIP_H} staticStrip />
      </div>

      {/* ── Callout pins over strip ── */}
      <CalloutPin label="Rate"       color="#4da3ff" xPos={150} yStrip={pinY}      frame={frame} fps={fps} entryFrame={20} />
      <CalloutPin label="P waves"    color="#0ABFBC" xPos={380} yStrip={pinY - 28} frame={frame} fps={fps} entryFrame={40} />
      <CalloutPin label="Regularity" color="#F2B94B" xPos={630} yStrip={pinY + 18} frame={frame} fps={fps} entryFrame={60} />
      <CalloutPin label="QRS"        color="#1FBF75" xPos={880} yStrip={pinY - 44} frame={frame} fps={fps} entryFrame={80} />

      {/* ── Bottom panel ── */}
      <div style={{
        position: "absolute",
        top: STRIP_END, left: 0, right: 0,
        height: PANEL_BOT - STRIP_END,
        background: RL.bgBase,
        padding: "28px 24px 0",
        zIndex: 6,
      }}>

        {/* "Look for the clues." heading */}
        <div style={{
          transform: `translateY(${hY}px)`,
          opacity: hOp,
          willChange: "transform, opacity",
          marginBottom: 24,
        }}>
          <p style={{
            fontFamily: RL.fontSans, fontSize: 48, fontWeight: 800,
            color: RL.textPrimary, letterSpacing: "-0.03em",
            lineHeight: 1.0,
          }}>
            Look for the clues.
          </p>
        </div>

        {/* 2 × 2 card grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}>
          {CLUES.map(({ label, value, color }, i) => {
            const f  = Math.max(0, frame - (38 + i * 16));
            const sp = spring({ frame: f, fps, config: { damping: 22, stiffness: 130, mass: 0.9 } });
            const y  = interpolate(sp, [0, 1], [32, 0]);
            const sc = interpolate(sp, [0, 1], [0.92, 1.0]);
            const op = interpolate(f, [0, 12], [0, 1], { extrapolateRight: "clamp" });
            return (
              <div key={label} style={{
                background: RL.bgSurface,
                border: `1px solid ${RL.border}`,
                borderTop: `4px solid ${color}`,
                borderRadius: 16,
                padding: "28px 24px",
                transform: `translateY(${y}px) scale(${sc})`,
                opacity: op,
                willChange: "transform, opacity",
              }}>
                <p style={{
                  fontFamily: RL.fontMono, fontSize: 14, fontWeight: 600,
                  color: color, letterSpacing: "0.10em",
                  textTransform: "uppercase", marginBottom: 10,
                  lineHeight: 1,
                }}>
                  {label}
                </p>
                <p style={{
                  fontFamily: RL.fontSans, fontSize: 34, fontWeight: 700,
                  color: RL.textPrimary, letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                }}>
                  {value}
                </p>
              </div>
            );
          })}
        </div>

      </div>

    </AbsoluteFill>
  );
};
