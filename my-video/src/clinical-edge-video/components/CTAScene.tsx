import React from "react";
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig,
  spring, interpolate,
} from "remotion";
import { T } from "../tokens";
import { CELogo } from "./CELogo";
import { GrainOverlay } from "./GrainOverlay";

const SPRING = { damping: 18, stiffness: 100, mass: 1.08 };

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Breathing glow
  const glow = interpolate(Math.sin(frame * 0.030), [-1, 1], [0.06, 0.15]);
  const glowPulse = interpolate(Math.sin(frame * 0.052), [-1, 1], [0.5, 1.0]);

  // Logo lockup — springs in at frame 8
  const logoFrame = Math.max(0, frame - 8);
  const logoSpring = spring({ frame: logoFrame, fps, config: SPRING });
  const logoY = interpolate(logoSpring, [0, 1], [36, 0]);
  const logoScale = interpolate(logoSpring, [0, 1], [0.88, 1.0]);
  const logoOpacity = interpolate(logoFrame, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  // Divider line
  const dividerOpacity = interpolate(frame, [32, 48], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Module list — springs in at frame 38
  const modFrame = Math.max(0, frame - 38);
  const modSpring = spring({ frame: modFrame, fps, config: SPRING });
  const modY = interpolate(modSpring, [0, 1], [24, 0]);
  const modOpacity = interpolate(modFrame, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  // CTA block — springs in at frame 56
  const ctaFrame = Math.max(0, frame - 56);
  const ctaSpring = spring({ frame: ctaFrame, fps, config: SPRING });
  const ctaScale = interpolate(ctaSpring, [0, 1], [0.88, 1.0]);
  const ctaOpacity = interpolate(ctaFrame, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: fadeIn, backgroundColor: T.pageBg, overflow: "hidden" }}>

      {/* BG */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(10,191,188,0.018) 1px, transparent 1px),
          linear-gradient(90deg, rgba(10,191,188,0.018) 1px, transparent 1px)
        `,
        backgroundSize: "96px 96px",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        width: 1000, height: 1000, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(10,191,188,${glow.toFixed(3)}) 0%, transparent 55%)`,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }} />

      {/* Top + bottom vignettes */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 200,
        background: "linear-gradient(180deg, rgba(0,0,0,0.28) 0%, transparent 100%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 220,
        background: `linear-gradient(0deg, ${T.pageBg} 0%, transparent 100%)`,
        pointerEvents: "none",
      }} />

      <GrainOverlay opacity={0.026} />

      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
      }}>

        {/* ── Logo + wordmark ── */}
        <div style={{
          transform: `translateY(${logoY}px) scale(${logoScale})`,
          opacity: logoOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 28,
          willChange: "transform, opacity",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}>
            <CELogo size={80} />
            <span style={{
              fontSize: 80,
              fontWeight: 800,
              color: T.textPrimary,
              fontFamily: T.sans,
              letterSpacing: "-0.045em",
              lineHeight: 1,
            }}>
              Clinical Edge
            </span>
          </div>
        </div>

        {/* ── Teal divider ── */}
        <div style={{
          width: 72,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${T.accent}, transparent)`,
          borderRadius: 1,
          marginBottom: 32,
          opacity: dividerOpacity,
          boxShadow: `0 0 20px ${T.accent}`,
        }} />

        {/* ── Feature lines — three descriptor lines ── */}
        <div style={{
          transform: `translateY(${modY}px)`,
          opacity: modOpacity,
          textAlign: "center",
          marginBottom: 64,
          willChange: "transform, opacity",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}>
          {["Clinical reasoning.", "Rhythm interpretation.", "ICU drips."].map((line, i) => (
            <span key={i} style={{
              fontSize: 34,
              fontWeight: 400,
              color: T.textSecondary,
              fontFamily: T.sans,
              letterSpacing: "-0.015em",
              lineHeight: 1.3,
            }}>
              {line}
            </span>
          ))}
        </div>

        {/* ── App Store CTA — plain text only ── */}
        {/* Replace with official badge when available:                              */}
        {/* developer.apple.com/app-store/marketing/guidelines/                      */}
        <div style={{
          transform: `scale(${ctaScale})`,
          opacity: ctaOpacity,
          textAlign: "center",
          willChange: "transform, opacity",
        }}>
          <span style={{
            fontSize: 30,
            fontWeight: 400,
            color: T.textMuted,
            fontFamily: T.sans,
            letterSpacing: "-0.01em",
            display: "block",
            marginBottom: 8,
          }}>
            Download on the
          </span>
          <span style={{
            fontSize: 76,
            fontWeight: 800,
            color: T.textPrimary,
            fontFamily: T.sans,
            letterSpacing: "-0.045em",
            lineHeight: 1,
            display: "block",
            textShadow: `0 0 ${(56 * glowPulse).toFixed(0)}px rgba(10,191,188,0.26)`,
          }}>
            App Store
          </span>
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
