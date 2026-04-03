import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { GlowBackground } from "../components/GlowBackground";
import { ParticleField }  from "../components/ParticleField";
import { ScenarioData }   from "../compositions/CopilotVideo";
import { T, urgencyTokens } from "../tokens";

const TRANS    = 15;
const STAGGER  = 88; // frames between each panel entry

// Panel entry config per index
function panelEntryFrame(i: number) {
  return TRANS + 20 + i * STAGGER;
}

interface PanelProps {
  label: string;
  content: string;
  entryFrame: number;
  frame: number;
  fps: number;
}

const OutputPanel: React.FC<PanelProps> = ({ label, content, entryFrame, frame, fps }) => {
  const localF = Math.max(0, frame - entryFrame);
  const s = spring({ frame: localF, fps, config: { damping: 20, stiffness: 130, mass: 0.95 } });
  const y  = interpolate(s, [0, 1], [40, 0]);
  const op = interpolate(localF, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  // Content text reveal: line by line fade after panel arrives
  const textReveal = interpolate(localF, [10, 36], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{
      transform: `translateY(${y}px)`,
      opacity: op,
      background: T.panelBg,
      border: `1px solid ${T.borderPanel}`,
      borderLeft: `7px solid ${T.teal}`,
      borderRadius: 24,
      padding: "32px 36px",
      marginBottom: 18,
    }}>
      <div style={{
        fontSize: 20,
        fontWeight: 700,
        color: T.teal,
        fontFamily: T.mono,
        letterSpacing: "0.14em",
        marginBottom: 14,
        opacity: 0.9,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 28,
        lineHeight: 1.60,
        color: T.textBody,
        fontFamily: T.body,
        fontWeight: 400,
        opacity: textReveal,
      }}>
        {content}
      </div>
    </div>
  );
};

interface Props { scenario: ScenarioData; }

export const CopilotOutputScene: React.FC<Props> = ({ scenario }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const urg = urgencyTokens(scenario.urgency);

  // Transitions
  const fadeIn  = interpolate(frame, [0, TRANS], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - TRANS, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const blurIn  = interpolate(frame, [0, TRANS], [7, 0], { extrapolateRight: "clamp" });
  const blurOut = interpolate(frame, [durationInFrames - TRANS, durationInFrames], [0, 7], {
    extrapolateLeft: "clamp",
  });
  const sceneOpacity = Math.min(fadeIn, fadeOut);
  const sceneBlur    = frame < TRANS ? blurIn : frame > durationInFrames - TRANS ? blurOut : 0;

  const cameraPush = interpolate(frame, [0, durationInFrames], [1.0, 1.016], { extrapolateRight: "clamp" });

  // Header + urgency badge entry
  const headerF = Math.max(0, frame - TRANS);
  const headerOp = interpolate(headerF, [0, 22], [0, 1], { extrapolateRight: "clamp" });
  const headerY  = interpolate(
    spring({ frame: headerF, fps, config: { damping: 18, stiffness: 130, mass: 1.0 } }),
    [0, 1], [24, 0]
  );

  return (
    <AbsoluteFill style={{
      opacity: sceneOpacity,
      filter: sceneBlur > 0 ? `blur(${sceneBlur}px)` : undefined,
    }}>
      {/* BG */}
      <AbsoluteFill style={{ transform: `scale(${cameraPush})`, transformOrigin: "center center" }}>
        <GlowBackground intensity={0.85} />
        <ParticleField count={20} slowFactor={0.18} dimFactor={0.28} />
      </AbsoluteFill>

      {/* Vignette */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse 90% 95% at 50% 40%, transparent 18%, rgba(5,12,24,0.32) 55%, rgba(3,7,15,0.75) 100%)",
        pointerEvents: "none",
      }} />

      {/* Content */}
      <AbsoluteFill style={{
        paddingLeft: 50,
        paddingRight: 50,
        paddingTop: 120,
        paddingBottom: 80,
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Header row */}
        <div style={{
          opacity: headerOp,
          transform: `translateY(${headerY}px)`,
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 32,
        }}>
          <span style={{
            fontSize: 22,
            fontWeight: 700,
            color: T.textDimmer,
            fontFamily: T.mono,
            letterSpacing: "0.18em",
          }}>
            COPILOT
          </span>
          {/* Urgency badge */}
          <div style={{
            background: urg.bg,
            border: `1px solid ${urg.border}`,
            borderRadius: 10,
            padding: "6px 18px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <div style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              backgroundColor: urg.color,
              boxShadow: `0 0 8px ${urg.color}`,
            }} />
            <span style={{
              fontSize: 20,
              fontWeight: 700,
              color: urg.color,
              fontFamily: T.mono,
              letterSpacing: "0.10em",
            }}>
              {scenario.urgency}
            </span>
          </div>
        </div>

        {/* Output panels */}
        {scenario.outputSections.map((section, i) => (
          <OutputPanel
            key={i}
            label={section.label}
            content={section.content}
            entryFrame={panelEntryFrame(i)}
            frame={frame}
            fps={fps}
          />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
