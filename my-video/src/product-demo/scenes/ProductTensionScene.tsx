import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { T } from "../../clinical-edge-video/tokens";
import { FootageBackground } from "../../video-template/components/FootageBackground";
import { ProductDemoScript } from "../types";

const SP = { damping: 18, stiffness: 85, mass: 1.05 };

const COLORS: Record<string, string> = {
  red:   "#e05572",
  amber: "#F2B94B",
  green: "#1FBF75",
  teal:  "#0ABFBC",
};

type Props = Pick<ProductDemoScript, "tensionTitle" | "tensionSubtext" | "tensionCards"> & {
  footageFile?: string;
  footageStartFrom?: number;
};

const TensionCard: React.FC<{
  frame: number; fps: number; startFrame: number;
  label: string; color: string;
}> = ({ frame, fps, startFrame, label, color }) => {
  const accent = COLORS[color] ?? T.accent;
  const f  = Math.max(0, frame - startFrame);
  const sp = spring({ frame: f, fps, config: SP });
  const x  = interpolate(sp, [0, 1], [-64, 0]);
  const o  = interpolate(f, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{
      transform: `translateX(${x}px)`,
      opacity: o,
      willChange: "transform, opacity",
      borderLeft: `5px solid ${accent}`,
      paddingLeft: 32,
      paddingTop: 6,
      paddingBottom: 6,
    }}>
      <span style={{
        fontSize: 56,
        fontWeight: 800,
        color: "#FFFFFF",
        fontFamily: T.sans,
        letterSpacing: "-0.025em",
        lineHeight: 1.1,
        textShadow: "0 2px 18px rgba(0,0,0,0.65)",
      }}>
        {label}
      </span>
    </div>
  );
};

export const ProductTensionScene: React.FC<Props> = ({
  tensionTitle, tensionSubtext, tensionCards, footageFile, footageStartFrom = 45,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const titleF  = Math.max(0, frame - 4);
  const titleSp = spring({ frame: titleF, fps, config: SP });
  const titleY  = interpolate(titleSp, [0, 1], [36, 0]);
  const titleO  = interpolate(titleF, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  const CARD_STARTS = [28, 52, 76];
  const lastCardEnd = (CARD_STARTS[tensionCards.length - 1] ?? 76) + 20;
  const subtextO = interpolate(
    Math.max(0, frame - lastCardEnd), [0, 18], [0, 1], { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut, overflow: "hidden" }}>

      {footageFile ? (
        <FootageBackground
          file={footageFile}
          startFrom={footageStartFrom}
          overlayOpacity={0.46}
          zoomEnd={1.06}
          panX={16}
          panY={-14}
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
        justifyContent: "center",
        padding: "160px 68px 260px",
      }}>

        {/* Title */}
        <div style={{
          transform: `translateY(${titleY}px)`,
          opacity: titleO,
          willChange: "transform, opacity",
          marginBottom: 52,
        }}>
          <div style={{
            fontSize: 22,
            fontWeight: 700,
            color: T.accent,
            fontFamily: T.sans,
            letterSpacing: "0.14em",
            textTransform: "uppercase" as const,
            marginBottom: 16,
          }}>
            The clinical reality
          </div>
          <div style={{
            fontSize: 74,
            fontWeight: 900,
            color: "#FFFFFF",
            fontFamily: T.sans,
            letterSpacing: "-0.038em",
            lineHeight: 1.02,
            textShadow: "0 4px 28px rgba(0,0,0,0.7)",
          }}>
            {tensionTitle}
          </div>
        </div>

        {/* Tension cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {tensionCards.map((card, i) => (
            <TensionCard
              key={i}
              frame={frame}
              fps={fps}
              startFrame={CARD_STARTS[i] ?? i * 24 + 28}
              label={card.label}
              color={card.color}
            />
          ))}
        </div>

        {/* Optional subtext — fades in after last card */}
        {tensionSubtext && (
          <div style={{
            opacity: subtextO,
            marginTop: 48,
            fontSize: 38,
            fontWeight: 500,
            fontStyle: "italic",
            color: "rgba(255,255,255,0.55)",
            fontFamily: T.sans,
            letterSpacing: "-0.015em",
            lineHeight: 1.3,
            textShadow: "0 2px 12px rgba(0,0,0,0.6)",
          }}>
            {tensionSubtext}
          </div>
        )}

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
