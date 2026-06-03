import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Background } from "./Background";
import { ECGLine } from "./ECGLine";
import { T } from "../styles/tokens";
import { ClinicalScenario } from "../data/scenarios";

const CFG = { damping: 18, stiffness: 130, mass: 1.0 };

interface Props { scenario: ClinicalScenario }

export const HookScene: React.FC<Props> = ({ scenario }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Fade out last 12 frames
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Label appears at frame 8
  const labelOpacity = interpolate(frame, [8, 22], [0, 0.55], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Hook text enters at frame 20
  const hookFrame = Math.max(0, frame - 20);
  const hookSpring = spring({ frame: hookFrame, fps, config: CFG });
  const hookY = interpolate(hookSpring, [0, 1], [36, 0]);
  const hookScale = interpolate(hookSpring, [0, 1], [0.88, 1.0]);
  const hookOpacity = interpolate(hookFrame, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  // Teal glow pulse after hook settles
  const glowPulse = interpolate(Math.sin(frame * 0.05), [-1, 1], [0.4, 0.9]);
  const glowOpacity = interpolate(frame, [44, 60], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  }) * glowPulse;

  // ECG line fades in at frame 30
  const ecgOpacity = interpolate(frame, [30, 50], [0, 0.45], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Subtle camera drift
  const camScale = interpolate(frame, [0, durationInFrames], [1.0, 1.018], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ transform: `scale(${camScale})`, transformOrigin: "center center" }}>
        <Background />
      </AbsoluteFill>

      {/* ECG line near bottom third */}
      <div style={{ position: "absolute", bottom: 340, left: 0, right: 0, opacity: ecgOpacity }}>
        <ECGLine width={1080} color={T.teal} />
      </div>

      {/* Content */}
      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: 72,
        paddingRight: 72,
      }}>
        {/* Label */}
        <div style={{
          position: "absolute",
          top: 188,
          left: 0, right: 0,
          textAlign: "center",
          opacity: labelOpacity,
        }}>
          <span style={{
            fontSize: 22,
            fontWeight: 700,
            color: T.teal,
            fontFamily: T.mono,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}>
            {scenario.label}
          </span>
        </div>

        {/* Urgency dot */}
        <div style={{
          position: "absolute",
          top: 264,
          left: 0, right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: labelOpacity,
        }}>
          <div style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            backgroundColor: T.urgHigh,
            boxShadow: `0 0 14px ${T.urgHigh}`,
          }} />
        </div>

        {/* Hook text */}
        <div style={{
          transform: `translateY(${hookY}px) scale(${hookScale})`,
          opacity: hookOpacity,
          textAlign: "center",
          willChange: "transform, opacity",
          marginTop: 40,
        }}>
          <span style={{
            fontSize: 96,
            fontWeight: 900,
            color: T.textPrimary,
            fontFamily: T.sans,
            letterSpacing: "-0.035em",
            lineHeight: 1.05,
            display: "block",
            textShadow: `0 0 ${52 * glowOpacity}px rgba(0,194,209,${(0.45 * glowOpacity).toFixed(3)}), 0 2px 0 rgba(0,0,0,0.55)`,
          }}>
            {scenario.hook}
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
