import React from "react";
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig,
  spring, interpolate,
} from "remotion";
import { T } from "../../clinical-edge-video/tokens";
import { CELogo } from "../../clinical-edge-video/components/CELogo";
import { GrainOverlay } from "../../clinical-edge-video/components/GrainOverlay";

const SPRING = { damping: 18, stiffness: 100, mass: 1.08 };

// Scene 5 — CTA: "Clinical Edge · Rhythm Lab"
// Same visual language as ClinicalScenarioVideo CTAScene,
// but copy is specific to Rhythm Lab.

export const RhythmLabCTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const glow = interpolate(Math.sin(frame * 0.030), [-1, 1], [0.06, 0.15]);
  const glowPulse = interpolate(Math.sin(frame * 0.052), [-1, 1], [0.5, 1.0]);

  // Logo lockup
  const logoFrame = Math.max(0, frame - 8);
  const logoSpring = spring({ frame: logoFrame, fps, config: SPRING });
  const logoY = interpolate(logoSpring, [0, 1], [36, 0]);
  const logoScale = interpolate(logoSpring, [0, 1], [0.88, 1.0]);
  const logoOpacity = interpolate(logoFrame, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  // "Rhythm Lab" module name
  const modFrame = Math.max(0, frame - 22);
  const modSpring = spring({ frame: modFrame, fps, config: SPRING });
  const modY = interpolate(modSpring, [0, 1], [24, 0]);
  const modOpacity = interpolate(modFrame, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  // Divider line
  const dividerOpacity = interpolate(frame, [36, 52], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Tagline block
  const tagFrame = Math.max(0, frame - 44);
  const tagSpring = spring({ frame: tagFrame, fps, config: SPRING });
  const tagY = interpolate(tagSpring, [0, 1], [20, 0]);
  const tagOpacity = interpolate(tagFrame, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  // CTA block
  const ctaFrame = Math.max(0, frame - 62);
  const ctaSpring = spring({ frame: ctaFrame, fps, config: SPRING });
  const ctaScale = interpolate(ctaSpring, [0, 1], [0.88, 1.0]);
  const ctaOpacity = interpolate(ctaFrame, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: fadeIn, backgroundColor: T.pageBg, overflow: "hidden" }}>

      {/* BG grid */}
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

      {/* Vignettes */}
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

        {/* Logo + wordmark */}
        <div style={{
          transform: `translateY(${logoY}px) scale(${logoScale})`,
          opacity: logoOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 8,
          willChange: "transform, opacity",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <CELogo size={76} />
            <span style={{
              fontSize: 76,
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

        {/* "Rhythm Lab" module name — teal accent */}
        <div style={{
          transform: `translateY(${modY}px)`,
          opacity: modOpacity,
          marginBottom: 28,
          willChange: "transform, opacity",
        }}>
          <span style={{
            fontSize: 46,
            fontWeight: 700,
            color: T.accent,
            fontFamily: T.mono,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            display: "block",
            textAlign: "center",
            textShadow: `0 0 32px rgba(10,191,188,0.40)`,
          }}>
            Rhythm Lab
          </span>
        </div>

        {/* Teal divider */}
        <div style={{
          width: 72,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${T.accent}, transparent)`,
          borderRadius: 1,
          marginBottom: 32,
          opacity: dividerOpacity,
          boxShadow: `0 0 20px ${T.accent}`,
        }} />

        {/* Tagline */}
        <div style={{
          transform: `translateY(${tagY}px)`,
          opacity: tagOpacity,
          textAlign: "center",
          marginBottom: 60,
          willChange: "transform, opacity",
        }}>
          <span style={{
            fontSize: 32,
            fontWeight: 400,
            color: T.textSecondary,
            fontFamily: T.sans,
            letterSpacing: "-0.015em",
            lineHeight: 1.4,
            display: "block",
          }}>
            Practice rhythm recognition
          </span>
          <span style={{
            fontSize: 32,
            fontWeight: 400,
            color: T.textSecondary,
            fontFamily: T.sans,
            letterSpacing: "-0.015em",
            lineHeight: 1.4,
            display: "block",
          }}>
            like real telemetry.
          </span>
        </div>

        {/* App Store CTA */}
        <div style={{
          transform: `scale(${ctaScale})`,
          opacity: ctaOpacity,
          textAlign: "center",
          willChange: "transform, opacity",
        }}>
          <span style={{
            fontSize: 28,
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
            fontSize: 72,
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
