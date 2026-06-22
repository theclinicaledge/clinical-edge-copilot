import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { T } from "../../clinical-edge-video/tokens";
import { completeHeartBlockData } from "../data";

const SP = { damping: 18, stiffness: 95, mass: 1.05 };

const ActionItem: React.FC<{
  frame: number;
  startFrame: number;
  fps: number;
  index: number;
  text: string;
}> = ({ frame, startFrame, fps, index, text }) => {
  const f = Math.max(0, frame - startFrame);
  const sp = spring({ frame: f, fps, config: SP });
  const x = interpolate(sp, [0, 1], [-56, 0]);
  const opacity = interpolate(f, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  // Priority accent: first item is red/urgent
  const isUrgent = index === 0;
  const accentColor = isUrgent ? "#e05572" : T.accent;

  return (
    <div style={{
      transform: `translateX(${x}px)`,
      opacity,
      willChange: "transform, opacity",
      display: "flex",
      alignItems: "center",
      gap: 20,
      padding: "18px 0",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
    }}>
      {/* Index dot */}
      <div style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: accentColor,
        flexShrink: 0,
        boxShadow: `0 0 10px ${accentColor}`,
      }} />

      {/* Text */}
      <span style={{
        fontSize: isUrgent ? 32 : 30,
        fontWeight: isUrgent ? 700 : 500,
        color: isUrgent ? "#f4a4a4" : T.textPrimary,
        fontFamily: T.sans,
        letterSpacing: "-0.020em",
        lineHeight: 1.25,
      }}>
        {text}
      </span>
    </div>
  );
};

// ─── NursingScene ─────────────────────────────────────────────────────────────

export const NursingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const titleF = Math.max(0, frame - 4);
  const titleSp = spring({ frame: titleF, fps, config: SP });
  const titleY = interpolate(titleSp, [0, 1], [28, 0]);
  const titleOpacity = interpolate(titleF, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  // Stagger each action by 16 frames
  const ACTION_STARTS = [20, 36, 52, 68, 84, 100];

  // Closing line
  const closingF = Math.max(0, frame - 124);
  const closingOpacity = interpolate(closingF, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: T.pageBg, overflow: "hidden", opacity: fadeIn }}>

      {/* ── Grid bg ── */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(10,191,188,0.012) 1px, transparent 1px),
          linear-gradient(90deg, rgba(10,191,188,0.012) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
        pointerEvents: "none",
      }} />

      {/* ── Top bar ── */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, height: 6,
        background: `linear-gradient(90deg, #e05572, rgba(224,85,114,0.3))`,
      }} />

      {/* ── Radial red glow ── */}
      <div style={{
        position: "absolute",
        right: -200, top: "30%",
        width: 700, height: 700, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(224,85,114,0.06) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />

      {/* ── Bottom vignette ── */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0, height: 160,
        background: `linear-gradient(0deg, ${T.pageBg} 0%, transparent 100%)`,
        pointerEvents: "none",
      }} />

      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        padding: "88px 72px 88px",
        gap: 0,
      }}>

        {/* Title */}
        <div style={{
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          willChange: "transform, opacity",
          marginBottom: 36,
        }}>
          <div style={{
            fontSize: 22,
            fontWeight: 600,
            color: "#e05572",
            fontFamily: T.sans,
            letterSpacing: "0.10em",
            textTransform: "uppercase" as const,
            marginBottom: 10,
          }}>
            Nursing priorities
          </div>
          <div style={{
            fontSize: 72,
            fontWeight: 800,
            color: T.textPrimary,
            fontFamily: T.sans,
            letterSpacing: "-0.040em",
            lineHeight: 1.0,
          }}>
            Do this. Now.
          </div>
        </div>

        {/* Actions */}
        <div style={{ flex: 1 }}>
          {completeHeartBlockData.nursingActions.map((action, i) => (
            <ActionItem
              key={i}
              frame={frame}
              startFrame={ACTION_STARTS[i] ?? i * 16 + 20}
              fps={fps}
              index={i}
              text={action}
            />
          ))}
        </div>

        {/* Closing line */}
        <div style={{
          opacity: closingOpacity,
          marginTop: 28,
          padding: "20px 24px",
          borderLeft: `3px solid ${T.accent}`,
          background: T.accentDim,
          borderRadius: "0 12px 12px 0",
        }}>
          {completeHeartBlockData.closingLine.split("\n").map((line, i) => (
            <div key={i} style={{
              fontSize: i === 0 ? 26 : 22,
              fontWeight: i === 0 ? 600 : 400,
              color: i === 0 ? T.textPrimary : T.textSecondary,
              fontFamily: T.sans,
              fontStyle: "italic",
              lineHeight: 1.5,
              letterSpacing: "-0.01em",
            }}>
              {line}
            </div>
          ))}
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
