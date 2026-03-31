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

// Scene 4: 0–225 local frames
// Transition in: 0–15   Transition out: 210–225
// Actions at: 0, 32, 68, 108, 148 — all visible and readable by ~190

const TRANS = 15;

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
    start: 32,
  },
  {
    num: "3",
    text: "Cardiac monitor + IV access",
    sub: "Get on the monitor. Establish IV. Know your baseline rhythm.",
    start: 68,
  },
  {
    num: "4",
    text: "12-lead ECG within 10 min",
    sub: "Time-sensitive. STEMI needs activation. Don't wait.",
    start: 108,
  },
  {
    num: "5",
    text: "Escalate early if unstable",
    sub: "Rapid response or provider — don't wait for permission to escalate.",
    start: 148,
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
  num, text, sub, localStart, isActive,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = Math.max(0, frame - localStart);

  const entrySpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 145, mass: 1.0 },
  });

  const entryY = interpolate(entrySpring, [0, 1], [22, 0]);
  const entryOpacity = interpolate(localFrame, [0, 14], [0, 1], {
    extrapolateRight: "clamp",
  });

  const activeScale = isActive ? 1.016 : 1;

  // Entry glow pulse — slow, settles gracefully
  const entryGlow = interpolate(localFrame, [0, 10, 28, 50], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const activeGlow = isActive
    ? interpolate(Math.sin(frame * 0.065), [-1, 1], [0.12, 0.4])
    : 0;
  const glowOpacity = Math.max(entryGlow * 0.55, activeGlow);

  if (frame < localStart) return null;

  return (
    <div
      style={{
        transform: `translateY(${entryY}px) scale(${activeScale})`,
        opacity: entryOpacity,
        transformOrigin: "left center",
        marginBottom: 24,
        position: "relative",
        willChange: "transform, opacity",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -8,
          borderRadius: 16,
          background: "rgba(0,194,203,0.09)",
          opacity: glowOpacity,
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 24 }}>
        <div
          style={{
            minWidth: 58,
            height: 58,
            borderRadius: 14,
            backgroundColor: isActive ? "#00C2CB" : "rgba(0,194,203,0.13)",
            border: "1.5px solid rgba(0,194,203,0.5)",
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
              color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.8)",
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
              color: "rgba(0,194,203,0.68)",
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
        <GlowBackground intensity={1.15} />
        <ParticleField count={20} slowFactor={0.2} dimFactor={0.38} />
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
            fontWeight: 700,
            color: "#00C2CB",
            fontFamily: "DM Mono, monospace",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: 38,
            opacity: interpolate(frame, [TRANS, TRANS + 18], [0, 1], {
              extrapolateRight: "clamp",
            }),
            textShadow: "0 0 16px rgba(0,194,203,0.45)",
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
