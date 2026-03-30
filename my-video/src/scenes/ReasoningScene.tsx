import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { ParticleField } from "../components/ParticleField";
import { GlowBackground } from "../components/GlowBackground";

// Scene 3: 260–420 frames (local frame 0–160)
// Three reasoning panels, one active at a time

const PANELS = [
  {
    headline: "SpO₂ 90% RA",
    body: "Oxygenation is already compromised. This isn't borderline — it's a number that needs action right now.",
    icon: "🫁",
    start: 0,
    activeEnd: 55,
  },
  {
    headline: "Chest pain + tachycardia",
    body: "HR 112 with chest pain points toward a cardiac cause until proven otherwise. Don't dismiss it.",
    icon: "⚡",
    start: 40,
    activeEnd: 110,
  },
  {
    headline: "Diaphoresis = high stress response",
    body: "Wet, anxious, tachycardic — the body is compensating hard. This pattern demands rapid escalation.",
    icon: "🔴",
    start: 85,
    activeEnd: 160,
  },
];

interface ReasoningPanelItemProps {
  headline: string;
  body: string;
  icon: string;
  localStart: number;
  active: boolean;
  index: number;
}

const ReasoningPanelItem: React.FC<ReasoningPanelItemProps> = ({
  headline,
  body,
  icon,
  localStart,
  active,
  index,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = Math.max(0, frame - localStart);

  const entrySpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 14, stiffness: 170, mass: 0.85 },
  });

  const entryX = interpolate(entrySpring, [0, 1], [30, 0]);
  const entryOpacity = interpolate(localFrame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  const inactiveOpacity = active ? 1 : 0.28;
  const finalOpacity = entryOpacity * inactiveOpacity;

  const activeScale = active ? 1.03 : 1;

  const glowPulse = active
    ? interpolate(Math.sin(frame * 0.08 + index), [-1, 1], [16, 36])
    : 0;

  const borderOpacity = active ? 0.85 : 0.2;
  const bgOpacity = active ? 0.13 : 0.04;

  if (frame < localStart) return null;

  return (
    <div
      style={{
        transform: `translateX(${entryX}px) scale(${activeScale})`,
        opacity: finalOpacity,
        transformOrigin: "center",
        marginBottom: 24,
        borderRadius: 20,
        border: `1.5px solid rgba(0,194,203,${borderOpacity})`,
        background: `rgba(0,194,203,${bgOpacity})`,
        boxShadow: active
          ? `0 0 ${glowPulse}px rgba(0,194,203,0.5), 0 0 ${glowPulse * 2}px rgba(0,194,203,0.15)`
          : "none",
        padding: "28px 32px",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 20,
        }}
      >
        <div style={{ fontSize: 48, lineHeight: 1, marginTop: 4 }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: active ? 50 : 46,
              fontWeight: 700,
              color: active ? "#FFFFFF" : "#99BAC9",
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
              color: active ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.3)",
              fontFamily: "DM Sans, system-ui, sans-serif",
              lineHeight: 1.45,
            }}
          >
            {body}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ReasoningScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Background blur increases to force focus
  const bgBlur = interpolate(frame, [0, 40, 160], [0, 0, 1.5], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0A1628" }}>
      <GlowBackground intensity={1.1} blurAmount={bgBlur} />
      <ParticleField count={30} slowFactor={0.35} dimFactor={0.5} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 56,
          paddingRight: 56,
        }}
      >
        {/* Scene header */}
        <div
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: "#00C2CB",
            fontFamily: "DM Mono, monospace",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: 40,
            opacity: interpolate(frame, [0, 14], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          CLINICAL PATTERN RECOGNITION
        </div>

        {PANELS.map((panel, i) => {
          const isActive =
            frame >= panel.start && frame < panel.activeEnd;
          const wasActive = frame >= panel.activeEnd;
          const isVisible = frame >= panel.start;

          // After a panel's active period, keep it visible but dimmed
          const active = isActive;

          return (
            <ReasoningPanelItem
              key={i}
              headline={panel.headline}
              body={panel.body}
              icon={panel.icon}
              localStart={panel.start}
              active={active}
              index={i}
            />
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
