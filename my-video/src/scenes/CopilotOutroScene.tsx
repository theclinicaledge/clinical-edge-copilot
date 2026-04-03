import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { GlowBackground } from "../components/GlowBackground";
import { T } from "../tokens";

const TRANS = 15;

const CELogo: React.FC<{ size?: number }> = ({ size = 52 }) => (
  <svg width={size} height={Math.round(size * 0.89)} viewBox="0 0 225 200" fill={T.teal}>
    <path d="M 159.1,24.3 A 96,96 0 1,0 159.1,175.7 L 135.7,145.7 A 58,58 0 1,1 135.7,54.3 Z" />
    <path d="M 144.0,57 L 208,45 L 218,58 L 208,70 L 150.0,71 Z" />
    <path d="M 158.0,92 L 215,82 L 225,95 L 215,107 L 158.0,108 Z" />
    <path d="M 150.0,129 L 208,130 L 218,142 L 208,155 L 144.0,143 Z" />
  </svg>
);

export const CopilotOutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Fade in only (final scene)
  const fadeIn = interpolate(frame, [0, TRANS], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const blurIn = interpolate(frame, [0, TRANS], [7, 0], { extrapolateRight: "clamp" });

  const cameraPush = interpolate(frame, [0, durationInFrames], [1.0, 1.016], { extrapolateRight: "clamp" });

  // Headline — enters at frame 10
  const hF = Math.max(0, frame - 10);
  const hS = spring({ frame: hF, fps, config: { damping: 18, stiffness: 120, mass: 1.1 } });
  const hY  = interpolate(hS, [0, 1], [32, 0]);
  const hOp = interpolate(hF, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  // Logo — enters at frame 36
  const lgF = Math.max(0, frame - 36);
  const lgS = spring({ frame: lgF, fps, config: { damping: 18, stiffness: 130, mass: 1.0 } });
  const lgY  = interpolate(lgS, [0, 1], [20, 0]);
  const lgOp = interpolate(lgF, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  // CTA button — enters at frame 52
  const ctaF = Math.max(0, frame - 52);
  const ctaS = spring({ frame: ctaF, fps, config: { damping: 18, stiffness: 120, mass: 1.0 } });
  const ctaY  = interpolate(ctaS, [0, 1], [20, 0]);
  const ctaOp = interpolate(ctaF, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  // URL — enters at frame 66
  const urlOp = interpolate(frame, [66, 80], [0, 0.60], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // CTA button glow pulse
  const ctaGlow = interpolate(Math.sin(frame * 0.07), [-1, 1], [10, 26]);

  return (
    <AbsoluteFill style={{
      opacity: fadeIn,
      filter: blurIn > 0 ? `blur(${blurIn}px)` : undefined,
    }}>
      <AbsoluteFill style={{ transform: `scale(${cameraPush})`, transformOrigin: "center center" }}>
        <GlowBackground intensity={1.1} />
      </AbsoluteFill>

      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: 64,
        paddingRight: 64,
        gap: 0,
      }}>
        {/* Headline */}
        <div style={{
          transform: `translateY(${hY}px)`,
          opacity: hOp,
          textAlign: "center",
          marginBottom: 52,
        }}>
          <span style={{
            fontSize: 72,
            fontWeight: 800,
            color: T.textPrimary,
            fontFamily: T.sans,
            letterSpacing: "-0.032em",
            lineHeight: 1.15,
          }}>
            Run it through Copilot.
          </span>
        </div>

        {/* Logo + wordmark */}
        <div style={{
          transform: `translateY(${lgY}px)`,
          opacity: lgOp,
          display: "flex",
          alignItems: "center",
          gap: 18,
          marginBottom: 52,
        }}>
          <CELogo size={54} />
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{
              fontSize: 32,
              fontWeight: 700,
              color: T.textPrimary,
              fontFamily: T.sans,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}>
              Clinical Edge
            </span>
            <span style={{
              fontSize: 22,
              fontWeight: 500,
              color: T.teal,
              fontFamily: T.mono,
              letterSpacing: "0.10em",
            }}>
              Copilot
            </span>
          </div>
        </div>

        {/* CTA button */}
        <div style={{
          transform: `translateY(${ctaY}px)`,
          opacity: ctaOp,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 22,
        }}>
          <div style={{
            background: T.teal,
            color: T.bgApp,
            borderRadius: 18,
            padding: "22px 72px",
            fontSize: 34,
            fontWeight: 700,
            fontFamily: T.body,
            letterSpacing: "-0.01em",
            boxShadow: `0 0 ${ctaGlow}px rgba(0,194,209,0.40), 0 4px 22px rgba(0,194,209,0.22)`,
          }}>
            Try Copilot
          </div>

          {/* URL */}
          <div style={{
            opacity: urlOp,
            fontSize: 26,
            fontWeight: 500,
            color: T.teal,
            fontFamily: T.mono,
            letterSpacing: "0.04em",
          }}>
            theclinicaledge.org
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
