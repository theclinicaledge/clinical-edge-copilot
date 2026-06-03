import React from "react";
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig,
  spring, interpolate,
} from "remotion";
import { T } from "../tokens";
import { GrainOverlay } from "./GrainOverlay";

const SPRING = { damping: 22, stiffness: 110, mass: 1.05 };

interface Props {
  line1: string;
  line2: string;
}

// Line 1: "Do not read the vitals separately."
// Line 2: "Read the pattern."

export const TakeawayScene: React.FC<Props> = ({ line1, line2 }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Camera push-in
  const camScale = interpolate(frame, [0, durationInFrames], [1.0, 1.04], {
    extrapolateRight: "clamp",
  });

  // Glow pulse
  const glow = interpolate(Math.sin(frame * 0.025), [-1, 1], [0.05, 0.12]);

  // Line 1 — springs in at frame 18
  const l1Frame = Math.max(0, frame - 18);
  const l1Spring = spring({ frame: l1Frame, fps, config: SPRING });
  const l1Y = interpolate(l1Spring, [0, 1], [46, 0]);
  const l1Scale = interpolate(l1Spring, [0, 1], [0.86, 1.0]);
  const l1Opacity = interpolate(l1Frame, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  // Line 2 — springs in at frame 38, larger, accent color
  const l2Frame = Math.max(0, frame - 38);
  const l2Spring = spring({ frame: l2Frame, fps, config: SPRING });
  const l2Y = interpolate(l2Spring, [0, 1], [46, 0]);
  const l2Scale = interpolate(l2Spring, [0, 1], [0.86, 1.0]);
  const l2Opacity = interpolate(l2Frame, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  // Teal glow on line 2 builds after it settles
  const l2Glow = interpolate(frame, [68, 88], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  }) * interpolate(Math.sin(frame * 0.042), [-1, 1], [0.55, 1.0]);

  // Divider line appears between the two lines
  const dividerOpacity = interpolate(frame, [30, 44], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut, backgroundColor: T.pageBg, overflow: "hidden" }}>

      {/* Parallax bg */}
      <AbsoluteFill style={{ transform: `scale(${camScale})`, transformOrigin: "50% 48%" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            linear-gradient(rgba(10,191,188,0.016) 1px, transparent 1px),
            linear-gradient(90deg, rgba(10,191,188,0.016) 1px, transparent 1px)
          `,
          backgroundSize: "96px 96px",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", left: "30%", top: "52%",
          width: 900, height: 900, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(10,191,188,${glow.toFixed(3)}) 0%, transparent 55%)`,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }} />
      </AbsoluteFill>

      {/* Vignettes */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 220,
        background: "linear-gradient(180deg, rgba(0,0,0,0.30) 0%, transparent 100%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 280,
        background: `linear-gradient(0deg, ${T.pageBg} 0%, transparent 100%)`,
        pointerEvents: "none",
      }} />

      <GrainOverlay opacity={0.026} />

      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 72px",
        textAlign: "center",
      }}>

        {/* Line 1 — muted, large */}
        <div style={{
          transform: `translateY(${l1Y}px) scale(${l1Scale})`,
          opacity: l1Opacity,
          transformOrigin: "center",
          willChange: "transform, opacity",
          marginBottom: 24,
        }}>
          <span style={{
            fontSize: 72,
            fontWeight: 700,
            color: T.textSecondary,
            fontFamily: T.sans,
            letterSpacing: "-0.038em",
            lineHeight: 1.08,
            display: "block",
          }}>
            {line1}
          </span>
        </div>

        {/* Teal rule */}
        <div style={{
          width: 56,
          height: 3,
          background: T.accent,
          borderRadius: 2,
          marginBottom: 24,
          opacity: dividerOpacity,
        }} />

        {/* Line 2 — dominant, white, teal glow */}
        <div style={{
          transform: `translateY(${l2Y}px) scale(${l2Scale})`,
          opacity: l2Opacity,
          transformOrigin: "center",
          willChange: "transform, opacity",
        }}>
          <span style={{
            fontSize: 112,
            fontWeight: 800,
            color: T.textPrimary,
            fontFamily: T.sans,
            letterSpacing: "-0.045em",
            lineHeight: 1.0,
            display: "block",
            textShadow: `0 0 ${80 * l2Glow}px rgba(10,191,188,${(0.42 * l2Glow).toFixed(3)})`,
          }}>
            {line2}
          </span>
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
