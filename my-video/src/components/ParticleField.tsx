import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig, random, interpolate } from "remotion";

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  blur: number;
  seed: number;
}

interface ParticleFieldProps {
  count?: number;
  slowFactor?: number;
  dimFactor?: number;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({
  count = 60,
  slowFactor = 1,
  dimFactor = 1,
}) => {
  const frame = useCurrentFrame();
  const { height, width } = useVideoConfig();

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      const seed = 42 + i * 17;
      return {
        x: random(seed) * width,
        y: random(seed + 1) * height,
        size: random(seed + 2) * 3 + 1,
        speed: (random(seed + 3) * 0.4 + 0.1) * slowFactor,
        opacity: random(seed + 4) * 0.5 + 0.1,
        blur: random(seed + 5) * 2,
        seed,
      };
    });
  }, [count, width, height, slowFactor]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {particles.map((p, i) => {
        const drift = (frame * p.speed) % height;
        const yPos = (p.y + drift) % height;
        const xWaver = Math.sin(frame * 0.02 + p.seed) * 8;
        const finalOpacity =
          interpolate(
            Math.sin(frame * 0.03 + p.seed * 2),
            [-1, 1],
            [p.opacity * 0.5, p.opacity]
          ) * dimFactor;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x + xWaver,
              top: yPos,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: "#00C2CB",
              opacity: finalOpacity,
              filter: `blur(${p.blur}px)`,
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}
    </div>
  );
};
