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

// Scene 2: 96–260 frames (local frame 0–164)
// UI typing simulation with line-by-line type-in

const LINES = [
  { label: "CHIEF COMPLAINT", text: "Pt c/o chest pain", start: 0 },
  { label: "VITALS", text: "HR 112, BP 148/88", start: 30 },
  { label: "OXYGEN", text: "SpO₂ 90% RA", start: 60 },
  { label: "APPEARANCE", text: "diaphoretic, anxious", start: 90 },
];

// How many chars of a string to show at a given progress
function typeIn(text: string, progress: number): string {
  const count = Math.floor(progress * text.length);
  return text.slice(0, count);
}

interface TypedLineProps {
  label: string;
  text: string;
  localStart: number;
  index: number;
}

const TypedLine: React.FC<TypedLineProps> = ({
  label,
  text,
  localStart,
  index,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lineFrame = Math.max(0, frame - localStart);

  // Entry spring
  const entrySpring = spring({
    frame: lineFrame,
    fps,
    config: { damping: 16, stiffness: 160, mass: 0.9 },
  });

  const entryY = interpolate(entrySpring, [0, 1], [20, 0]);
  const entryOpacity = interpolate(lineFrame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Typing progress: chars appear over ~25 frames
  const typeProgress = interpolate(lineFrame, [4, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const displayText = typeIn(text, typeProgress);

  // Cursor blink - only on last visible line
  const cursorVisible = typeProgress >= 1
    ? Math.floor(frame * 0.1) % 2 === 0
    : true;

  if (frame < localStart) return null;

  return (
    <div
      style={{
        transform: `translateY(${entryY}px)`,
        opacity: entryOpacity,
        marginBottom: 20,
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
          fontSize: 52,
          fontWeight: 700,
          color: "#FFFFFF",
          fontFamily: "Syne, system-ui, sans-serif",
          letterSpacing: "-0.01em",
          lineHeight: 1.15,
        }}
      >
        {displayText}
        <span
          style={{
            display: "inline-block",
            width: 3,
            height: "0.85em",
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
  const { fps } = useVideoConfig();

  // Submit flash at local frame ~124 (scene frame 220 = scene start 96, so local 124)
  const submitFlash = interpolate(frame, [118, 122, 128, 138], [0, 0.6, 0.6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Container breathe
  const containerScale = interpolate(
    Math.sin(frame * 0.05),
    [-1, 1],
    [0.988, 1.012]
  );

  // Container pulse on submit
  const submitScale = interpolate(frame, [118, 124, 134], [1, 1.03, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const finalScale = containerScale * submitScale;

  // Panel glow
  const glowSize = interpolate(
    Math.sin(frame * 0.06),
    [-1, 1],
    [12, 28]
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#0A1628" }}>
      <GlowBackground intensity={0.9} />
      <ParticleField count={40} slowFactor={0.5} dimFactor={0.7} />

      {/* Submit flash overlay */}
      <AbsoluteFill
        style={{
          backgroundColor: "#00C2CB",
          opacity: submitFlash,
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: 60,
          paddingRight: 60,
        }}
      >
        {/* Header label */}
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
              fontSize: 26,
              fontWeight: 600,
              color: "#00C2CB",
              fontFamily: "DM Mono, monospace",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              opacity: interpolate(frame, [0, 12], [0, 1], {
                extrapolateRight: "clamp",
              }),
            }}
          >
            CLINICAL SCENARIO
          </div>
        </div>

        {/* Main container panel */}
        <div
          style={{
            width: "100%",
            transform: `scale(${finalScale})`,
            transformOrigin: "center",
            borderRadius: 24,
            border: "1.5px solid rgba(0,194,203,0.45)",
            background: "rgba(0, 194, 203, 0.07)",
            boxShadow: `0 0 ${glowSize}px rgba(0,194,203,0.3), inset 0 0 40px rgba(0,194,203,0.03)`,
            padding: "48px 52px",
            backdropFilter: "blur(8px)",
          }}
        >
          {LINES.map((line, i) => (
            <TypedLine
              key={i}
              label={line.label}
              text={line.text}
              localStart={line.start}
              index={i}
            />
          ))}

          {/* Submit indicator */}
          {frame >= 115 && (
            <div
              style={{
                marginTop: 24,
                opacity: interpolate(frame, [115, 125, 135, 155], [0, 1, 1, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
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
                  fontSize: 26,
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
