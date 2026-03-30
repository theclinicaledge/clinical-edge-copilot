import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  interpolateColors,
} from "remotion";
import { ParticleField } from "../components/ParticleField";
import { GlowBackground } from "../components/GlowBackground";

// Scene 1: 0–96 frames
// Three lines stack up, each entering with spring + scale overshoot
// Previous lines dim to 0.4 opacity

const LINE_CONFIGS = [
  { text: "Chest pain?", start: 0, fontSize: 110, weight: 800 },
  { text: "What actually matters first?", start: 18, fontSize: 68, weight: 700 },
  { text: "Most people get this wrong.", start: 40, fontSize: 64, weight: 600 },
];

interface HookLineProps {
  text: string;
  start: number;
  fontSize: number;
  weight: number;
  dimmed: boolean;
}

const HookLine: React.FC<HookLineProps> = ({
  text,
  start,
  fontSize,
  weight,
  dimmed,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = Math.max(0, frame - start);

  const springVal = spring({
    frame: localFrame,
    fps,
    config: { damping: 11, stiffness: 200, mass: 0.75 },
  });

  const entryScale = interpolate(springVal, [0, 1], [0.6, 1]);
  const entryY = interpolate(springVal, [0, 1], [40, 0]);
  const entryOpacity = interpolate(localFrame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  const targetOpacity = dimmed ? 0.38 : 1;
  const finalOpacity =
    entryOpacity * (dimmed ? targetOpacity : Math.min(entryOpacity, targetOpacity));

  // Color glow pulse on active line
  const glowColor = interpolateColors(
    Math.sin(frame * 0.09 + start * 0.3),
    [-1, 1],
    ["#FFFFFF", "#00C2CB"]
  );

  const textShadow = !dimmed
    ? `0 0 30px ${glowColor}60, 0 0 60px ${glowColor}25`
    : "none";

  return (
    <div
      style={{
        transform: `translateY(${entryY}px) scale(${entryScale})`,
        opacity: finalOpacity,
        transformOrigin: "center",
        transition: "opacity 0.3s",
        textAlign: "center",
        padding: "4px 0",
      }}
    >
      <span
        style={{
          fontSize,
          fontWeight: weight,
          color: dimmed ? "#AAC4D4" : "#FFFFFF",
          fontFamily: "Syne, system-ui, sans-serif",
          letterSpacing: "-0.02em",
          textShadow,
          display: "block",
          lineHeight: 1.1,
        }}
      >
        {text}
      </span>
    </div>
  );
};

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Light flare sweep: frame 8–28
  const flareX = interpolate(frame, [8, 28], [-200, 1400], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flareOpacity = interpolate(frame, [8, 14, 22, 28], [0, 0.55, 0.55, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0A1628" }}>
      {/* Background layers */}
      <GlowBackground intensity={1.2} />
      <ParticleField count={55} slowFactor={0.6} />

      {/* Light flare sweep */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: flareX,
          width: 200,
          height: "100%",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(0,194,203,0.18) 50%, transparent 100%)",
          opacity: flareOpacity,
          pointerEvents: "none",
          transform: "skewX(-15deg)",
        }}
      />

      {/* Lines container */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          paddingLeft: 60,
          paddingRight: 60,
        }}
      >
        {LINE_CONFIGS.map((cfg, i) => {
          // Dim all lines except the last one that has appeared
          const lastVisibleIdx = LINE_CONFIGS.reduce(
            (acc, l, idx) => (frame >= l.start ? idx : acc),
            -1
          );
          const isDimmed = i < lastVisibleIdx;
          const hasStarted = frame >= cfg.start;

          if (!hasStarted) return null;

          return (
            <HookLine
              key={i}
              text={cfg.text}
              start={cfg.start}
              fontSize={cfg.fontSize}
              weight={cfg.weight}
              dimmed={isDimmed}
            />
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
