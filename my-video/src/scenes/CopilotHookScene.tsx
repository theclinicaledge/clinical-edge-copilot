import React, { useMemo } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  measureSpring,
  interpolate,
} from "remotion";
import { GlowBackground } from "../components/GlowBackground";
import { ParticleField }  from "../components/ParticleField";
import { ScenarioData }   from "../compositions/CopilotVideo";
import { T, urgencyTokens } from "../tokens";

const TRANS = 15;
const SPRING_CFG = { damping: 16, stiffness: 125, mass: 1.15 };

interface Props { scenario: ScenarioData; }

export const CopilotHookScene: React.FC<Props> = ({ scenario }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const urg = urgencyTokens(scenario.urgency);

  // Transition out (this is S1 — no fade-in)
  const fadeOut = interpolate(frame, [durationInFrames - TRANS, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const blurOut = interpolate(frame, [durationInFrames - TRANS, durationInFrames], [0, 7], {
    extrapolateLeft: "clamp",
  });

  const cameraPush = interpolate(frame, [0, durationInFrames], [1.0, 1.022], {
    extrapolateRight: "clamp",
  });

  // Ghost fragments fade in over first 30f
  const ghostEntry = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });

  // Line 1 — enters at frame 16
  const l1Frame = Math.max(0, frame - 16);
  const l1Spring = spring({ frame: l1Frame, fps, config: SPRING_CFG });
  const l1Scale   = interpolate(l1Spring, [0, 1], [0.86, 1.0]);
  const l1Y       = interpolate(l1Spring, [0, 1], [28, 0]);
  const l1Opacity = interpolate(l1Frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  // Line 2 — enters at frame 40
  const l2Frame = Math.max(0, frame - 40);
  const l2Spring = spring({ frame: l2Frame, fps, config: SPRING_CFG });
  const l2Scale   = interpolate(l2Spring, [0, 1], [0.86, 1.0]);
  const l2Y       = interpolate(l2Spring, [0, 1], [28, 0]);
  const l2Opacity = interpolate(l2Frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  // Glow pulse starts after line 1 settles
  const settle = measureSpring({ config: SPRING_CFG, fps });
  const glowFrame = Math.max(0, l1Frame - settle);
  const glowBuild = interpolate(glowFrame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const glowBreath = interpolate(Math.sin(glowFrame * 0.04), [-1, 1], [0.45, 1.0]);
  const glowOpacity = glowBuild * glowBreath;

  // Label appears at frame 65
  const labelOpacity = interpolate(frame, [65, 80], [0, 0.52], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Urgency dot pulse
  const dotPulse = interpolate(Math.sin(frame * 0.06), [-1, 1], [0.7, 1.0]);

  // Ghost fragments config
  const frags = useMemo(() => scenario.ghostFragments ?? [], [scenario]);

  return (
    <AbsoluteFill style={{
      opacity: fadeOut,
      filter: blurOut > 0 ? `blur(${blurOut}px)` : undefined,
    }}>
      {/* BG layer with camera push */}
      <AbsoluteFill style={{ transform: `scale(${cameraPush})`, transformOrigin: "center center" }}>
        <GlowBackground intensity={1.15} />
        <ParticleField count={32} slowFactor={0.28} dimFactor={0.45} />
      </AbsoluteFill>

      {/* Ghost clinical fragments */}
      {frags.map((f, i) => {
        const phase = i * 1.3;
        const dx = Math.sin(frame * 0.006 + phase) * 1.0;
        const dy = Math.cos(frame * 0.005 + phase * 0.7) * 0.8;
        const breath = interpolate(Math.sin(frame * 0.018 + phase), [-1, 1], [0.75, 1.15]);
        return (
          <div key={i} style={{
            position: "absolute",
            left: `${f.xPct + dx}%`,
            top: `${f.yPct + dy}%`,
            opacity: ghostEntry * 0.34 * breath,
            filter: "blur(4.5px)",
            fontSize: 52,
            fontWeight: 600,
            color: "#8FC8D8",
            fontFamily: T.mono,
            letterSpacing: "0.04em",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}>
            {f.text}
          </div>
        );
      })}

      {/* Vignette */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse 82% 88% at 50% 46%, transparent 22%, rgba(5,12,24,0.42) 60%, rgba(3,7,15,0.86) 100%)",
        pointerEvents: "none",
      }} />

      {/* Content */}
      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: 64,
        paddingRight: 64,
      }}>
        {/* Label */}
        {scenario.hookLabel && (
          <div style={{
            position: "absolute",
            top: 200,
            left: 0, right: 0,
            textAlign: "center",
            opacity: labelOpacity,
            fontSize: 22,
            fontWeight: 700,
            color: T.teal,
            fontFamily: T.mono,
            letterSpacing: "0.20em",
          }}>
            {scenario.hookLabel}
          </div>
        )}

        {/* Urgency dot */}
        <div style={{
          position: "absolute",
          top: 280,
          left: 0, right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: labelOpacity * dotPulse,
        }}>
          <div style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: urg.color,
            boxShadow: `0 0 12px ${urg.color}`,
          }} />
        </div>

        {/* Hook line 1 */}
        <div style={{
          transform: `translateY(${l1Y}px) scale(${l1Scale})`,
          opacity: l1Opacity,
          textAlign: "center",
          marginBottom: scenario.hookLine2 ? 8 : 0,
          willChange: "transform, opacity",
        }}>
          <span style={{
            fontSize: 118,
            fontWeight: 900,
            color: T.textPrimary,
            fontFamily: T.sans,
            letterSpacing: "-0.038em",
            lineHeight: 1.0,
            display: "block",
            textShadow: `0 0 ${56 * glowOpacity}px rgba(0,194,209,${(0.50 * glowOpacity).toFixed(3)}), 0 2px 0 rgba(0,0,0,0.5)`,
          }}>
            {scenario.hookLine1}
          </span>
        </div>

        {/* Hook line 2 */}
        {scenario.hookLine2 && (
          <div style={{
            transform: `translateY(${l2Y}px) scale(${l2Scale})`,
            opacity: l2Opacity,
            textAlign: "center",
            willChange: "transform, opacity",
          }}>
            <span style={{
              fontSize: 104,
              fontWeight: 800,
              color: T.textPrimary,
              fontFamily: T.sans,
              letterSpacing: "-0.038em",
              lineHeight: 1.0,
              display: "block",
              textShadow: "0 2px 0 rgba(0,0,0,0.5)",
            }}>
              {scenario.hookLine2}
            </span>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
