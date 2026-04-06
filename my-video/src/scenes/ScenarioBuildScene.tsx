import React, { useMemo } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { ParticleField } from "../components/ParticleField";
import { GlowBackground } from "../components/GlowBackground";

// Scene 2: 0–255 local frames
// Transition in: 0–15   Transition out: 240–255
// Content: 0–240 (8.0s) — lines at 0, 50, 100, 150

const TRANS = 15;

const LINES = [
  { label: "CHIEF COMPLAINT", text: "Pt c/o chest pain", start: 0 },
  { label: "VITALS", text: "HR 112, BP 148/88", start: 50 },
  { label: "OXYGEN", text: "SpO₂ 90% RA", start: 100 },
  { label: "APPEARANCE", text: "diaphoretic, anxious", start: 150 },
];

function typeIn(text: string, progress: number): string {
  return text.slice(0, Math.floor(progress * text.length));
}

interface TypedLineProps {
  label: string;
  text: string;
  localStart: number;
}

const TypedLine: React.FC<TypedLineProps> = ({ label, text, localStart }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lineFrame = Math.max(0, frame - localStart);

  const entrySpring = spring({
    frame: lineFrame,
    fps,
    config: { damping: 20, stiffness: 125, mass: 1.05 },
  });

  const entryY = interpolate(entrySpring, [0, 1], [18, 0]);
  const entryOpacity = interpolate(lineFrame, [0, 14], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Type-in over 42 frames — deliberate cadence
  const typeProgress = interpolate(lineFrame, [6, 48], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const displayText = typeIn(text, typeProgress);

  // Slow cursor blink
  const cursorVisible =
    typeProgress >= 1 ? Math.floor(frame * 0.045) % 2 === 0 : true;

  if (frame < localStart) return null;

  return (
    <div
      style={{
        transform: `translateY(${entryY}px)`,
        opacity: entryOpacity,
        marginBottom: 30,
        willChange: "transform, opacity",
      }}
    >
      <div
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: "#00C2CB",
          fontFamily: "DM Mono, monospace",
          letterSpacing: "0.12em",
          marginBottom: 6,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 68,
          fontWeight: 700,
          color: "#FFFFFF",
          fontFamily: "Syne, system-ui, sans-serif",
          letterSpacing: "-0.02em",
          lineHeight: 1.12,
        }}
      >
        {displayText}
        <span
          style={{
            display: "inline-block",
            width: 3,
            height: "0.82em",
            backgroundColor: "#00C2CB",
            marginLeft: 4,
            verticalAlign: "middle",
            opacity: cursorVisible ? 1 : 0,
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  );
};

export const ScenarioBuildScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // ─── Transitions ────────────────────────────────────────────────────────────
  const fadeIn = interpolate(frame, [0, TRANS], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - TRANS, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const sceneOpacity = Math.min(fadeIn, fadeOut);

  const blurIn = interpolate(frame, [0, TRANS], [6, 0], { extrapolateRight: "clamp" });
  const blurOut = interpolate(
    frame,
    [durationInFrames - TRANS, durationInFrames],
    [0, 6],
    { extrapolateLeft: "clamp" }
  );
  const sceneBlur = frame < TRANS ? blurIn : frame > durationInFrames - TRANS ? blurOut : 0;

  // ─── Camera push-in ─────────────────────────────────────────────────────────
  const cameraPush = interpolate(frame, [0, durationInFrames], [1.0, 1.022], {
    extrapolateRight: "clamp",
  });

  // ─── Submit flash: slow teal wash, max 0.20 ─────────────────────────────────
  const submitFlash = interpolate(frame, [202, 214, 222, 238], [0, 0.2, 0.2, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ─── Container ──────────────────────────────────────────────────────────────
  const submitScale = interpolate(frame, [202, 213, 226], [1, 1.012, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const containerBreath = interpolate(Math.sin(frame * 0.038), [-1, 1], [0.993, 1.007]);
  const containerScale = containerBreath * submitScale;
  const glowSize = interpolate(Math.sin(frame * 0.038), [-1, 1], [10, 22]);

  // ─── Analyzing indicator ────────────────────────────────────────────────────
  const analyzingOpacity = interpolate(
    frame,
    [198, 211, 222, 238],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        opacity: sceneOpacity,
        filter: sceneBlur > 0 ? `blur(${sceneBlur}px)` : undefined,
      }}
    >
      {/* Background with camera push */}
      <AbsoluteFill
        style={{
          transform: `scale(${cameraPush})`,
          transformOrigin: "center center",
        }}
      >
        <GlowBackground intensity={0.85} />
        <ParticleField count={36} slowFactor={0.38} dimFactor={0.6} />
      </AbsoluteFill>

      {/* Submit flash — soft wash */}
      <AbsoluteFill
        style={{
          backgroundColor: "#00C2CB",
          opacity: submitFlash,
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: 60,
          paddingRight: 60,
        }}
      >
        {/* Section label */}
        <div
          style={{
            position: "absolute",
            top: 200,
            left: 0,
            right: 0,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: "#00C2CB",
              fontFamily: "DM Mono, monospace",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              opacity: interpolate(frame, [TRANS, TRANS + 18], [0, 1], {
                extrapolateRight: "clamp",
              }),
            }}
          >
            CLINICAL SCENARIO
          </div>
        </div>

        {/* Panel */}
        <div
          style={{
            width: "100%",
            transform: `scale(${containerScale})`,
            transformOrigin: "center",
            borderRadius: 24,
            border: "1.5px solid rgba(0,194,203,0.38)",
            background: "rgba(0,194,203,0.06)",
            boxShadow: `0 0 ${glowSize}px rgba(0,194,203,0.22), inset 0 0 40px rgba(0,194,203,0.02)`,
            padding: "52px 56px",
            backdropFilter: "blur(8px)",
          }}
        >
          {LINES.map((line, i) => (
            <TypedLine
              key={i}
              label={line.label}
              text={line.text}
              localStart={line.start}
            />
          ))}

          {frame >= 198 && (
            <div
              style={{
                marginTop: 28,
                opacity: analyzingOpacity,
                textAlign: "right",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 12,
                  backgroundColor: "#00C2CB",
                  color: "#0A1628",
                  fontFamily: "DM Mono, monospace",
                  fontWeight: 700,
                  fontSize: 24,
                  padding: "14px 28px",
                  borderRadius: 12,
                  letterSpacing: "0.08em",
                }}
              >
                ANALYZING ›
              </div>
            </div>
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
