import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { T } from "../styles/tokens";

interface BackgroundProps {
  showGrid?: boolean;
}

export const Background: React.FC<BackgroundProps> = ({ showGrid = true }) => {
  const frame = useCurrentFrame();

  const bloom1 = interpolate(Math.sin(frame * 0.022), [-1, 1], [0.08, 0.20]);
  const bloom2 = interpolate(Math.sin(frame * 0.015 + 1.4), [-1, 1], [0.04, 0.11]);
  const drift2x = interpolate(Math.sin(frame * 0.006), [-1, 1], [30, 70]);
  const drift2y = interpolate(Math.cos(frame * 0.005), [-1, 1], [25, 65]);

  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: T.bgApp, overflow: "hidden" }}>
      {/* Base tonal depth */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 120% 70% at 50% 20%, #0D2040 0%, #0A1628 55%, #060D1A 100%)",
        pointerEvents: "none",
      }} />

      {/* Primary teal bloom — center */}
      <div style={{
        position: "absolute",
        left: "50%", top: "42%",
        width: 1000, height: 1000,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(0,194,209,${bloom1.toFixed(3)}) 0%, transparent 58%)`,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }} />

      {/* Secondary wandering bloom */}
      <div style={{
        position: "absolute",
        left: `${drift2x}%`, top: `${drift2y}%`,
        width: 700, height: 700,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(0,130,175,${bloom2.toFixed(3)}) 0%, transparent 55%)`,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }} />

      {/* Subtle grid */}
      {showGrid && (
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0,194,209,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,194,209,0.035) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
          pointerEvents: "none",
        }} />
      )}

      {/* Corner vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 75% 82% at 50% 50%, transparent 22%, rgba(5,11,22,0.55) 62%, rgba(3,7,14,0.92) 100%)",
        pointerEvents: "none",
      }} />

      {/* Bottom fade */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 320,
        background: `linear-gradient(0deg, ${T.bgApp} 0%, transparent 100%)`,
        pointerEvents: "none",
      }} />
    </div>
  );
};
