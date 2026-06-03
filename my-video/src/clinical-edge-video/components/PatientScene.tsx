import React from "react";
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig,
  spring, interpolate,
} from "remotion";
import { T } from "../tokens";
import { GrainOverlay } from "./GrainOverlay";
import { Vital } from "../data/scenarios";

const SPRING = { damping: 26, stiffness: 160, mass: 0.80 };

interface Props { vitals: Vital[] }

export const PatientScene: React.FC<Props> = ({ vitals }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Warm cream panel slides up from bottom — cinematic reveal
  const panelY = interpolate(frame, [0, 28], [1920, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Section label
  const labelOpacity = interpolate(frame, [22, 38], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // "Something changed." heading
  const headFrame = Math.max(0, frame - 26);
  const headSpring = spring({ frame: headFrame, fps, config: SPRING });
  const headY = interpolate(headSpring, [0, 1], [30, 0]);
  const headOpacity = interpolate(headFrame, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  // Background glow
  const glow = interpolate(Math.sin(frame * 0.022), [-1, 1], [0.04, 0.10]);

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut, backgroundColor: T.pageBg, overflow: "hidden" }}>

      {/* Dark navy BG with subtle teal bloom */}
      <div style={{
        position: "absolute", left: "50%", top: "35%",
        width: 900, height: 900, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(10,191,188,${glow.toFixed(3)}) 0%, transparent 56%)`,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }} />

      <GrainOverlay opacity={0.022} />

      {/* ── Warm cream panel — sweeps up from bottom ── */}
      {/* Matches the app's E7E1D6 workspace */}
      <div style={{
        position: "absolute",
        left: 0, right: 0,
        top: panelY,
        bottom: 0,
        background: T.workspaceBg,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        boxShadow: "0 -20px 80px rgba(0,0,0,0.45)",
        overflow: "hidden",
      }}>

        {/* Subtle inner gradient on the cream panel */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 180,
          background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)",
          pointerEvents: "none",
        }} />

        {/* Teal accent bar — minimal, no label text */}
        <div style={{
          position: "absolute", top: 56, left: 72,
          opacity: labelOpacity,
        }}>
          <div style={{
            width: 36, height: 2, background: T.accent, borderRadius: 1,
          }} />
        </div>

        {/* Panel content */}
        <div style={{
          padding: "110px 72px 60px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
        }}>

          {/* "Something changed." — large dark type on cream */}
          <div style={{
            transform: `translateY(${headY}px)`,
            opacity: headOpacity,
            marginBottom: 48,
          }}>
            <span style={{
              fontSize: 78,
              fontWeight: 800,
              color: "#111827",
              fontFamily: T.sans,
              letterSpacing: "-0.04em",
              lineHeight: 1.0,
            }}>
              Something changed.
            </span>
          </div>

          {/* ── Vital rows — staggered, typed onto the cream panel ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {vitals.filter(v => v.value !== "").map((vital, i) => {
              const entryStart = 30 + i * 14;
              const vFrame = Math.max(0, frame - entryStart);
              const vSpring = spring({ frame: vFrame, fps, config: SPRING });
              const vX = interpolate(vSpring, [0, 1], [44, 0]);
              const vOpacity = interpolate(vFrame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
              const isFlagged = vital.flagged;

              return (
                <div key={i} style={{
                  transform: `translateX(${vX}px)`,
                  opacity: vOpacity,
                  willChange: "transform, opacity",
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  paddingTop: 22,
                  paddingBottom: 22,
                  borderBottom: i < vitals.filter(v => v.value !== "").length - 1
                    ? "1px solid rgba(0,0,0,0.08)" : "none",
                }}>
                  {/* Label — large enough to read on phone */}
                  <span style={{
                    fontSize: 40,
                    fontWeight: 500,
                    color: isFlagged ? "#8E2F2F" : T.textSubtle,
                    fontFamily: T.mono,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}>
                    {vital.label}
                  </span>

                  {/* Value — large, dominant */}
                  <span style={{
                    fontSize: isFlagged ? 82 : 72,
                    fontWeight: 800,
                    color: isFlagged ? T.urgHighText : "#111827",
                    fontFamily: T.sans,
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                  }}>
                    {vital.value}
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Dark navy top strip — branding context */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: Math.max(0, panelY - 0),
        background: T.pageBg,
        display: "flex",
        alignItems: "center",
        paddingLeft: 80,
        paddingBottom: 32,
        justifyContent: "flex-start",
        alignContent: "flex-end",
      }} />

    </AbsoluteFill>
  );
};
