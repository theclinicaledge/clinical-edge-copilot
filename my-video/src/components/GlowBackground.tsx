import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface GlowBackgroundProps {
  intensity?: number;
  blurAmount?: number;
  showVignette?: boolean;
  accentColor?: string;
}

export const GlowBackground: React.FC<GlowBackgroundProps> = ({
  intensity = 1,
  blurAmount = 0,
  showVignette = true,
  accentColor = "#00C2CB",
}) => {
  const frame = useCurrentFrame();

  const lightX = interpolate(
    Math.sin(frame * 0.012),
    [-1, 1],
    [20, 80]
  );
  const lightY = interpolate(
    Math.cos(frame * 0.009),
    [-1, 1],
    [10, 60]
  );

  const glowOpacity = interpolate(
    Math.sin(frame * 0.04),
    [-1, 1],
    [0.06, 0.14]
  ) * intensity;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#0A1628",
        overflow: "hidden",
        filter: blurAmount > 0 ? `blur(${blurAmount}px)` : undefined,
      }}
    >
      {/* Animated ambient light */}
      <div
        style={{
          position: "absolute",
          left: `${lightX}%`,
          top: `${lightY}%`,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accentColor}${Math.round(glowOpacity * 255).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />

      {/* Static deep background gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 20%, #0D2040 0%, #0A1628 60%, #060E1A 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Vignette */}
      {showVignette && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(6,14,26,0.7) 100%)",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};
