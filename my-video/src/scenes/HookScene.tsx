import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  measureSpring,
  interpolate,
} from "remotion";
import { ParticleField } from "../components/ParticleField";
import { GlowBackground } from "../components/GlowBackground";

// Scene 1: 0–195 local frames (6.5s at 30fps)
// Structure:
//   0–18:    Atmosphere builds — ghost layer drifts in, glow breathes
//   18–46:   "I almost" enters via spring and settles
//   46–90:   "missed this." enters — deliberate pause = tension
//   72+:     "REAL SCENARIO" label fades in quietly
//   90–165:  Both lines hold — camera pushes slowly, ghost layer breathes
//   180–195: Cross-fade transition out
//
// Ghost clinical layer: HR 82, BP 128/76, SpO₂ 97% — deceptively normal vitals.
// The irony is intentional. They look fine. That's the point.

const SPRING_CONFIG = { damping: 17, stiffness: 118, mass: 1.2 };
const TRANS = 15;

// Ghost fragments — deceptively benign vitals of a near-miss patient.
// All values look unremarkable. Visible but clearly behind the main text.
const GHOST_FRAGMENTS = [
  { text: "HR  82",       xPct: 7,  yPct: 12, blur: 4,  maxOpacity: 0.38, driftAmp: 1.0, phase: 0.0  },
  { text: "BP  128 / 76", xPct: 55, yPct: 18, blur: 5,  maxOpacity: 0.32, driftAmp: 0.8, phase: 1.5  },
  { text: "SpO₂  97%",    xPct: 8,  yPct: 68, blur: 4,  maxOpacity: 0.40, driftAmp: 0.9, phase: 2.7  },
  { text: "Chest pain",   xPct: 54, yPct: 74, blur: 6,  maxOpacity: 0.28, driftAmp: 0.6, phase: 0.9  },
  { text: "onset  2h",    xPct: 28, yPct: 85, blur: 7,  maxOpacity: 0.24, driftAmp: 0.5, phase: 2.1  },
];

// ─── Ghost clinical fragment ──────────────────────────────────────────────────
interface GhostFragmentProps {
  text: string;
  xPct: number;
  yPct: number;
  blur: number;
  maxOpacity: number;
  driftAmp: number;
  phase: number;
  entryProgress: number;
}

const GhostFragment: React.FC<GhostFragmentProps> = ({
  text, xPct, yPct, blur, maxOpacity, driftAmp, phase, entryProgress,
}) => {
  const frame = useCurrentFrame();

  // Slow organic position drift — different x/y frequencies per fragment
  const driftX = Math.sin(frame * 0.006 + phase) * driftAmp;
  const driftY = Math.cos(frame * 0.0045 + phase * 0.72) * (driftAmp * 0.65);

  // Slow opacity breathing
  const breathOpacity =
    interpolate(Math.sin(frame * 0.017 + phase), [-1, 1], [maxOpacity * 0.62, maxOpacity]) *
    entryProgress;

  return (
    <div
      style={{
        position: "absolute",
        left: `${xPct + driftX}%`,
        top: `${yPct + driftY}%`,
        opacity: breathOpacity,
        filter: `blur(${blur}px)`,
        pointerEvents: "none",
        fontSize: 52,
        fontWeight: 600,
        color: "#8FBCCC",
        fontFamily: "DM Mono, monospace",
        letterSpacing: "0.05em",
        lineHeight: 1,
        whiteSpace: "nowrap",
        userSelect: "none",
      }}
    >
      {text}
    </div>
  );
};

// ─── Single hook line with cinematic entry ────────────────────────────────────
interface HookLineProps {
  text: string;
  startFrame: number;
  fontSize: number;
  weight: number;
}

