import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { T } from "../styles/tokens";

interface ECGLineProps {
  width?: number;
  opacity?: number;
  color?: string;
  y?: number;
}

// Single ECG PQRST complex as an SVG path, tiled and scrolled horizontally
export const ECGLine: React.FC<ECGLineProps> = ({
  width = 1080,
  opacity = 1,
  color = T.teal,
  y = 0,
}) => {
  const frame = useCurrentFrame();

  // Scroll speed: ~140px/s at 30fps → 4.67px/frame
  const scrollOffset = (frame * 4.8) % 300;

  // One PQRST complex in a 300px-wide, 60px-tall viewBox
  // Drawn as a clean clinical trace
  const ecgPath =
    "M0,30 L40,30 L52,28 L58,32 L64,10 L70,50 L76,25 L88,30 L100,30 " +
    "L108,26 L112,30 L160,30 L300,30";

  // Tiles: render enough copies to cover the full width + scroll
  const tileWidth = 300;
  const tilesNeeded = Math.ceil((width + tileWidth) / tileWidth) + 1;

  return (
    <svg
      style={{
        position: "absolute",
        left: 0,
        top: y,
        width,
        height: 60,
        opacity,
        overflow: "hidden",
        pointerEvents: "none",
      }}
      viewBox={`0 0 ${width} 60`}
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="ecgGlow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g transform={`translate(${-scrollOffset}, 0)`} filter="url(#ecgGlow)">
        {Array.from({ length: tilesNeeded }).map((_, i) => (
          <path
            key={i}
            d={ecgPath}
            transform={`translate(${i * tileWidth}, 0)`}
            fill="none"
            stroke={color}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.65"
          />
        ))}
      </g>
    </svg>
  );
};
