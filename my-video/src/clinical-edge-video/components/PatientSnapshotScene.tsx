import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { T } from "../tokens";
import { Vital } from "../data/scenarios";

const SPRING = { damping: 22, stiffness: 145, mass: 0.88 };

interface Props {
  vitals: Vital[];
}

export const PatientSnapshotScene: React.FC<Props> = ({ vitals }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Label + header enter
  const headerOpacity = interpolate(frame, [6, 22], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Header spring
  const headFrame = Math.max(0, frame - 6);
  const headSpring = spring({ frame: headFrame, fps, config: SPRING });
  const headY = interpolate(headSpring, [0, 1], [20, 0]);

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut, backgroundColor: T.pageBg }}>

      {/* Subtle grid — same as hook scene */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(10,191,188,0.020) 1px, transparent 1px),
          linear-gradient(90deg, rgba(10,191,188,0.020) 1px, transparent 1px)
        `,
        backgroundSize: "88px 88px",
        pointerEvents: "none",
      }} />

      {/* Warm glow — low opacity */}
      <div style={{
        position: "absolute", left: "50%", top: "38%",
        width: 800, height: 800, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(10,191,188,0.06) 0%, transparent 58%)`,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }} />

      {/* Bottom fade */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 300,
        background: `linear-gradient(0deg, ${T.pageBg} 0%, transparent 100%)`,
        pointerEvents: "none",
      }} />

      {/* ── Content ── */}
      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        paddingTop: 180,
        paddingLeft: 64,
        paddingRight: 64,
      }}>

        {/* Section label */}
        <div style={{
          transform: `translateY(${headY}px)`,
          opacity: headerOpacity,
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: T.accent,
            boxShadow: `0 0 10px ${T.accent}`,
            flexShrink: 0,
          }} />
          <span style={{
            fontSize: 24,
            fontWeight: 500,
            color: T.accent,
            fontFamily: T.mono,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}>
            Patient Snapshot
          </span>
        </div>

        {/* Scene heading */}
        <div style={{ opacity: headerOpacity, marginBottom: 52 }}>
          <span style={{
            fontSize: 68,
            fontWeight: 800,
            color: T.textPrimary,
            fontFamily: T.sans,
            letterSpacing: "-0.04em",
            lineHeight: 1.04,
          }}>
            Something just changed.
          </span>
        </div>

        {/* ── Vitals card — styled as dark input card from real app ── */}
        {/* background: #1E2A3A, border: rgba(240,237,230,0.10) */}
        <div style={{
          background: T.darkCard,
          border: `1px solid ${T.darkCardBorder2}`,
          borderRadius: 12,
          overflow: "hidden",
        }}>

          {/* Card header */}
          <div style={{
            padding: "20px 32px",
            borderBottom: `1px solid ${T.darkCardBorder2}`,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: T.accent, flexShrink: 0,
            }} />
            <span style={{
              fontSize: 20,
              fontWeight: 500,
              color: T.accent,
              fontFamily: T.mono,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
            }}>
              Current Vitals
            </span>
          </div>

          {/* Vital rows — staggered entry */}
          {vitals.filter(v => v.label !== "" || v.value !== "").map((vital, i) => {
            const isPatientRow = vital.value === "" && !vital.flagged;
            const entryStart = 20 + i * 11;
            const vFrame = Math.max(0, frame - entryStart);
            const vSpring = spring({ frame: vFrame, fps, config: SPRING });
            const vX = interpolate(vSpring, [0, 1], [36, 0]);
            const vOpacity = interpolate(vFrame, [0, 12], [0, 1], {
              extrapolateRight: "clamp",
            });

            return (
              <div key={i} style={{
                transform: `translateX(${vX}px)`,
                opacity: vOpacity,
                willChange: "transform, opacity",
                display: "flex",
                alignItems: "center",
                justifyContent: isPatientRow ? "flex-start" : "space-between",
                padding: isPatientRow ? "18px 32px 10px" : "20px 32px",
                borderBottom: i < vitals.length - 1
                  ? `1px solid rgba(255,255,255,0.05)` : "none",
              }}>
                {isPatientRow ? (
                  // Patient identity row — full-width label
                  <span style={{
                    fontSize: 32,
                    fontWeight: 600,
                    color: T.textSecondary,
                    fontFamily: T.sans,
                    letterSpacing: "-0.01em",
                  }}>
                    {vital.label}
                  </span>
                ) : (
                  <>
                    {/* Label */}
                    <span style={{
                      fontSize: 28,
                      fontWeight: 500,
                      color: T.textMuted,
                      fontFamily: T.mono,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}>
                      {vital.label}
                    </span>

                    {/* Value */}
                    <span style={{
                      fontSize: vital.flagged ? 54 : 48,
                      fontWeight: vital.flagged ? 800 : 700,
                      color: vital.flagged ? T.urgHighDark : T.textPrimary,
                      fontFamily: T.sans,
                      letterSpacing: "-0.03em",
                      textShadow: vital.flagged
                        ? `0 0 30px rgba(244,164,164,0.40)` : undefined,
                    }}>
                      {vital.value}
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
