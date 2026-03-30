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

// Scene 4: 420–560 frames (local frame 0–140)
// Priority action list — staggered entry, no meds

const ACTIONS = [
  {
    num: "1",
    text: "Assess ABCs + SpO₂ immediately",
    sub: "Airway. Breathing. Circulation. In that order.",
    start: 0,
  },
  {
    num: "2",
    text: "Apply O₂ if hypoxic",
    sub: "SpO₂ 90% needs supplemental O₂ now — nasal cannula or NRB.",
    start: 22,
  },
  {
    num: "3",
    text: "Cardiac monitor + IV access",
    sub: "Get on the monitor. Establish IV. Know your baseline rhythm.",
    start: 44,
  },
  {
    num: "4",
    text: "12-lead ECG within 10 min",
    sub: "Time-sensitive. STEMI needs activation. Don't wait.",
    start: 66,
  },
  {
    num: "5",
    text: "Escalate early if unstable",
    sub: "Rapid response or provider — don't wait for permission to escalate.",
    start: 90,
  },
];

interface ActionLineProps {
  num: string;
  text: string;
  sub: string;
  localStart: number;
  isActive: boolean;
}

const ActionLine: React.FC<ActionLineProps> = ({
  num,
  text,
  sub,
  localStart,
  isActive,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = Math.max(0, frame - localStart);

  const entrySpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 15, stiffness: 190, mass: 0.8 },
  });

  const entryY = interpolate(entrySpring, [0, 1], [28, 0]);
  const entryOpacity = interpolate(localFrame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  const activeScale = isActive ? 1.02 : 1;

  // Teal glow pulse when first entering (frames 0–20 after start)
  const entryGlow = interpolate(localFrame, [0, 6, 18, 30], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Persistent glow for active line
  const activeGlow = isActive
    ? interpolate(Math.sin(frame * 0.1), [-1, 1], [0.2, 0.6])
    : 0;

  const glowOpacity = Math.max(entryGlow * 0.7, activeGlow);

  if (frame < localStart) return null;

  return (
    <div
      style={{
        transform: `translateY(${entryY}px) scale(${activeScale})`,
        opacity: entryOpacity,
        transformOrigin: "left center",
        marginBottom: 22,
        position: "relative",
      }}
    >
      {/* Glow flash on entry */}
      <div
        style={{
          position: "absolute",
          inset: -8,
          borderRadius: 16,
          background: "rgba(0,194,203,0.12)",
          opacity: glowOpacity,
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 24 }}>
        {/* Number badge */}
        <div
          style={{
            minWidth: 56,
            height: 56,
            borderRadius: 14,
            backgroundColor: isActive
              ? "#00C2CB"
              : "rgba(0,194,203,0.18)",
            border: "1.5px solid rgba(0,194,203,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
            fontWeight: 800,
            color: isActive ? "#0A1628" : "#00C2CB",
            fontFamily: "Syne, system-ui, sans-serif",
            flexShrink: 0,
            marginTop: 4,
          }}
        >
          {num}
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: isActive ? 50 : 46,
              fontWeight: 700,
              color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.85)",
              fontFamily: "Syne, system-ui, sans-serif",
              letterSpacing: "-0.01em",
              lineHeight: 1.1,
              marginBottom: 8,
            }}
          >
            {text}
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 400,
              color: "rgba(0,194,203,0.75)",
              fontFamily: "DM Sans, system-ui, sans-serif",
              lineHeight: 1.4,
            }}
          >
            {sub}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PriorityActionsScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: "#0A1628" }}>
      <GlowBackground intensity={1.3} />
      <ParticleField count={25} slowFactor={0.25} dimFactor={0.45} />

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
            fontWeight: 700,
            color: "#00C2CB",
            fontFamily: "DM Mono, monospace",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: 36,
            opacity: interpolate(frame, [0, 14], [0, 1], {
              extrapolateRight: "clamp",
            }),
            textShadow: "0 0 20px rgba(0,194,203,0.6)",
          }}
        >
          PRIORITY ACTIONS
        </div>

        {ACTIONS.map((action, i) => {
          const nextStart = ACTIONS[i + 1]?.start ?? 999;
          const isActive = frame >= action.start && frame < nextStart;

          return (
            <ActionLine
              key={i}
              num={action.num}
              text={action.text}
              sub={action.sub}
              localStart={action.start}
              isActive={isActive}
            />
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
