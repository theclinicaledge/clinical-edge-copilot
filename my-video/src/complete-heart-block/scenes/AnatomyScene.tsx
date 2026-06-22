import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { T } from "../../clinical-edge-video/tokens";
import { completeHeartBlockData } from "../data";

const SP = { damping: 18, stiffness: 95, mass: 1.1 };

const AnatomyCard: React.FC<{
  frame: number;
  startFrame: number;
  fps: number;
  index: number;
  label: string;
  detail: string;
  color: string;
}> = ({ frame, startFrame, fps, index, label, detail, color }) => {
  const f = Math.max(0, frame - startFrame);
  const sp = spring({ frame: f, fps, config: SP });
  const y = interpolate(sp, [0, 1], [56, 0]);
  const opacity = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{
      transform: `translateY(${y}px)`,
      opacity,
      willChange: "transform, opacity",
      background: `linear-gradient(135deg, rgba(17,24,39,0.95) 0%, rgba(17,24,39,0.80) 100%)`,
      border: `1.5px solid ${color}38`,
      borderLeft: `4px solid ${color}`,
      borderRadius: 16,
      padding: "28px 32px",
      display: "flex",
      alignItems: "flex-start",
      gap: 24,
    }}>
      {/* Step number */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        background: `${color}18`,
        border: `1.5px solid ${color}60`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: 22,
          fontWeight: 800,
          color,
          fontFamily: T.sans,
        }}>
          {index + 1}
        </span>
      </div>

      {/* Content */}
      <div>
        <div style={{
          fontSize: 34,
          fontWeight: 700,
          color: T.textPrimary,
          fontFamily: T.sans,
          letterSpacing: "-0.025em",
          lineHeight: 1.2,
          marginBottom: 8,
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 24,
          fontWeight: 400,
          color: T.textSecondary,
          fontFamily: T.sans,
          lineHeight: 1.4,
        }}>
          {detail}
        </div>
      </div>
    </div>
  );
};

// ─── Arrow between cards ──────────────────────────────────────────────────────
const Arrow: React.FC<{ frame: number; startFrame: number }> = ({ frame, startFrame }) => {
  const f = Math.max(0, frame - startFrame);
  const opacity = interpolate(f, [0, 12], [0, 0.5], { extrapolateRight: "clamp" });
  return (
    <div style={{
      opacity,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: 28,
    }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 4 L12 20 M6 14 L12 20 L18 14"
          stroke="rgba(10,191,188,0.50)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

// ─── AnatomyScene ─────────────────────────────────────────────────────────────

export const AnatomyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const titleF = Math.max(0, frame - 4);
  const titleSp = spring({ frame: titleF, fps, config: SP });
  const titleY = interpolate(titleSp, [0, 1], [28, 0]);
  const titleOpacity = interpolate(titleF, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  // Cards stagger at 28-frame intervals
  const CARD_STARTS = [22, 50, 78];
  const ARROW_STARTS = [38, 66];

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
        background: `linear-gradient(90deg, ${T.accent}, rgba(10,191,188,0.3))`,
      }} />

      {/* ── Bottom vignette ── */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0, height: 180,
        background: `linear-gradient(0deg, ${T.pageBg} 0%, transparent 100%)`,
        pointerEvents: "none",
      }} />

      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        padding: "88px 72px 88px",
        gap: 0,
        justifyContent: "center",
      }}>

        {/* Title */}
        <div style={{
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          willChange: "transform, opacity",
          marginBottom: 48,
        }}>
          <div style={{
            fontSize: 22,
            fontWeight: 600,
            color: T.accent,
            fontFamily: T.sans,
            letterSpacing: "0.10em",
            textTransform: "uppercase" as const,
            marginBottom: 10,
          }}>
            What's happening
          </div>
          <div style={{
            fontSize: 72,
            fontWeight: 800,
            color: T.textPrimary,
            fontFamily: T.sans,
            letterSpacing: "-0.040em",
            lineHeight: 1.0,
          }}>
            Inside the heart
          </div>
        </div>

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {completeHeartBlockData.anatomySteps.map((step, i) => (
            <React.Fragment key={i}>
              <AnatomyCard
                frame={frame}
                startFrame={CARD_STARTS[i]}
                fps={fps}
                index={i}
                label={step.label}
                detail={step.detail}
                color={step.color}
              />
              {i < completeHeartBlockData.anatomySteps.length - 1 && (
                <Arrow frame={frame} startFrame={ARROW_STARTS[i]} />
              )}
            </React.Fragment>
          ))}
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
