import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { T } from "../tokens";
import { CELogo } from "./CELogo";

const SPRING = { damping: 18, stiffness: 110, mass: 1.1 };

interface Props {
  hookLine: string;
  scenarioLabel: string;
}

export const HookScene: React.FC<Props> = ({ hookLine, scenarioLabel }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Fade out last 15f
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Subtle scale-up on background over the whole scene
  const camScale = interpolate(frame, [0, durationInFrames], [1.0, 1.014], {
    extrapolateRight: "clamp",
  });

  // Teal glow — slow breathing pulse
  const glow = interpolate(Math.sin(frame * 0.03), [-1, 1], [0.04, 0.12]);

  // Logo enters at frame 4
  const logoOpacity = interpolate(frame, [4, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Label enters at frame 14
  const labelOpacity = interpolate(frame, [14, 30], [0, 0.65], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Hook text — spring entrance at frame 22
  const hFrame = Math.max(0, frame - 22);
  const hSpring = spring({ frame: hFrame, fps, config: SPRING });
  const hY = interpolate(hSpring, [0, 1], [44, 0]);
  const hScale = interpolate(hSpring, [0, 1], [0.88, 1.0]);
  const hOpacity = interpolate(hFrame, [0, 16], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Text glow builds after spring settles
  const glowOpacity = interpolate(frame, [58, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }) * interpolate(Math.sin(frame * 0.045), [-1, 1], [0.5, 1.0]);

  // Urgency dot at bottom — appears late
  const dotOpacity = interpolate(frame, [70, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dotPulse = interpolate(Math.sin(frame * 0.07), [-1, 1], [0.55, 1.0]);

  return (
    <AbsoluteFill style={{ opacity: fadeOut, backgroundColor: T.pageBg }}>

      {/* ── Background layers ── */}
      <AbsoluteFill style={{ transform: `scale(${camScale})`, transformOrigin: "center" }}>

        {/* Subtle grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            linear-gradient(rgba(10,191,188,0.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(10,191,188,0.022) 1px, transparent 1px)
          `,
          backgroundSize: "88px 88px",
          pointerEvents: "none",
        }} />

        {/* Center teal glow */}
        <div style={{
          position: "absolute",
          left: "50%", top: "48%",
          width: 900, height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(10,191,188,${glow.toFixed(3)}) 0%, transparent 60%)`,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }} />

        {/* Top fade */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 300,
          background: `linear-gradient(180deg, rgba(0,0,0,0.28) 0%, transparent 100%)`,
          pointerEvents: "none",
        }} />

        {/* Bottom fade */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 400,
          background: `linear-gradient(0deg, ${T.pageBg} 0%, transparent 100%)`,
          pointerEvents: "none",
        }} />

      </AbsoluteFill>

      {/* ── Content ── */}
      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
      }}>

        {/* Logo + wordmark — top */}
        <div style={{
          position: "absolute",
          top: 110,
          left: 80,
          display: "flex",
          alignItems: "center",
          gap: 14,
          opacity: logoOpacity,
        }}>
          <CELogo size={40} />
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{
              fontSize: 28,
              fontWeight: 700,
              color: T.textPrimary,
              fontFamily: T.sans,
              letterSpacing: "-0.3px",
              lineHeight: 1,
            }}>
              Clinical Edge
            </span>
            <span style={{
              fontSize: 16,
              fontWeight: 500,
              color: T.textMuted,
              fontFamily: T.mono,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              lineHeight: 1,
            }}>
              Copilot
            </span>
          </div>
        </div>

        {/* Scenario label */}
        <div style={{
          position: "absolute",
          top: 310,
          left: 0, right: 0,
          textAlign: "center",
          opacity: labelOpacity,
        }}>
          <span style={{
            fontSize: 24,
            fontWeight: 500,
            color: T.accent,
            fontFamily: T.mono,
            letterSpacing: "0.20em",
            textTransform: "uppercase",
          }}>
            {scenarioLabel}
          </span>
        </div>

        {/* ── Hook text — the hero ── */}
        <div style={{
          transform: `translateY(${hY}px) scale(${hScale})`,
          opacity: hOpacity,
          textAlign: "center",
          willChange: "transform, opacity",
          marginTop: 60,
        }}>
          <span style={{
            fontSize: 128,
            fontWeight: 800,
            color: T.textPrimary,
            fontFamily: T.sans,
            letterSpacing: "-0.04em",
            lineHeight: 1.0,
            display: "block",
            whiteSpace: "pre-line",
            textShadow: `0 0 ${70 * glowOpacity}px rgba(10,191,188,${(0.30 * glowOpacity).toFixed(3)})`,
          }}>
            {hookLine}
          </span>
        </div>

        {/* Urgency signal — bottom */}
        <div style={{
          position: "absolute",
          bottom: 240,
          left: 0, right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          opacity: dotOpacity * dotPulse,
        }}>
          <div style={{
            width: 10, height: 10, borderRadius: "50%",
            background: T.urgHighDark,
            boxShadow: `0 0 14px ${T.urgHighDark}, 0 0 28px rgba(244,164,164,0.35)`,
          }} />
          <span style={{
            fontSize: 24,
            fontWeight: 600,
            color: T.urgHighDark,
            fontFamily: T.mono,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}>
            High Urgency
          </span>
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
