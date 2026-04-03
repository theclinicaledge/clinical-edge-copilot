import React, { useMemo } from "react";
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

// Spotlight vertical positions (% of height) per active line
const SPOTLIGHT_Y_MAP = [47, 52, 58];

// ─── Depth grid — subtle horizontal lines for atmosphere ──────────────────────
interface DepthGridProps {
  opacity: number;
}
const DepthGrid: React.FC<DepthGridProps> = ({ opacity }) => {
  const frame = useCurrentFrame();
  // 9 horizontal lines spaced across middle 70% of frame height
  const lines = useMemo(() => {
    return Array.from({ length: 9 }, (_, i) => {
      const yPct = 22 + i * 7.5; // 22% to 82%
      const seed = i * 31 + 7;
      const widthPct = 28 + random(seed) * 44; // 28%–72% width
      const xOffsetPct = (100 - widthPct) / 2 + (random(seed + 1) - 0.5) * 12;
      const lineOpacity = 0.04 + random(seed + 2) * 0.05; // 0.04–0.09
      return { yPct, widthPct, xOffsetPct, lineOpacity };
    });
  }, []);

  // Lines drift very slowly upward
  const drift = (frame * 0.04) % 100;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        pointerEvents: "none",
      }}
    >
      {lines.map((l, i) => {
        const y = ((l.yPct + drift) % 90) + 5; // wrap 5%–95%
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${y}%`,
              left: `${l.xOffsetPct}%`,
              width: `${l.widthPct}%`,
              height: 1,
              background: `linear-gradient(90deg, transparent 0%, rgba(0,194,203,${l.lineOpacity.toFixed(3)}) 25%, rgba(0,194,203,${(l.lineOpacity * 1.4).toFixed(3)}) 50%, rgba(0,194,203,${l.lineOpacity.toFixed(3)}) 75%, transparent 100%)`,
            }}
          />
        );
      })}
    </div>
  );
};

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

  // Dimmed lines: drop opacity + shift cool/gray
  const finalOpacity = dimmed ? entryOpacity * 0.25 : entryOpacity;

  // Active line: slow breathing glow that starts after spring settles
  const glowStartFrame = springSettleFrames;
  const glowFrame = Math.max(0, localFrame - glowStartFrame);
  const glowColor = interpolateColors(
    Math.sin(glowFrame * 0.04 + start * 0.08),
    [-1, 1],
    ["rgba(255,255,255,0.45)", "rgba(0,194,203,0.80)"]
  );
  const textShadow = !dimmed
    ? `0 0 52px ${glowColor}, 0 0 110px rgba(0,194,203,0.18), 0 2px 0 rgba(0,0,0,0.4)`
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
          color: dimmed ? "#3E5A6A" : "#FFFFFF",
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
  const cameraPush = interpolate(frame, [0, durationInFrames], [1.0, 1.025], {
    extrapolateRight: "clamp",
  });

  // ─── Spotlight: follows active line, breathing opacity ─────────────────────
  const spotlightY = interpolate(
    frame,
    [0, 44, 45, 100, 105, 180],
    [47, 47, 52, 52, 58, 58],
    { extrapolateRight: "clamp" }
  );
  const spotlightOpacity = interpolate(
    Math.sin(frame * 0.028),
    [-1, 1],
    [0.14, 0.30]
  );

  // ─── Secondary spotlight — offset, slower pulse, adds depth ─────────────────
  const spot2Opacity = interpolate(
    Math.sin(frame * 0.018 + 1.6),
    [-1, 1],
    [0.06, 0.14]
  );

  // ─── Light sweep: slow diagonal pan — frames 10–130 ────────────────────────
  const beamX = interpolate(frame, [10, 130], [-320, 1540], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const beamOpacity = interpolate(frame, [10, 32, 100, 130], [0, 0.22, 0.22, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ─── Floor glow: rises from bottom, breathes slowly ─────────────────────────
  const floorGlowOpacity = interpolate(
    Math.sin(frame * 0.019 + 0.5),
    [-1, 1],
    [0.12, 0.26]
  );
  // Floor glow entry: fades in over first 30 frames
  const floorGlowEntry = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  // ─── Left edge accent — vertical teal strip, very subtle ───────────────────
  const edgeOpacity = interpolate(
    Math.sin(frame * 0.024 + 3.2),
    [-1, 1],
    [0.08, 0.18]
  );

  // ─── Depth grid entry opacity ────────────────────────────────────────────────
  const gridOpacity = interpolate(frame, [0, 45], [0, 1], {
    extrapolateRight: "clamp",
  }) * 0.7;

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
        <GlowBackground intensity={1.25} />
        <ParticleField count={48} slowFactor={0.32} dimFactor={0.52} />
      </AbsoluteFill>

      {/* ── Depth grid — very subtle horizontal line atmosphere ─────────────── */}
      <DepthGrid opacity={gridOpacity} />

      {/* ── Floor glow — teal rising from bottom third ───────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "52%",
          background: `radial-gradient(ellipse 90% 80% at 50% 100%, rgba(0,194,203,${(floorGlowOpacity * floorGlowEntry).toFixed(3)}) 0%, rgba(0,160,185,${(floorGlowOpacity * floorGlowEntry * 0.35).toFixed(3)}) 38%, transparent 68%)`,
          pointerEvents: "none",
        }}
      />

      {/* ── Left edge accent — subtle vertical teal band ──────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 180,
          height: "100%",
          background: `linear-gradient(90deg, rgba(0,194,203,${edgeOpacity.toFixed(3)}) 0%, rgba(0,194,203,${(edgeOpacity * 0.3).toFixed(3)}) 45%, transparent 100%)`,
          pointerEvents: "none",
        }}
      />

      {/* ── Right edge accent — mirror, different phase ─────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 120,
          height: "100%",
          background: `linear-gradient(270deg, rgba(0,160,185,${(edgeOpacity * 0.45).toFixed(3)}) 0%, transparent 100%)`,
          pointerEvents: "none",
        }}
      />

      {/* ── Primary spotlight behind active text line ────────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: `${spotlightY}%`,
          width: 1320,
          height: 680,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, rgba(0,194,203,${spotlightOpacity.toFixed(3)}) 0%, rgba(0,194,203,${(spotlightOpacity * 0.18).toFixed(3)}) 42%, transparent 65%)`,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Secondary spotlight — wider, softer, lower ──────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "62%",
          width: 1100,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, rgba(0,128,175,${spot2Opacity.toFixed(3)}) 0%, transparent 58%)`,
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
          width: 280,
          height: "100%",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(0,194,203,0.07) 30%, rgba(0,194,203,0.17) 50%, rgba(0,194,203,0.07) 70%, transparent 100%)",
          opacity: beamOpacity,
          pointerEvents: "none",
          transform: "skewX(-10deg)",
        }}
      />

      {/* ── Vignette — darkens corners and bottom, grounds the frame ────────── */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 80% 90% at 50% 44%, transparent 25%, rgba(5,12,24,0.46) 64%, rgba(3,7,15,0.88) 100%)",
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
