import React, { useRef } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { ParticleField } from "../components/ParticleField";
import { GlowBackground } from "../components/GlowBackground";

// Scene 3: 0–255 local frames
// Transition in: 0–15   Transition out: 240–255
// Panels: start=0/70/148, activeEnd=90/170/240

const TRANS = 15;

const PANELS = [
  {
    headline: "SpO₂ 90% RA",
    body: "Oxygenation is already compromised. Not borderline — this needs action right now.",
    start: 0,
    activeEnd: 90,
  },
  {
    headline: "Chest pain + tachycardia",
    body: "HR 112 with chest pain points toward a cardiac cause until proven otherwise.",
    start: 70,
    activeEnd: 170,
  },
  {
    headline: "Diaphoresis = high stress response",
    body: "Wet, anxious, tachycardic — the body is compensating. This pattern demands rapid escalation.",
    start: 148,
    activeEnd: 240,
  },
];

interface ReasoningPanelItemProps {
  headline: string;
  body: string;
  localStart: number;
  active: boolean;
  index: number;
}

const ReasoningPanelItem: React.FC<ReasoningPanelItemProps> = ({
  headline, body, localStart, active, index,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = Math.max(0, frame - localStart);

  const entrySpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 135, mass: 1.0 },
  });

  const entryX = interpolate(entrySpring, [0, 1], [22, 0]);
  const entryOpacity = interpolate(localFrame, [0, 16], [0, 1], {
    extrapolateRight: "clamp",
  });

  const inactiveOpacity = active ? 1 : 0.24;
  const finalOpacity = entryOpacity * inactiveOpacity;

  const activeScale = active ? 1.022 : 1;

  // Glow pulse — builds gradually on active (no instant jump)
  const glowBuildFrame = active ? Math.max(0, frame - localStart) : 0;
  const glowBuild = interpolate(glowBuildFrame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const glowPulse = active
    ? interpolate(Math.sin(frame * 0.05 + index), [-1, 1], [12, 28]) * glowBuild
    : 0;

  const borderOpacity = active ? 0.78 : 0.16;
  const bgOpacity = active ? 0.1 : 0.025;

  if (frame < localStart) return null;

  return (
    <div
      style={{
        transform: `translateX(${entryX}px) scale(${activeScale})`,
        opacity: finalOpacity,
        transformOrigin: "center",
        marginBottom: 26,
        borderRadius: 20,
        border: `1.5px solid rgba(0,194,203,${borderOpacity})`,
        background: `rgba(0,194,203,${bgOpacity})`,
        boxShadow:
          active && glowPulse > 0
            ? `0 0 ${glowPulse}px rgba(0,194,203,0.4), 0 0 ${glowPulse * 2}px rgba(0,194,203,0.08)`
            : "none",
        padding: "28px 32px",
        backdropFilter: "blur(6px)",
        willChange: "transform, opacity",
      }}
    >
      <div
        style={{
          fontSize: active ? 50 : 46,
          fontWeight: 700,
          color: active ? "#FFFFFF" : "#6A8B9A",
          fontFamily: "Syne, system-ui, sans-serif",
          letterSpacing: "-0.01em",
          lineHeight: 1.1,
          marginBottom: 12,
        }}
      >
        {headline}
      </div>
      <div
        style={{
          fontSize: 34,
          fontWeight: 400,
          color: active ? "rgba(255,255,255,0.76)" : "rgba(255,255,255,0.22)",
          fontFamily: "DM Sans, system-ui, sans-serif",
          lineHeight: 1.45,
        }}
      >
        {body}
      </div>
    </div>
  );
};

export const ReasoningScene: React.FC = () => {
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

  // Subtle background blur increases as we progress (focus attention forward)
  const bgBlur = interpolate(frame, [0, 60, 240], [0, 0, 1.0], {
    extrapolateRight: "clamp",
  });

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
        <GlowBackground intensity={1.05} blurAmount={bgBlur} />
        <ParticleField count={26} slowFactor={0.28} dimFactor={0.42} />
      </AbsoluteFill>

      {/* Content */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 56,
          paddingRight: 56,
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "#00C2CB",
            fontFamily: "DM Mono, monospace",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: 42,
            opacity: interpolate(frame, [TRANS, TRANS + 20], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          CLINICAL PATTERN RECOGNITION
        </div>

        {PANELS.map((panel, i) => {
          const isActive = frame >= panel.start && frame < panel.activeEnd;

          return (
            <ReasoningPanelItem
              key={i}
              headline={panel.headline}
              body={panel.body}
              localStart={panel.start}
              active={isActive}
              index={i}
            />
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
