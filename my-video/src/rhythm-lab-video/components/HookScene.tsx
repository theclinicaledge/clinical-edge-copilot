import React from "react";
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig,
  spring, interpolate,
} from "remotion";
import { T } from "../../clinical-edge-video/tokens";
import { CELogo } from "../../clinical-edge-video/components/CELogo";
import { GrainOverlay } from "../../clinical-edge-video/components/GrainOverlay";
import { AppFlutterStrip } from "./AppFlutterStrip";

const SPR = { damping: 19, stiffness: 105, mass: 1.12 };

// Scene 1 — Hook: "Stop memorizing rhythms. Start recognizing them."
// Dark CE background. Premium large typography.
// Subtle strip bleeds in at the bottom — teaser of what's coming.

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeOut = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const camScale = interpolate(frame, [0, durationInFrames], [1.0, 1.046], {
    extrapolateRight: "clamp",
  });
  const glow1 = interpolate(Math.sin(frame * 0.026), [-1, 1], [0.05, 0.12]);
  const glow2 = interpolate(Math.sin(frame * 0.018 + 1.6), [-1, 1], [0.03, 0.07]);

  // Logo
  const logoOp = interpolate(frame, [4, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Line 1: "Stop memorizing" — springs in at frame 16
  const l1F  = Math.max(0, frame - 16);
  const l1Sp = spring({ frame: l1F, fps, config: SPR });
  const l1Y  = interpolate(l1Sp, [0, 1], [48, 0]);
  const l1Sc = interpolate(l1Sp, [0, 1], [0.86, 1.0]);
  const l1Op = interpolate(l1F, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  // Line 2: "rhythms." — springs in at frame 30
  const l2F  = Math.max(0, frame - 30);
  const l2Sp = spring({ frame: l2F, fps, config: SPR });
  const l2Y  = interpolate(l2Sp, [0, 1], [40, 0]);
  const l2Sc = interpolate(l2Sp, [0, 1], [0.88, 1.0]);
  const l2Op = interpolate(l2F, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  // Divider rule between the two pairs
  const divOp = interpolate(frame, [38, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Line 3: "Start recognizing" — springs in at frame 44
  const l3F  = Math.max(0, frame - 44);
  const l3Sp = spring({ frame: l3F, fps, config: SPR });
  const l3Y  = interpolate(l3Sp, [0, 1], [44, 0]);
  const l3Sc = interpolate(l3Sp, [0, 1], [0.86, 1.0]);
  const l3Op = interpolate(l3F, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  // Line 4: "them." with teal glow — springs in at frame 58
  const l4F  = Math.max(0, frame - 58);
  const l4Sp = spring({ frame: l4F, fps, config: SPR });
  const l4Y  = interpolate(l4Sp, [0, 1], [40, 0]);
  const l4Sc = interpolate(l4Sp, [0, 1], [0.88, 1.0]);
  const l4Op = interpolate(l4F, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const glowPulse = interpolate(frame, [72, 88], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  }) * interpolate(Math.sin(frame * 0.042), [-1, 1], [0.5, 1.0]);

  // Strip teaser — fades in at frame 38
  const stripOp = interpolate(frame, [38, 58], [0, 0.50], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fadeOut, backgroundColor: T.pageBg, overflow: "hidden" }}>

      {/* Parallax BG */}
      <AbsoluteFill style={{ transform: `scale(${camScale})`, transformOrigin: "50% 46%" }}>
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
          position: "absolute", left: "50%", top: "52%",
          width: 1000, height: 1000, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(10,191,188,${glow1.toFixed(3)}) 0%, transparent 55%)`,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", left: "80%", top: "26%",
          width: 620, height: 620, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(10,191,188,${glow2.toFixed(3)}) 0%, transparent 55%)`,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }} />
      </AbsoluteFill>

      {/* Top vignette */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 250,
        background: "linear-gradient(180deg, rgba(0,0,0,0.32) 0%, transparent 100%)",
        pointerEvents: "none",
      }} />
      {/* Bottom vignette — covers the strip */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 400,
        background: `linear-gradient(0deg, ${T.pageBg} 0%, rgba(17,24,39,0.50) 55%, transparent 100%)`,
        pointerEvents: "none",
      }} />

      <GrainOverlay opacity={0.026} />

      {/* Strip teaser at the very bottom */}
      <div style={{ position: "absolute", bottom: 0, left: 0, opacity: stripOp }}>
        <AppFlutterStrip width={1080} height={220} staticStrip />
      </div>

      {/* Content */}
      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "0 72px",
      }}>

        {/* Logo — top left */}
        <div style={{
          position: "absolute", top: 108, left: 72,
          display: "flex", alignItems: "center", gap: 14,
          opacity: logoOp,
        }}>
          <CELogo size={40} />
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{
              fontSize: 28, fontWeight: 700,
              color: T.textPrimary, fontFamily: T.sans, letterSpacing: "-0.02em", lineHeight: 1,
            }}>
              Clinical Edge
            </span>
            <span style={{
              fontSize: 14, fontWeight: 600,
              color: T.accent, fontFamily: T.mono,
              letterSpacing: "0.12em", textTransform: "uppercase", lineHeight: 1,
            }}>
              Rhythm Lab
            </span>
          </div>
        </div>

        {/* ── Pair 1: "Stop memorizing / rhythms." ── */}
        <div style={{ marginBottom: 0 }}>
          <div style={{
            transform: `translateY(${l1Y}px) scale(${l1Sc})`,
            opacity: l1Op,
            transformOrigin: "left center",
            willChange: "transform, opacity",
          }}>
            <span style={{
              fontSize: 100, fontWeight: 800,
              color: T.textSecondary, fontFamily: T.sans,
              letterSpacing: "-0.04em", lineHeight: 1.0, display: "block",
            }}>
              Stop
            </span>
          </div>
          <div style={{
            transform: `translateY(${l2Y}px) scale(${l2Sc})`,
            opacity: l2Op,
            transformOrigin: "left center",
            willChange: "transform, opacity",
          }}>
            <span style={{
              fontSize: 100, fontWeight: 800,
              color: T.textSecondary, fontFamily: T.sans,
              letterSpacing: "-0.04em", lineHeight: 1.0, display: "block",
            }}>
              memorizing.
            </span>
          </div>
        </div>

        {/* Divider rule */}
        <div style={{
          width: 52, height: 2,
          background: T.accent, borderRadius: 1,
          margin: "24px 0",
          opacity: divOp,
          boxShadow: `0 0 12px ${T.accent}`,
        }} />

        {/* ── Pair 2: "Start recognizing / them." ── */}
        <div>
          <div style={{
            transform: `translateY(${l3Y}px) scale(${l3Sc})`,
            opacity: l3Op,
            transformOrigin: "left center",
            willChange: "transform, opacity",
          }}>
            <span style={{
              fontSize: 100, fontWeight: 800,
              color: T.textPrimary, fontFamily: T.sans,
              letterSpacing: "-0.04em", lineHeight: 1.0, display: "block",
            }}>
              Start
            </span>
          </div>
          <div style={{
            transform: `translateY(${l4Y}px) scale(${l4Sc})`,
            opacity: l4Op,
            transformOrigin: "left center",
            willChange: "transform, opacity",
          }}>
            <span style={{
              fontSize: 100, fontWeight: 800,
              fontFamily: T.sans, letterSpacing: "-0.04em", lineHeight: 1.0, display: "block",
              color: T.textPrimary,
              textShadow: `0 0 ${64 * glowPulse}px rgba(10,191,188,${(0.50 * glowPulse).toFixed(3)})`,
            }}>
              recognizing.
            </span>
          </div>
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