const HookLine: React.FC<HookLineProps> = ({ text, startFrame, fontSize, weight }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = Math.max(0, frame - startFrame);
  const springSettleFrames = measureSpring({ config: SPRING_CONFIG, fps });

  const springVal = spring({ frame: localFrame, fps, config: SPRING_CONFIG });

  // Scale overshoot: springs past 1.0 then settles back
  const entryScale = interpolate(springVal, [0, 1], [0.84, 1.0]);
  const entryY = interpolate(springVal, [0, 1], [24, 0]);
  const entryOpacity = interpolate(localFrame, [0, 13], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Glow pulse: builds after spring settles, then breathes slowly
  const glowFrame = Math.max(0, localFrame - springSettleFrames);
  const glowBuild = interpolate(glowFrame, [0, 22], [0, 1], {
    extrapolateRight: "clamp",
  });
  const glowBreath = interpolate(Math.sin(glowFrame * 0.032), [-1, 1], [0.42, 1.0]);
  const glowStrength = glowBuild * glowBreath;

  const shadowBlur1 = 55 * glowStrength;
  const shadowBlur2 = 110 * glowStrength;
  const shadowOpacity1 = (0.50 * glowStrength).toFixed(3);
  const shadowOpacity2 = (0.10 * glowStrength).toFixed(3);

  return (
    <div
      style={{
        transform: `translateY(${entryY}px) scale(${entryScale})`,
        opacity: entryOpacity,
        transformOrigin: "center",
        textAlign: "center",
        willChange: "transform, opacity",
      }}
    >
      <span
        style={{
          fontSize,
          fontWeight: weight,
          color: "#FFFFFF",
          fontFamily: "Syne, system-ui, sans-serif",
          letterSpacing: "-0.04em",
          lineHeight: 1.0,
          display: "block",
          textShadow:
            glowStrength > 0.02
              ? `0 0 ${shadowBlur1}px rgba(0,194,203,${shadowOpacity1}), 0 0 ${shadowBlur2}px rgba(0,194,203,${shadowOpacity2}), 0 2px 0 rgba(0,0,0,0.55)`
              : "0 2px 0 rgba(0,0,0,0.55)",
        }}
      >
        {text}
      </span>
    </div>
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // ─── Transition out ──────────────────────────────────────────────────────────
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

  // ─── Camera push: very slow, cinematic ──────────────────────────────────────
  const cameraPush = interpolate(frame, [0, durationInFrames], [1.0, 1.024], {
    extrapolateRight: "clamp",
  });

  // ─── Ghost layer entry: fades in over first 40 frames ───────────────────────
  const ghostEntry = interpolate(frame, [0, 40], [0, 1], {
    extrapolateRight: "clamp",
  });

  // ─── "REAL SCENARIO" label: subtle, enters at frame 72 ───────────────────────
  const labelOpacity = interpolate(frame, [72, 90], [0, 0.44], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ─── Floor glow: teal rising from bottom, slow breath ───────────────────────
  const floorGlowOpacity =
    interpolate(Math.sin(frame * 0.018 + 0.4), [-1, 1], [0.09, 0.21]) *
    interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });

  // ─── Edge accents ────────────────────────────────────────────────────────────
  const edgeOpacity = interpolate(
    Math.sin(frame * 0.021 + 2.8),
    [-1, 1],
    [0.07, 0.15]
  );

  // ─── Light sweep: one slow diagonal pass ─────────────────────────────────────
  const beamX = interpolate(frame, [8, 125], [-320, 1540], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const beamOpacity = interpolate(frame, [8, 30, 105, 125], [0, 0.20, 0.20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity: fadeOut,
        filter: blurOut > 0 ? `blur(${blurOut}px)` : undefined,
      }}
    >
      {/* ── Layer 1: Background (camera push) ───────────────────────────────── */}
      <AbsoluteFill
        style={{
          transform: `scale(${cameraPush})`,
          transformOrigin: "center center",
        }}
      >
        <GlowBackground intensity={1.22} />
        <ParticleField count={40} slowFactor={0.30} dimFactor={0.50} />
      </AbsoluteFill>

      {/* ── Layer 2: Ghost clinical context ─────────────────────────────────── */}
      {GHOST_FRAGMENTS.map((f, i) => (
        <GhostFragment key={i} {...f} entryProgress={ghostEntry} />
      ))}

      {/* ── Atmospheric floor glow ───────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "50%",
          background: `radial-gradient(ellipse 88% 76% at 50% 100%, rgba(0,194,203,${floorGlowOpacity.toFixed(3)}) 0%, rgba(0,155,182,${(floorGlowOpacity * 0.30).toFixed(3)}) 38%, transparent 66%)`,
          pointerEvents: "none",
        }}
      />

      {/* ── Left edge teal accent ────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 165,
          height: "100%",
          background: `linear-gradient(90deg, rgba(0,194,203,${edgeOpacity.toFixed(3)}) 0%, rgba(0,194,203,${(edgeOpacity * 0.25).toFixed(3)}) 40%, transparent 100%)`,
          pointerEvents: "none",
        }}
      />

      {/* ── Right edge teal accent ───────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 115,
          height: "100%",
          background: `linear-gradient(270deg, rgba(0,152,180,${(edgeOpacity * 0.40).toFixed(3)}) 0%, transparent 100%)`,
          pointerEvents: "none",
        }}
      />

      {/* ── Light sweep ─────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: beamX,
          width: 270,
          height: "100%",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(0,194,203,0.06) 28%, rgba(0,194,203,0.15) 50%, rgba(0,194,203,0.06) 72%, transparent 100%)",
          opacity: beamOpacity,
          pointerEvents: "none",
          transform: "skewX(-10deg)",
        }}
      />

      {/* ── Corner vignette — grounds the frame ─────────────────────────────── */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 82% 90% at 50% 46%, transparent 22%, rgba(5,12,24,0.42) 60%, rgba(3,7,15,0.88) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Layer 3: Text content ────────────────────────────────────────────── */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          paddingLeft: 60,
          paddingRight: 60,
        }}
      >
        {/* "REAL SCENARIO" label — tiny composition anchor */}
        <div
          style={{
            position: "absolute",
            top: 200,
            left: 0,
            right: 0,
            textAlign: "center",
            opacity: labelOpacity,
          }}
        >
          <span
            style={{
              fontSize: 19,
              fontWeight: 600,
              color: "#00C2CB",
              fontFamily: "DM Mono, monospace",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            REAL SCENARIO
          </span>
        </div>

        {/* Line 1: "I almost" — enters first, hangs in the air */}
        {frame >= 18 && (
          <HookLine
            text="I almost"
            startFrame={18}
            fontSize={134}
            weight={900}
          />
        )}

        {/* Line 2: "missed this." — enters after a deliberate pause */}
        {frame >= 46 && (
          <HookLine
            text="missed this."
            startFrame={46}
            fontSize={122}
            weight={800}
          />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
