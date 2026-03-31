import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface GlowBackgroundProps {
  intensity?: number;
  blurAmount?: number;
  showVignette?: boolean;
  accentColor?: string;
}

// Enhanced GlowBackground — 3-layer depth system
// Layer 1: Deep base gradient (tonal depth)
// Layer 2: Primary center bloom (breathing, slow pulse)
// Layer 3: Secondary drift bloom (offset, slower frequency)
// Layer 4: Top-edge light accent
// Layer 5: Strong corner vignette

export const GlowBackground: React.FC<GlowBackgroundProps> = ({
  intensity = 1,
  blurAmount = 0,
  showVignette = true,
  accentColor = "#00C2CB",
}) => {
  const frame = useCurrentFrame();

  // Primary bloom — slow breathing at center
  const bloom1Opacity =
    interpolate(Math.sin(frame * 0.022), [-1, 1], [0.07, 0.17]) * intensity;

  // Secondary drift bloom — different phase, slower, slightly offset
  const drift2X = interpolate(Math.sin(frame * 0.007), [-1, 1], [38, 62]);
  const drift2Y = interpolate(Math.cos(frame * 0.005), [-1, 1], [28, 72]);
  const bloom2Opacity =
    interpolate(Math.sin(frame * 0.016 + 1.2), [-1, 1], [0.03, 0.08]) *
    intensity;

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
      {/* Layer 1: Tonal depth gradient — navy darkens toward bottom */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 110% 70% at 50% 28%, #0E2244 0%, #0A1628 52%, #060D1A 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Layer 2: Primary center bloom — slow breathing pulse */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "48%",
          width: 860,
          height: 860,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(0,194,203,${bloom1Opacity.toFixed(3)}) 0%, transparent 62%)`,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />

      {/* Layer 3: Secondary drift bloom — different tonal temperature */}
      <div
        style={{
          position: "absolute",
          left: `${drift2X}%`,
          top: `${drift2Y}%`,
          width: 720,
          height: 720,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(0,130,175,${bloom2Opacity.toFixed(3)}) 0%, transparent 58%)`,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />

      {/* Layer 4: Top-edge teal accent — very subtle, adds atmosphere */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 480,
          background:
            "linear-gradient(180deg, rgba(0,90,130,0.055) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Layer 5: Strong corner vignette */}
      {showVignette && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 72% 82% at 50% 50%, transparent 22%, rgba(5,11,22,0.6) 65%, rgba(3,7,14,0.94) 100%)",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};
