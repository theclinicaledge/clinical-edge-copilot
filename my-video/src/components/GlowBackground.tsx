import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface GlowBackgroundProps {
  intensity?: number;
  blurAmount?: number;
  showVignette?: boolean;
  accentColor?: string;
}

// GlowBackground — 6-layer depth system
// Layer 1: Deep base gradient (tonal depth, navy-to-dark)
// Layer 2: Primary center bloom (slow breathing pulse)
// Layer 3: Secondary drift bloom (offset position, cooler tonal temperature)
// Layer 4: Asymmetric accent bloom (upper-right, very slow drift)
// Layer 5: Top-edge atmosphere (subtle cool light from above)
// Layer 6: Strong corner vignette

export const GlowBackground: React.FC<GlowBackgroundProps> = ({
  intensity = 1,
  blurAmount = 0,
  showVignette = true,
  accentColor = "#00C2CB",
}) => {
  const frame = useCurrentFrame();

  // Primary bloom — center, slow breathing
  const bloom1Opacity =
    interpolate(Math.sin(frame * 0.022), [-1, 1], [0.10, 0.26]) * intensity;

  // Secondary drift bloom — different phase, offset position
  const drift2X = interpolate(Math.sin(frame * 0.007), [-1, 1], [36, 62]);
  const drift2Y = interpolate(Math.cos(frame * 0.005), [-1, 1], [26, 72]);
  const bloom2Opacity =
    interpolate(Math.sin(frame * 0.016 + 1.2), [-1, 1], [0.05, 0.13]) * intensity;

  // Asymmetric accent bloom — upper-right quadrant, very slow, different phase
  const drift3X = interpolate(Math.sin(frame * 0.004 + 2.4), [-1, 1], [58, 74]);
  const drift3Y = interpolate(Math.cos(frame * 0.006 + 0.8), [-1, 1], [14, 38]);
  const bloom3Opacity =
    interpolate(Math.sin(frame * 0.013 + 2.8), [-1, 1], [0.04, 0.09]) * intensity;

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
      {/* Layer 1: Tonal depth — upper region is slightly lighter navy */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 115% 68% at 50% 24%, #0D2040 0%, #0A1628 50%, #060D1A 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Layer 2: Primary center bloom — slow breathing pulse */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "46%",
          width: 920,
          height: 920,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(0,194,203,${bloom1Opacity.toFixed(3)}) 0%, transparent 60%)`,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />

      {/* Layer 3: Secondary drift bloom — cooler temperature, slow wander */}
      <div
        style={{
          position: "absolute",
          left: `${drift2X}%`,
          top: `${drift2Y}%`,
          width: 740,
          height: 740,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(0,128,172,${bloom2Opacity.toFixed(3)}) 0%, transparent 57%)`,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />

      {/* Layer 4: Asymmetric accent bloom — upper-right, adds tonal asymmetry */}
      <div
        style={{
          position: "absolute",
          left: `${drift3X}%`,
          top: `${drift3Y}%`,
          width: 580,
          height: 580,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(0,160,195,${bloom3Opacity.toFixed(3)}) 0%, transparent 54%)`,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />

      {/* Layer 5: Top-edge atmosphere — cool light from above */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 520,
          background:
            "linear-gradient(180deg, rgba(0,96,138,0.072) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Layer 6: Strong corner vignette */}
      {showVignette && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 80% at 50% 50%, transparent 20%, rgba(5,11,22,0.58) 63%, rgba(3,7,14,0.94) 100%)",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};
