import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Background } from "./Background";
import { ECGLine } from "./ECGLine";
import { PhoneMockup } from "./PhoneMockup";
import { T } from "../styles/tokens";
import { ClinicalScenario } from "../data/scenarios";

const CFG = { damping: 22, stiffness: 120, mass: 1.1 };

interface Props { scenario: ClinicalScenario }

export const CopilotReasoningScene: React.FC<Props> = ({ scenario }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Phone enters from bottom
  const phoneFrame = Math.max(0, frame - 12);
  const phoneSpring = spring({ frame: phoneFrame, fps, config: CFG });
  const phoneY = interpolate(phoneSpring, [0, 1], [80, 0]);
  const phoneScale = interpolate(phoneSpring, [0, 1], [0.90, 1.0]);
  const phoneOpacity = interpolate(phoneFrame, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  // Reasoning progress: 0→1 over frames 30–140
  const typingProgress = interpolate(frame, [30, 140], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Label fades in
  const labelOpacity = interpolate(frame, [4, 18], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Side glow pulse
  const glowPulse = interpolate(Math.sin(frame * 0.04), [-1, 1], [0.6, 1.0]);

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      <Background showGrid />

      {/* ECG at bottom */}
      <div style={{ position: "absolute", bottom: 180, left: 0, right: 0, opacity: 0.3 }}>
        <ECGLine width={1080} color={T.teal} />
      </div>

      {/* Ambient side glows */}
      <div style={{
        position: "absolute",
        left: -100, top: "35%",
        width: 400, height: 400,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(0,194,209,${(0.12 * glowPulse).toFixed(3)}) 0%, transparent 60%)`,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        right: -100, top: "45%",
        width: 350, height: 350,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(0,150,180,${(0.09 * glowPulse).toFixed(3)}) 0%, transparent 60%)`,
        pointerEvents: "none",
      }} />

      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: 60,
        paddingRight: 60,
      }}>
        {/* Section label */}
        <div style={{
          position: "absolute",
          top: 180,
          left: 0, right: 0,
          textAlign: "center",
          opacity: labelOpacity,
        }}>
          <span style={{
            fontSize: 20,
            fontWeight: 700,
            color: T.teal,
            fontFamily: T.mono,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}>
            Clinical Edge Copilot
          </span>
        </div>

        {/* Headline */}
        <div style={{
          position: "absolute",
          top: 232,
          left: 0, right: 0,
          textAlign: "center",
          opacity: labelOpacity,
          paddingLeft: 64,
          paddingRight: 64,
        }}>
          <span style={{
            fontSize: 38,
            fontWeight: 800,
            color: T.textPrimary,
            fontFamily: T.sans,
            letterSpacing: "-0.025em",
            lineHeight: 1.15,
          }}>
            AI clinical reasoning,{"\n"}in seconds.
          </span>
        </div>

        {/* Phone mockup */}
        <div style={{
          transform: `translateY(${phoneY}px) scale(${phoneScale})`,
          opacity: phoneOpacity,
          willChange: "transform, opacity",
          marginTop: 120,
        }}>
          <PhoneMockup
            prompt={scenario.copilotPrompt}
            typingProgress={typingProgress}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
