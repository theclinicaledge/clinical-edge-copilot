import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { T } from "../../clinical-edge-video/tokens";
import { FootageBackground } from "../../video-template/components/FootageBackground";
import { CELogo } from "../../clinical-edge-video/components/CELogo";
import { ProductDemoScript } from "../types";

const SP = { damping: 18, stiffness: 85, mass: 1.1 };

type Props = Pick<ProductDemoScript, "ctaLine" | "ctaHandle" | "ctaTagline"> & {
  footageFile?: string;
  footageStartFrom?: number;
};

export const ProductCTAScene: React.FC<Props> = ({
  ctaLine, ctaHandle, ctaTagline, footageFile, footageStartFrom = 120,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const logoF  = Math.max(0, frame - 6);
  const logoSp = spring({ frame: logoF, fps, config: SP });
  const logoY  = interpolate(logoSp, [0, 1], [28, 0]);
  const logoO  = interpolate(logoF, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  const dividerO = interpolate(frame, [22, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const lineF  = Math.max(0, frame - 26);
  const lineSp = spring({ frame: lineF, fps, config: SP });
  const lineY  = interpolate(lineSp, [0, 1], [20, 0]);
  const lineO  = interpolate(lineF, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  const pillF  = Math.max(0, frame - 30);
  const pillSp = spring({ frame: pillF, fps, config: SP });
  const pillSc = interpolate(pillSp, [0, 1], [0.85, 1.0]);
  const pillO  = interpolate(pillF, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  const handleF  = Math.max(0, frame - 46);
  const handleSp = spring({ frame: handleF, fps, config: SP });
  const handleY  = interpolate(handleSp, [0, 1], [20, 0]);
  const handleO  = interpolate(handleF, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  const glowPulse = interpolate(Math.sin(frame * 0.07), [-1, 1], [0.4, 1.0]);

  return (
    <AbsoluteFill style={{ opacity: fadeIn, overflow: "hidden" }}>

      {footageFile ? (
        <FootageBackground
          file={footageFile}
          startFrom={footageStartFrom}
          overlayOpacity={0.62}
          zoomEnd={1.04}
          panX={8}
          panY={-8}
          bottomGradient
          topGradient
        />
      ) : (
        <AbsoluteFill style={{ backgroundColor: "#050A14" }} />
      )}

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
      }}>

        {/* Logo + wordmark */}
        <div style={{
          transform: `translateY(${logoY}px)`,
          opacity: logoO,
          willChange: "transform, opacity",
          display: "flex",
          alignItems: "center",
          gap: 18,
          marginBottom: 24,
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

        {/* Teal divider */}
        <div style={{
          width: 56, height: 3,
          background: `linear-gradient(90deg, transparent, ${T.accent}, transparent)`,
          borderRadius: 2,
          marginBottom: 32,
          opacity: dividerO,
          boxShadow: `0 0 22px ${T.accent}`,
        }} />

        {/* Supporting line — "helps nurses think through the moment" */}
        <div style={{
          transform: `translateY(${lineY}px)`,
          opacity: lineO,
          willChange: "transform, opacity",
          textAlign: "center" as const,
          marginBottom: 32,
          padding: "0 20px",
        }}>
          <span style={{
            fontSize: 34,
            fontWeight: 400,
            color: "rgba(255,255,255,0.72)",
            fontFamily: T.sans,
            letterSpacing: "-0.015em",
            lineHeight: 1.4,
          }}>
            {ctaLine}
          </span>
        </div>

        {/* Download pill — hero CTA, appears first */}
        <div style={{
          transform: `scale(${pillSc})`,
          opacity: pillO,
          willChange: "transform, opacity",
          background: T.accent,
          borderRadius: 100,
          padding: "26px 72px",
          marginBottom: 40,
          boxShadow: `0 8px 48px rgba(10,191,188,0.45), 0 2px 12px rgba(0,0,0,0.4)`,
        }}>
          <span style={{
            fontSize: 38,
            fontWeight: 900,
            color: "#050A14",
            fontFamily: T.sans,
            letterSpacing: "-0.01em",
          }}>
            {ctaTagline}
          </span>
        </div>

        {/* Handle */}
        <div style={{
          transform: `translateY(${handleY}px)`,
          opacity: handleO,
          willChange: "transform, opacity",
          textAlign: "center" as const,
        }}>
          <span style={{
            fontSize: 52,
            fontWeight: 700,
            color: "rgba(255,255,255,0.70)",
            fontFamily: T.sans,
            letterSpacing: "-0.025em",
            textShadow: `0 0 ${40 * glowPulse}px rgba(10,191,188,0.30), 0 2px 16px rgba(0,0,0,0.6)`,
          }}>
            {ctaHandle}
          </span>
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
