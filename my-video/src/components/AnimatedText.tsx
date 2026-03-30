import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

interface AnimatedTextProps {
  text: string;
  delay?: number;
  fontSize?: number;
  fontWeight?: string | number;
  color?: string;
  glow?: boolean;
  glowColor?: string;
  opacity?: number;
  style?: React.CSSProperties;
  scaleOvershoot?: boolean;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  delay = 0,
  fontSize = 72,
  fontWeight = 700,
  color = "#FFFFFF",
  glow = false,
  glowColor = "#00C2CB",
  opacity = 1,
  style = {},
  scaleOvershoot = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = Math.max(0, frame - delay);

  const springVal = spring({
    frame: localFrame,
    fps,
    config: {
      damping: scaleOvershoot ? 12 : 20,
      stiffness: 180,
      mass: 0.8,
    },
  });

  const entryScale = interpolate(springVal, [0, 1], [0.7, 1]);
  const entryOpacity = interpolate(
    localFrame,
    [0, 10],
    [0, opacity],
    { extrapolateRight: "clamp" }
  );

  const glowPulse = glow
    ? interpolate(
        Math.sin(frame * 0.08 + delay * 0.1),
        [-1, 1],
        [8, 22]
      )
    : 0;

  const textShadow = glow
    ? `0 0 ${glowPulse}px ${glowColor}, 0 0 ${glowPulse * 2}px ${glowColor}40`
    : "none";

  return (
    <span
      style={{
        display: "block",
        fontSize,
        fontWeight,
        color,
        fontFamily: "Syne, sans-serif",
        transform: `scale(${entryScale})`,
        opacity: entryOpacity,
        textShadow,
        transformOrigin: "center",
        ...style,
      }}
    >
      {text}
    </span>
  );
};
