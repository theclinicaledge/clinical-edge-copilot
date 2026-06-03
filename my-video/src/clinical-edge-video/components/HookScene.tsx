import React from "react";
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig,
  spring, interpolate,
} from "remotion";
import { T } from "../tokens";
import { CELogo } from "./CELogo";
import { GrainOverlay } from "./GrainOverlay";

const SPRING = { damping: 20, stiffness: 100, mass: 1.15 };

interface Props { hookLine: string; scenarioLabel: string; }

export const HookScene: React.FC<Props> = ({ hookLine, scenarioLabel }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeOut = interpolate(frame, [durationInFrames - 18, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Camera push-in — slow, cinematic
  const camScale = interpolate(frame, [0, durationInFrames], [1.0, 1.055], {
    extrapolateRight: "clamp",
  });

  // Breathing teal glow
  const glow1 = interpolate(Math.sin(frame * 0.028), [-1, 1], [0.06, 0.14]);
  const glow2 = interpolate(Math.sin(frame * 0.019 + 1.4), [-1, 1], [0.03, 0.08]);

  // Logo — fades in at frame 4
  const logoOpacity = interpolate(frame, [4, 22], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Scenario label — fades in at frame 16
  const labelOpacity = interpolate(frame, [16, 34], [0, 0.7], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Hook text — line 1 springs in at frame 24
  const h1Frame = Math.max(0, frame - 24);
  const h1Spring = spring({ frame: h1Frame, fps, config: SPRING });
  const h1Y = interpolate(h1Spring, [0, 1], [52, 0]);
  const h1Scale = interpolate(h1Spring, [0, 1], [0.84, 1.0]);
  const h1Opacity = interpolate(h1Frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  // Hook text — line 2 springs in at frame 40
  const h2Frame = Math.max(0, frame - 40);
  const h2Spring = spring({ frame: h2Frame, fps, config: SPRING });
  const h2Y = interpolate(h2Spring, [0, 1], [52, 0]);
  const h2Scale = interpolate(h2Spring, [0, 1], [0.84, 1.0]);
  const h2Opacity = interpolate(h2Frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  // Glow on "missed" — builds after text settles
  const missedGlow = interpolate(frame, [62, 84], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  }) * interpolate(Math.sin(frame * 0.04), [-1, 1], [0.55, 1.0]);

  // Bottom teal line — decorative, fades in late
  const lineOpacity = interpolate(frame, [72, 92], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const lines = hookLine.split("\n");

  return (
    <AbsoluteFill style={{ opacity: fadeOut, backgroundColor: T.pageBg, overflow: "hidden" }}>

      {/* ── Parallax BG layer (scales faster than content) ── */}
      <AbsoluteFill style={{ transform: `scale(${camScale})`, transformOrigin: "50% 45%" }}>

        {/* Subtle grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            linear-gradient(rgba(10,191,188,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(10,191,188,0.018) 1px, transparent 1px)
          `,
          backgroundSize: "96px 96px",
          pointerEvents: "none",
        }} />

        {/* Primary teal bloom — center-low */}
        <div style={{
          position: "absolute",
          left: "50%", top: "58%",
          width: 1100, height: 1100,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(10,191,188,${glow1.toFixed(3)}) 0%, transparent 55%)`,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }} />

        {/* Secondary bloom — upper right */}
        <div style={{
          position: "absolute",
          left: "75%", top: "22%",
          width: 700, height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(10,191,188,${glow2.toFixed(3)}) 0%, transparent 55%)`,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }} />

      </AbsoluteFill>

      {/* ── Top vignette ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 280,
        background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 100%)",
        pointerEvents: "none",
      }} />
      {/* Bottom vignette */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 360,
        background: `linear-gradient(0deg, ${T.pageBg} 0%, rgba(17,24,39,0.6) 60%, transparent 100%)`,
        pointerEvents: "none",
      }} />

      <GrainOverlay opacity={0.028} />

      {/* ── Content (content does NOT scale — only BG does) ── */}
      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "0 72px",
      }}>

        {/* Logo row — top left */}
        <div style={{
          position: "absolute", top: 108, left: 80,
          display: "flex", alignItems: "center", gap: 14,
          opacity: logoOpacity,
        }}>
          <CELogo size={42} />
          <span style={{
            fontSize: 30,
            fontWeight: 700,
            color: T.textPrimary,
            fontFamily: T.sans,
            letterSpacing: "-0.3px",
          }}>
            Clinical Edge
          </span>
        </div>

        {/* Scenario label */}
        <div style={{
          position: "absolute", top: 290, left: 80,
          opacity: labelOpacity,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 28, height: 2, borderRadius: 1,
            background: T.accent,
          }} />
          <span style={{
            fontSize: 32,
            fontWeight: 600,
            color: T.accent,
            fontFamily: T.mono,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}>
            {scenarioLabel}
          </span>
        </div>

        {/* ── Hook text ── */}
        <div style={{ marginTop: 60 }}>
          {/* Line 1 */}
          <div style={{
            transform: `translateY(${h1Y}px) scale(${h1Scale})`,
            opacity: h1Opacity,
            transformOrigin: "left center",
            willChange: "transform, opacity",
            marginBottom: 4,
          }}>
            <span style={{
              fontSize: 120,
              fontWeight: 800,
              color: T.textPrimary,
              fontFamily: T.sans,
              letterSpacing: "-0.045em",
              lineHeight: 0.96,
              display: "block",
            }}>
              {lines[0]}
            </span>
          </div>

          {/* Line 2 — "that gets missed." — last word gets teal glow */}
          {lines[1] && (
            <div style={{
              transform: `translateY(${h2Y}px) scale(${h2Scale})`,
              opacity: h2Opacity,
              transformOrigin: "left center",
              willChange: "transform, opacity",
            }}>
              <span style={{
                fontSize: 120,
                fontWeight: 800,
                fontFamily: T.sans,
                letterSpacing: "-0.045em",
                lineHeight: 0.96,
                display: "block",
                whiteSpace: "pre",
              }}>
                {/* Split last word to apply glow to "missed." */}
                {(() => {
                  const words = lines[1].split(" ");
                  const last = words.pop();
                  return (
                    <>
                      <span style={{ color: T.textPrimary }}>{words.join(" ")} </span>
                      <span style={{
                        color: T.textPrimary,
                        textShadow: `0 0 ${60 * missedGlow}px rgba(10,191,188,${(0.55 * missedGlow).toFixed(3)})`,
                      }}>
                        {last}
                      </span>
                    </>
                  );
                })()}
              </span>
            </div>
          )}
        </div>

        {/* Teal accent bar — minimal decorative rule only, no text label */}
        <div style={{
          position: "absolute", bottom: 220, left: 80,
          opacity: lineOpacity,
          display: "flex", alignItems: "center", gap: 0,
        }}>
          <div style={{
            width: 48, height: 2, background: T.accent, borderRadius: 1,
          }} />
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
