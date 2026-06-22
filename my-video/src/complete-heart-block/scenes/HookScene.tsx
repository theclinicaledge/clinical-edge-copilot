import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { T } from "../../clinical-edge-video/tokens";
import { HeartBlockStrip } from "../ecg/HeartBlockStrip";

const SP = { damping: 20, stiffness: 90, mass: 1.1 };

interface Props {
  hookLine: string;
  hookSub: string;
}

export const HookScene: React.FC<Props> = ({ hookLine, hookSub }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in
  const fadeIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Hook text springs in at frame 10
  const hookF = Math.max(0, frame - 10);
  const hookSpring = spring({ frame: hookF, fps, config: SP });
  const hookY = interpolate(hookSpring, [0, 1], [44, 0]);
  const hookOpacity = interpolate(hookF, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // Sub-label comes in at frame 26
  const subF = Math.max(0, frame - 26);
  const subSpring = spring({ frame: subF, fps, config: SP });
  const subY = interpolate(subSpring, [0, 1], [20, 0]);
  const subOpacity = interpolate(subF, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  // Pulsing red badge
  const pulse = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.7, 1.0]);
  const badgeF = Math.max(0, frame - 40);
  const badgeOpacity = interpolate(badgeF, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  // ECG strip: fade in at frame 0, low opacity for atmosphere
  const stripOpacity = interpolate(frame, [5, 35], [0, 0.18], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: T.pageBg, overflow: "hidden", opacity: fadeIn }}>

      {/* ── Subtle radial glow ── */}
      <div style={{
        position: "absolute",
        left: "50%", top: "40%",
        width: 900, height: 900, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(224,85,114,0.08) 0%, transparent 60%)",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }} />

      {/* ── ECG strip in background ── */}
      <div style={{
        position: "absolute",
        bottom: 120,
        left: 0,
        right: 0,
        opacity: stripOpacity,
      }}>
        <HeartBlockStrip
          width={1080}
          height={260}
          scrollSpeed={3.5}
          showGrid={false}
          pCycleW={120}
          qrsCycleW={248}
        />
      </div>

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

      {/* ── CE brand mark ── */}
      <div style={{
        position: "absolute",
        top: 72,
        left: 72,
        opacity: subOpacity,
      }}>
        <span style={{
          fontSize: 22,
          fontWeight: 700,
          color: T.accent,
          fontFamily: T.sans,
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
        }}>
          Clinical Edge
        </span>
      </div>

      {/* ── Center content ── */}
      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
        gap: 32,
      }}>

        {/* Hook line */}
        <div style={{
          transform: `translateY(${hookY}px)`,
          opacity: hookOpacity,
          willChange: "transform, opacity",
          textAlign: "center",
        }}>
          {hookLine.split("\n").map((line, i) => (
            <div key={i} style={{
              fontSize: i === 0 ? 98 : 94,
              fontWeight: 800,
              color: i === 0 ? T.textPrimary : "#e05572",
              fontFamily: T.sans,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
            }}>
              {line}
            </div>
          ))}
        </div>

        {/* Sub label */}
        <div style={{
          transform: `translateY(${subY}px)`,
          opacity: subOpacity,
          willChange: "transform, opacity",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}>
          <div style={{
            width: 32, height: 2,
            background: T.accent,
            borderRadius: 1,
          }} />
          <span style={{
            fontSize: 28,
            fontWeight: 500,
            color: T.textSecondary,
            fontFamily: T.sans,
            letterSpacing: "-0.01em",
          }}>
            {hookSub}
          </span>
          <div style={{
            width: 32, height: 2,
            background: T.accent,
            borderRadius: 1,
          }} />
        </div>

      </AbsoluteFill>

      {/* ── EMERGENCY badge ── */}
      <div style={{
        position: "absolute",
        bottom: 88,
        left: "50%",
        transform: "translateX(-50%)",
        opacity: badgeOpacity * pulse,
        background: "rgba(224,85,114,0.15)",
        border: "1.5px solid rgba(224,85,114,0.5)",
        borderRadius: 100,
        padding: "10px 32px",
      }}>
        <span style={{
          fontSize: 24,
          fontWeight: 700,
          color: "#e05572",
          fontFamily: T.sans,
          letterSpacing: "0.12em",
          textTransform: "uppercase" as const,
        }}>
          ⚠ MEDICAL EMERGENCY
        </span>
      </div>

      {/* ── Bottom vignette ── */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0, height: 180,
        background: `linear-gradient(0deg, ${T.pageBg} 0%, transparent 100%)`,
        pointerEvents: "none",
      }} />
    </AbsoluteFill>
  );
};
