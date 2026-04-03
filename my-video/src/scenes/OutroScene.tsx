import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { ParticleField } from "../components/ParticleField";
import { GlowBackground } from "../components/GlowBackground";

// Scene 5: 0–180 local frames (6.0s at 30fps)
// Transition in: 0–15   No transition out (final scene)
// Line 1 at 0, divider at 55, line 2 at 70, logo at 118
// Camera settles (slows to a stop at ~160)

const TRANS = 15;

// Real Clinical Edge Copilot logo — exact 4-path SVG from App.jsx
const ClinicalEdgeLogo: React.FC<{ scale: number; opacity: number }> = ({
  scale, opacity,
}) => (
  <div
    style={{
      transform: `scale(${scale})`,
      opacity,
      transformOrigin: "center",
      textAlign: "center",
    }}
  >
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 18,
        borderRadius: 20,
        border: "1.5px solid rgba(0,194,209,0.52)",
        padding: "20px 40px",
        background: "rgba(0,194,209,0.055)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Exact SVG from App.jsx — 4 paths, fill #00C2D1 */}
      <svg
        width="52"
        height="46"
        viewBox="0 0 225 200"
        xmlns="http://www.w3.org/2000/svg"
        fill="#00C2D1"
        aria-label="Clinical Edge"
        style={{ flexShrink: 0, display: "block" }}
      >
        <path d="M 159.1,24.3 A 96,96 0 1,0 159.1,175.7 L 135.7,145.7 A 58,58 0 1,1 135.7,54.3 Z" />
        <path d="M 144.0,57 L 208,45 L 218,58 L 208,70 L 150.0,71 Z" />
        <path d="M 158.0,92 L 215,82 L 225,95 L 215,107 L 158.0,108 Z" />
        <path d="M 150.0,129 L 208,130 L 218,142 L 208,155 L 144.0,143 Z" />
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "#F8FBFC",
            fontFamily: "Syne, system-ui, sans-serif",
            letterSpacing: "-0.3px",
            lineHeight: 1.1,
          }}
        >
          Clinical Edge
        </span>
        <span
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: "#7F99A5",
            letterSpacing: "0.7px",
            textTransform: "uppercase",
            fontFamily: "DM Mono, monospace",
            lineHeight: 1,
          }}
        >
          Copilot
        </span>
      </div>
    </div>
  </div>
);

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // ─── Transition in ──────────────────────────────────────────────────────────
  const fadeIn = interpolate(frame, [0, TRANS], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const blurIn = interpolate(frame, [0, TRANS], [6, 0], { extrapolateRight: "clamp" });

  // ─── Camera settles: slow push that eases to a stop ─────────────────────────
  // Starts at 1.0, reaches 1.018 by frame 160, then holds still
  const cameraSettle = interpolate(frame, [0, 160, durationInFrames], [1.0, 1.018, 1.018], {
    extrapolateRight: "clamp",
  });

  // ─── Content animations ─────────────────────────────────────────────────────
  const line1Spring = spring({ frame, fps, config: { damping: 22, stiffness: 115, mass: 1.15 } });
  const line1Blur = interpolate(line1Spring, [0, 1], [5, 0]);
  const line1Y = interpolate(line1Spring, [0, 1], [16, 0]);
  const line1Opacity = interpolate(frame, [TRANS, TRANS + 16], [0, 1], { extrapolateRight: "clamp" });

  const dividerWidth = interpolate(frame, [55, 82], [0, 260], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dividerOpacity = interpolate(frame, [55, 72], [0, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const line2Frame = Math.max(0, frame - 70);
  const line2Spring = spring({ frame: line2Frame, fps, config: { damping: 20, stiffness: 125, mass: 1.0 } });
  const line2Y = interpolate(line2Spring, [0, 1], [16, 0]);
  const line2Opacity = interpolate(line2Frame, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  // "copilot" — slow breathing glow
  const copilotGlow = interpolate(Math.sin(frame * 0.07), [-1, 1], [10, 28]);

  const logoFrame = Math.max(0, frame - 118);
  const logoSpring = spring({ frame: logoFrame, fps, config: { damping: 22, stiffness: 140, mass: 1.0 } });
  const logoScale = interpolate(logoSpring, [0, 1], [0.92, 1]);
  const logoOpacity = interpolate(logoFrame, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  const particleDim = interpolate(frame, [0, 90, 180], [0.4, 0.24, 0.1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity: fadeIn,
        filter: blurIn > 0 ? `blur(${blurIn}px)` : undefined,
      }}
    >
      {/* Background with camera settle */}
      <AbsoluteFill
        style={{
          transform: `scale(${cameraSettle})`,
          transformOrigin: "center center",
        }}
      >
        <GlowBackground intensity={0.72} showVignette={true} />
        <ParticleField count={26} slowFactor={0.16} dimFactor={particleDim} />
      </AbsoluteFill>

      {/* Deep vignette for cinematic final frame */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 26%, rgba(4,8,18,0.68) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 38,
          paddingLeft: 64,
          paddingRight: 64,
        }}
      >
        {/* Line 1 */}
        <div
          style={{
            transform: `translateY(${line1Y}px)`,
            opacity: line1Opacity,
            filter: `blur(${line1Blur}px)`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              color: "#FFFFFF",
              fontFamily: "Syne, system-ui, sans-serif",
              letterSpacing: "-0.025em",
              lineHeight: 1.14,
              textShadow: "0 0 50px rgba(255,255,255,0.1)",
            }}
          >
            This is how you think on shift.
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            width: dividerWidth,
            height: 1.5,
            background: "linear-gradient(90deg, transparent, #00C2CB, transparent)",
            opacity: dividerOpacity,
          }}
        />

        {/* Line 2 — CTA */}
        {frame >= 70 && (
          <div
            style={{
              transform: `translateY(${line2Y}px)`,
              opacity: line2Opacity,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
            }}
          >
            <div
              style={{
                fontSize: 62,
                fontWeight: 700,
                color: "#00C2CB",
                fontFamily: "Syne, system-ui, sans-serif",
                letterSpacing: "-0.01em",
                textShadow: `0 0 ${copilotGlow}px rgba(0,194,203,0.55), 0 0 ${copilotGlow * 2}px rgba(0,194,203,0.15)`,
                lineHeight: 1.1,
              }}
            >
              Try Copilot
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 500,
                color: "rgba(255,255,255,0.45)",
                fontFamily: "DM Mono, monospace",
                letterSpacing: "0.04em",
              }}
            >
              theclinicaledge.org
            </div>
          </div>
        )}

        {/* Logo */}
        {frame >= 118 && (
          <ClinicalEdgeLogo scale={logoScale} opacity={logoOpacity} />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
