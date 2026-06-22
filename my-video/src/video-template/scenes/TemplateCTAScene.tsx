import React from "react";
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig,
  spring, interpolate,
} from "remotion";
import { T }                 from "../../clinical-edge-video/tokens";
import { FootageBackground } from "../components/FootageBackground";
import { CELogo }            from "../../clinical-edge-video/components/CELogo";
import { VideoScript }       from "../types";

const SP = { damping: 18, stiffness: 85, mass: 1.1 };

type Props = Pick<VideoScript, "ctaHandle" | "ctaTagline" | "topic"> & {
  footageFile?: string;
  footageStartFrom?: number;
};

export const TemplateCTAScene: React.FC<Props> = ({
  ctaHandle, ctaTagline, topic,
  footageFile, footageStartFrom = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const logoF  = Math.max(0, frame - 6);
  const logoSp = spring({ frame: logoF, fps, config: SP });
  const logoY  = interpolate(logoSp, [0, 1], [28, 0]);
  const logoO  = interpolate(logoF, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  const dividerO = interpolate(frame, [22, 34], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const handleF  = Math.max(0, frame - 28);
  const handleSp = spring({ frame: handleF, fps, config: SP });
  const handleY  = interpolate(handleSp, [0, 1], [24, 0]);
  const handleO  = interpolate(handleF, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  const descO = interpolate(Math.max(0, frame - 40), [0, 14], [0, 1], { extrapolateRight: "clamp" });

  const pillF  = Math.max(0, frame - 50);
  const pillSp = spring({ frame: pillF, fps, config: SP });
  const pillSc = interpolate(pillSp, [0, 1], [0.84, 1.0]);
  const pillO  = interpolate(pillF, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  // Pulsing glow on handle
  const glowPulse = interpolate(Math.sin(frame * 0.07), [-1, 1], [0.4, 1.0]);

  return (
    <AbsoluteFill style={{ opacity: fadeIn, overflow: "hidden" }}>

      {footageFile ? (
        <FootageBackground
          file={footageFile}
          startFrom={footageStartFrom}
          overlayOpacity={0.60}
          zoomEnd={1.05}
          panX={10}
          panY={-10}
          bottomGradient
          topGradient
        />
      ) : (
        <AbsoluteFill style={{ backgroundColor: "#050A14" }} />
      )}

      {/* Top accent bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 5,
        background: `linear-gradient(90deg, ${T.accent}, ${T.accent}44)`,
      }} />

      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 80px 200px",
        gap: 0,
      }}>

        {/* Logo + wordmark */}
        <div style={{
          transform: `translateY(${logoY}px)`,
          opacity: logoO,
          willChange: "transform, opacity",
          display: "flex",
          alignItems: "center",
          gap: 18,
          marginBottom: 20,
        }}>
          <CELogo size={52} />
          <span style={{
            fontSize: 44,
            fontWeight: 800,
            color: "#FFFFFF",
            fontFamily: T.sans,
            letterSpacing: "-0.035em",
            textShadow: "0 2px 20px rgba(0,0,0,0.6)",
          }}>
            Clinical Edge
          </span>
        </div>

        {/* Topic subtitle */}
        <div style={{ opacity: logoO, marginBottom: 24 }}>
          <span style={{
            fontSize: 26,
            fontWeight: 500,
            color: "rgba(255,255,255,0.65)",
            fontFamily: T.sans,
            letterSpacing: "-0.01em",
            textAlign: "center" as const,
            display: "block",
          }}>
            {topic}
          </span>
        </div>

        {/* Teal divider */}
        <div style={{
          width: 56,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${T.accent}, transparent)`,
          borderRadius: 2,
          marginBottom: 32,
          opacity: dividerO,
          boxShadow: `0 0 22px ${T.accent}`,
        }} />

        {/* Handle — the hero element */}
        <div style={{
          transform: `translateY(${handleY}px)`,
          opacity: handleO,
          willChange: "transform, opacity",
          textAlign: "center" as const,
          marginBottom: 18,
        }}>
          <span style={{
            fontSize: 76,
            fontWeight: 900,
            color: "#FFFFFF",
            fontFamily: T.sans,
            letterSpacing: "-0.035em",
            textShadow: `0 0 ${60 * glowPulse}px rgba(10,191,188,0.40), 0 4px 32px rgba(0,0,0,0.7)`,
            display: "block",
          }}>
            {ctaHandle}
          </span>
        </div>

        {/* Tagline */}
        <div style={{ opacity: descO, textAlign: "center" as const, marginBottom: 48 }}>
          <span style={{
            fontSize: 28,
            fontWeight: 400,
            color: "rgba(255,255,255,0.70)",
            fontFamily: T.sans,
            letterSpacing: "-0.01em",
          }}>
            {ctaTagline}
          </span>
        </div>

        {/* Follow pill */}
        <div style={{
          transform: `scale(${pillSc})`,
          opacity: pillO,
          willChange: "transform, opacity",
          background: T.accent,
          borderRadius: 100,
          padding: "18px 60px",
        }}>
          <span style={{
            fontSize: 32,
            fontWeight: 900,
            color: "#050A14",
            fontFamily: T.sans,
            letterSpacing: "-0.01em",
          }}>
            Follow for more →
          </span>
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
