import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { ParticleField } from "../components/ParticleField";
import { GlowBackground } from "../components/GlowBackground";

// Scene 5: 560–660 frames (local frame 0–100)

// CE Logo
const CELogo: React.FC<{ scale: number; opacity: number }> = ({
  scale,
  opacity,
}) => {
  return (
    <div
      style={{
        transform: `scale(${scale})`,
        opacity,
        transformOrigin: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 16,
          borderRadius: 20,
          border: "2px solid rgba(0,194,203,0.7)",
          padding: "18px 36px",
          background: "rgba(0,194,203,0.08)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: "#00C2CB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            fontWeight: 800,
            color: "#0A1628",
            fontFamily: "Syne, system-ui, sans-serif",
          }}
        >
          CE
        </div>
        <div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: "#FFFFFF",
              fontFamily: "Syne, system-ui, sans-serif",
              lineHeight: 1,
              letterSpacing: "-0.01em",
            }}
          >
            Clinical Edge
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 500,
              color: "rgba(0,194,203,0.85)",
              fontFamily: "DM Mono, monospace",
              letterSpacing: "0.08em",
              marginTop: 4,
            }}
          >
            COPILOT
          </div>
        </div>
      </div>
    </div>
  );
};

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Line 1: "This is how you think on shift." — enters at local 0
  const line1Spring = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 150, mass: 1 },
  });

  const line1Blur = interpolate(line1Spring, [0, 1], [8, 0]);
  const line1Y = interpolate(line1Spring, [0, 1], [20, 0]);
  const line1Opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Line 2: "Comment 'copilot'" — enters at local 28
  const line2Frame = Math.max(0, frame - 28);
  const line2Spring = spring({
    frame: line2Frame,
    fps,
    config: { damping: 14, stiffness: 160, mass: 0.9 },
  });
  const line2Y = interpolate(line2Spring, [0, 1], [20, 0]);
  const line2Opacity = interpolate(line2Frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  // "copilot" breathing glow
  const copilotGlow = interpolate(
    Math.sin(frame * 0.12),
    [-1, 1],
    [14, 40]
  );

  // Logo: enters at local 50
  const logoFrame = Math.max(0, frame - 50);
  const logoSpring = spring({
    frame: logoFrame,
    fps,
    config: { damping: 14, stiffness: 180, mass: 0.85 },
  });
  const logoScale = interpolate(logoSpring, [0, 1], [0.9, 1]);
  const logoOpacity = interpolate(logoFrame, [0, 14], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Particle slow-down + dim as outro settles
  const particleDim = interpolate(frame, [0, 60, 100], [0.5, 0.3, 0.15], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0A1628" }}>
      <GlowBackground intensity={0.8} showVignette={true} />
      <ParticleField count={30} slowFactor={0.2} dimFactor={particleDim} />

      {/* Strong vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(4,8,18,0.75) 100%)",
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 48,
          paddingLeft: 60,
          paddingRight: 60,
        }}
      >
        {/* Line 1 */}
        <div
          style={{
            transform: `translateY(${line1Y}px)`,
            opacity: line1Opacity,
            filter: `blur(${line1Blur}px)`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#FFFFFF",
              fontFamily: "Syne, system-ui, sans-serif",
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              textShadow: "0 0 40px rgba(255,255,255,0.15)",
            }}
          >
            This is how you think on shift.
          </div>
        </div>

        {/* Divider */}
        {frame >= 24 && (
          <div
            style={{
              width: interpolate(frame, [24, 40], [0, 260], {
                extrapolateRight: "clamp",
              }),
              height: 2,
              background:
                "linear-gradient(90deg, transparent, #00C2CB, transparent)",
              opacity: 0.6,
            }}
          />
        )}

        {/* Line 2 */}
        {frame >= 28 && (
          <div
            style={{
              transform: `translateY(${line2Y}px)`,
              opacity: line2Opacity,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 58,
                fontWeight: 600,
                color: "rgba(255,255,255,0.75)",
                fontFamily: "DM Sans, system-ui, sans-serif",
                letterSpacing: "0",
                lineHeight: 1.2,
              }}
            >
              Comment{" "}
              <span
                style={{
                  color: "#00C2CB",
                  fontWeight: 800,
                  textShadow: `0 0 ${copilotGlow}px #00C2CB, 0 0 ${copilotGlow * 2}px rgba(0,194,203,0.3)`,
                  fontFamily: "DM Mono, monospace",
                }}
              >
                'copilot'
              </span>
            </div>
          </div>
        )}

        {/* Logo */}
        {frame >= 50 && (
          <CELogo scale={logoScale} opacity={logoOpacity} />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
