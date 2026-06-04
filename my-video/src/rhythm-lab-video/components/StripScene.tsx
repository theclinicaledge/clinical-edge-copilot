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
// TikTok / IG Reels: avoid top 140px and bottom 220px.
const SAFE_TOP    = 140;
const SAFE_BOTTOM = 220;
const BRAND_H     = 60;
const STRIP_TOP   = SAFE_TOP + BRAND_H;   // 200
const STRIP_H     = 380;
const STRIP_END   = STRIP_TOP + STRIP_H;  // 580
const PANEL_BOT   = 1920 - SAFE_BOTTOM;   // 1700

export const StripScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Brand lockup — fades in immediately
  const brandOp = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Strip — rises up at frame 16
  const stripF  = Math.max(0, frame - 16);
  const stripSp = spring({ frame: stripF, fps, config: { damping: 28, stiffness: 100, mass: 1.1 } });
  const stripY  = interpolate(stripSp, [0, 1], [60, 0]);
  const stripOp = interpolate(stripF, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  // Bottom panel — slides up at frame 52
  const panelF  = Math.max(0, frame - 52);
  const panelSp = spring({ frame: panelF, fps, config: { damping: 26, stiffness: 110, mass: 1.0 } });
  const panelY  = interpolate(panelSp, [0, 1], [100, 0]);
  const panelOp = interpolate(panelF, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut, backgroundColor: RL.bgBase, overflow: "hidden" }}>

      {/* ── Brand lockup — safe zone ── */}
      <div style={{
        position: "absolute",
        top: SAFE_TOP, left: 0, right: 0,
        height: BRAND_H,
        display: "flex", alignItems: "center",
        padding: "0 32px", gap: 14,
        opacity: brandOp,
        zIndex: 10,
      }}>
        <CELogo size={32} />
        <span style={{
          fontFamily: RL.fontSans, fontSize: 26, fontWeight: 700,
          color: RL.textPrimary, letterSpacing: "-0.02em",
        }}>
          Clinical Edge
        </span>
        <span style={{ color: RL.border, fontSize: 20 }}>·</span>
        <span style={{
          fontFamily: RL.fontSans, fontSize: 26, fontWeight: 600,
          color: RL.accent,
        }}>
          Rhythm Lab
        </span>
      </div>

      {/* ── ECG Strip ── */}
      <div style={{
        position: "absolute",
        top: STRIP_TOP, left: 0, right: 0,
        height: STRIP_H,
        background: RL.bgBase,
        transform: `translateY(${stripY}px)`,
        opacity: stripOp,
        willChange: "transform, opacity",
        zIndex: 7,
      }}>
        <AppFlutterStrip
          width={1080}
          height={STRIP_H}
          sweepStartFrame={18}
          sweepDurationFrames={72}
        />
      </div>

      {/* ── Bottom panel ── */}
      <div style={{
        position: "absolute",
        top: STRIP_END, left: 0, right: 0,
        height: PANEL_BOT - STRIP_END,
        background: RL.bgBase,
        padding: "32px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        transform: `translateY(${panelY}px)`,
        opacity: panelOp,
        willChange: "transform, opacity",
        zIndex: 6,
      }}>

        {/* Question card */}
        <div style={{
          background: RL.bgSurface,
          border: `1px solid ${RL.border}`,
          borderLeft: `5px solid ${RL.accent}`,
          borderRadius: 20,
          padding: "40px 36px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}>
          <p style={{
            fontFamily: RL.fontMono, fontSize: 16, fontWeight: 600,
            color: RL.textSec, letterSpacing: "0.08em",
            textTransform: "uppercase", marginBottom: 18,
          }}>
            Would you call this...
          </p>
          <p style={{
            fontFamily: RL.fontSans, fontSize: 80, fontWeight: 800,
            color: RL.textPrimary, letterSpacing: "-0.04em",
            lineHeight: 1.0,
          }}>
            SVT?
          </p>
          <p style={{
            fontFamily: RL.fontSans, fontSize: 26,
            color: RL.textSec, lineHeight: 1.4, marginTop: 20,
          }}>
            Look at the baseline closely.
          </p>
        </div>

        {/* Reveal button */}
        <div style={{
          background: RL.accent,
          borderRadius: 20,
          height: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: RL.fontSans, fontSize: 32, fontWeight: 700,
            color: RL.bgBase, letterSpacing: "-0.01em",
          }}>
            Reveal rhythm →
          </span>
        </div>

      </div>

    </AbsoluteFill>
  );
};
