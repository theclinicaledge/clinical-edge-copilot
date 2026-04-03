import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { GlowBackground } from "../components/GlowBackground";
import { T } from "../tokens";

const TRANS = 15;

export const CopilotSafetyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

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

  const textOpacity = interpolate(frame, [TRANS, TRANS + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      opacity: sceneOpacity,
      filter: sceneBlur > 0 ? `blur(${sceneBlur}px)` : undefined,
    }}>
      <GlowBackground intensity={0.65} />

      <AbsoluteFill style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: 80,
        paddingRight: 80,
      }}>
        <div style={{
          opacity: textOpacity,
          textAlign: "center",
          borderTop: `1px solid rgba(0,194,209,0.18)`,
          borderBottom: `1px solid rgba(0,194,209,0.18)`,
          padding: "28px 0",
        }}>
          <div style={{
            fontSize: 26,
            fontWeight: 500,
            color: T.textMuted,
            fontFamily: T.mono,
            letterSpacing: "0.04em",
            lineHeight: 1.6,
          }}>
            Use clinical judgment
          </div>
          <div style={{
            fontSize: 26,
            fontWeight: 500,
            color: T.textMuted,
            fontFamily: T.mono,
            letterSpacing: "0.04em",
            lineHeight: 1.6,
          }}>
            and your team.
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
