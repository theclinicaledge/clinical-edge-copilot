import React, { useMemo, useRef } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  measureSpring,
  interpolate,
  interpolateColors,
  random,
} from "remotion";
import { ParticleField } from "../components/ParticleField";
import { GlowBackground } from "../components/GlowBackground";

// Scene 1: 0–195 local frames
// Content: 0–180 (6.0s)   Transition out: 180–195 (0.5s)
// No fade-in needed (opening scene)
//
// Lines: "Chest pain?" at 0, "What actually matters first?" at 45,
//        "Most people get this wrong." at 105
// Camera push-in: background slowly scales 1.0 → 1.022

const SPRING_CONFIG = { damping: 18, stiffness: 130, mass: 1.1 };
const TRANS = 15;

const LINE_CONFIGS = [
  { text: "Chest pain?", start: 0, fontSize: 152, weight: 900 },
  { text: "What actually matters first?", start: 45, fontSize: 72, weight: 700 },
  { text: "Most people get this wrong.", start: 105, fontSize: 68, weight: 600 },
];

// Spotlight vertical positions (% of height) per line
const SPOTLIGHT_Y_MAP = [47, 52, 58]; // tracks active line

interface HookLineProps {
  text: string;
  start: number;
  fontSize: number;
  weight: number;
  dimmed: boolean;
}

const HookLine: React.FC<HookLineProps> = ({
  text, start, fontSize, weight, dimmed,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = Math.max(0, frame - start);

  // Use measureSpring to know exact settle point
  const springSettleFrames = measureSpring({ config: SPRING_CONFIG, fps });

  const springVal = spring({
    frame: localFrame,
    fps,
    config: SPRING_CONFIG,
  });

  // Cinematic entry: rises from below with controlled settle
  const entryScale = interpolate(springVal, [0, 1], [0.82, 1]);
  const entryY = interpolate(springVal, [0, 1], [28, 0]);
  const entryOpacity = interpolate(localFrame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Dimmed lines: drop opacity + shift slightly cool/gray
  const finalOpacity = dimmed ? entryOpacity * 0.28 : entryOpacity;

  // Active line: slow breathing glow that starts after spring settles
  const glowStartFrame = springSettleFrames;
  const glowFrame = Math.max(0, localFrame - glowStartFrame);
  const glowColor = interpolateColors(
    Math.sin(glowFrame * 0.04 + start * 0.08),
    [-1, 1],
    ["rgba(255,255,255,0.45)", "rgba(0,194,203,0.75)"]
  );
  const textShadow = !dimmed
    ? `0 0 48px ${glowColor}, 0 0 96px rgba(0,194,203,0.18)`
    : "none";

  return (
    <div
      style={{
        transform: `translateY(${entryY}px) scale(${entryScale})`,
        opacity: finalOpacity,
        transformOrigin: "center",
        textAlign: "center",
        padding: "4px 0",
        willChange: "transform, opacity",
      }}
    >
      <span
        style={{
          fontSize,
          fontWeight: weight,
          color: dimmed ? "#4E6A7A" : "#FFFFFF",
          fontFamily: "Syne, system-ui, sans-serif",
          letterSpacing: "-0.03em",
          textShadow,
          display: "block",
          lineHeight: 1.05,
        }}
      >
        {text}
      </span>
    </div>
  );
};

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // ─── Transition out (fade + blur, last 15 frames) ───────────────────────────
  const fadeOut = interpolate(
    frame,
    [durationInFrames - TRANS, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const blurOut = interpolate(
    frame,
    [durationInFrames - TRANS, durationInFrames],
    [0, 7],
    { extrapolateLeft: "clamp" }
  );

  // ─── Camera push-in: background scales slowly ───────────────────────────────
  const cameraPush = interpolate(frame, [0, durationInFrames], [1.0, 1.022], {
    extrapolateRight: "clamp",
  });

  // ─── Spotlight behind active line ──────────────────────────────────────────
  const activeLineIdx = LINE_CONFIGS.reduce(
    (acc, l, i) => (frame >= l.start ? i : acc),
    0
  );
  const targetSpotY = SPOTLIGHT_Y_MAP[activeLineIdx];
  // Smooth spotlight position: interpolate toward target
  const spotlightY = interpolate(
    frame,
    [0, 44, 45, 100, 105, 180],
    [47, 47, 52, 52, 58, 58],
    { extrapolateRight: "clamp" }
  );
  const spotlightOpacity = interpolate(
    Math.sin(frame * 0.028),
    [-1, 1],
    [0.08, 0.18]
  );

  // ─── Light sweep: slow, elegant diagonal pan — frames 10–130 ───────────────
  const beamX = interpolate(frame, [10, 130], [-320, 1540], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const beamOpacity = interpolate(frame, [10, 32, 100, 130], [0, 0.18, 0.18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ─── Active line index for dimming logic ────────────────────────────────────
  const lastVisibleIdx = LINE_CONFIGS.reduce(
    (acc, l, idx) => (frame >= l.start ? idx : acc),
    -1
  );

  return (
    <AbsoluteFill
      style={{
        opacity: fadeOut,
        filter: blurOut > 0 ? `blur(${blurOut}px)` : undefined,
      }}
    >
      {/* ── Background layer (camera push-in) ───────────────────────────────── */}
      <AbsoluteFill
        style={{
          transform: `scale(${cameraPush})`,
          transformOrigin: "center center",
        }}
      >
        <GlowBackground intensity={1.15} />
        <ParticleField count={42} slowFactor={0.35} dimFactor={0.55} />
      </AbsoluteFill>

      {/* ── Spotlight behind active text ────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: `${spotlightY}%`,
          width: 1180,
          height: 560,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, rgba(0,194,203,${spotlightOpacity.toFixed(3)}) 0%, transparent 55%)`,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Light sweep ─────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: beamX,
          width: 260,
          height: "100%",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(0,194,203,0.08) 35%, rgba(0,194,203,0.16) 50%, rgba(0,194,203,0.08) 65%, transparent 100%)",
          opacity: beamOpacity,
          pointerEvents: "none",
          transform: "skewX(-10deg)",
        }}
      />

      {/* ── Hard vignette corners ───────────────────────────────────────────── */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 76% 88% at 50% 50%, transparent 28%, rgba(5,12,24,0.52) 68%, rgba(3,7,15,0.9) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Text content (no camera push — stays sharp and stable) ─────────── */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 30,
          paddingLeft: 64,
          paddingRight: 64,
        }}
      >
        {LINE_CONFIGS.map((cfg, i) => {
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
