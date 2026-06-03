import React from "react";
import { useCurrentFrame } from "remotion";

// Film-grain overlay — CSS SVG turbulence filter, shifts each frame
// No external package needed.
interface Props {
  opacity?: number;
}

export const GrainOverlay: React.FC<Props> = ({ opacity = 0.035 }) => {
  const frame = useCurrentFrame();
  // Shift the noise seed each frame so it animates
  const seed = (frame * 7) % 999;

  return (
    <>
      <svg style={{ display: "none" }}>
        <filter id={`grain-${frame}`} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.72"
            numOctaves="4"
            seed={seed}
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix type="saturate" values="0" in="noise" result="gray" />
          <feBlend in="SourceGraphic" in2="gray" mode="screen" />
        </filter>
      </svg>
      <div style={{
        position: "absolute",
        inset: 0,
        filter: `url(#grain-${frame})`,
        opacity,
        pointerEvents: "none",
        mixBlendMode: "screen",
      }} />
    </>
  );
};
