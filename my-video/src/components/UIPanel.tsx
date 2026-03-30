import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface UIPanelProps {
  children: React.ReactNode;
  active?: boolean;
  delay?: number;
  style?: React.CSSProperties;
  glowColor?: string;
  breathe?: boolean;
}

export const UIPanel: React.FC<UIPanelProps> = ({
  children,
  active = false,
  delay = 0,
  style = {},
  glowColor = "#00C2CB",
  breathe = false,
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - delay);

  const entryOpacity = interpolate(localFrame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  const breatheScale = breathe
    ? interpolate(Math.sin(frame * 0.05), [-1, 1], [0.98, 1.01])
    : 1;

  const activeScale = active ? 1.03 : 1;
  const finalScale = breatheScale * activeScale;

  const glowStrength = active
    ? interpolate(Math.sin(frame * 0.1), [-1, 1], [12, 28])
    : 6;

  const borderOpacity = active ? 0.9 : 0.35;
  const bgOpacity = active ? 0.14 : 0.06;

  return (
    <div
      style={{
        borderRadius: 20,
        border: `1.5px solid ${glowColor}${Math.round(borderOpacity * 255).toString(16).padStart(2, "0")}`,
        background: `rgba(0, 194, 203, ${bgOpacity})`,
        boxShadow: active
          ? `0 0 ${glowStrength}px ${glowColor}60, inset 0 0 30px rgba(0,194,203,0.05)`
          : `0 0 ${glowStrength}px ${glowColor}20`,
        padding: "28px 32px",
        opacity: entryOpacity,
        transform: `scale(${finalScale})`,
        transformOrigin: "center",
        backdropFilter: "blur(4px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
