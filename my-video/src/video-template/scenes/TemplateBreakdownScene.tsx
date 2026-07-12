import React from "react";
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig,
  spring, interpolate,
} from "remotion";
import { T }                 from "../../clinical-edge-video/tokens";
import { FootageBackground } from "../components/FootageBackground";
import { VideoScript, CARD_COLORS } from "../types";

const SP = { damping: 18, stiffness: 88, mass: 1.05 };

type Props = Pick<VideoScript, "breakdownTitle" | "breakdownSubtitle" | "breakdownCards"> & {
  footageFile?: string;
  footageStartFrom?: number;
};

const Card: React.FC<{
  frame: number; fps: number; startFrame: number; index: number;
  label: string; detail: string; colorKey: string;
}> = ({ frame, fps, startFrame, index, label, detail, colorKey }) => {
  const colors = CARD_COLORS[colorKey as keyof typeof CARD_COLORS] ?? CARD_COLORS.teal;
  const f  = Math.max(0, frame - startFrame);
  const sp = spring({ frame: f, fps, config: SP });
  const y  = interpolate(sp, [0, 1], [50, 0]);
  const o  = interpolate(f, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{
      transform: `translateY(${y}px)`,
      opacity: o,
      willChange: "transform, opacity",
      background: "rgba(5,10,20,0.72)",
      border: `1.5px solid ${colors.border}`,
      borderLeft: `5px solid ${colors.text}`,
      borderRadius: 18,
      padding: "24px 28px",
      backdropFilter: "blur(12px)",
      display: "flex",
      alignItems: "flex-start",
      gap: 20,
    }}>
      {/* Number bubble */}
      <div style={{
        width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
        background: `${colors.text}20`,
        border: `2px solid ${colors.text}60`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{
          fontSize: 22, fontWeight: 900, color: colors.text, fontFamily: T.sans,
        }}>
          {index + 1}
        </span>
      </div>

      <div>
        <div style={{
          fontSize: 44,
          fontWeight: 800,
          color: "#FFFFFF",
          fontFamily: T.sans,
          letterSpacing: "-0.028em",
          lineHeight: 1.1,
          marginBottom: 6,
          textShadow: "0 2px 16px rgba(0,0,0,0.7)",
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 30,
          fontWeight: 400,
          color: colors.text,
          fontFamily: T.sans,
          lineHeight: 1.35,
          letterSpacing: "-0.01em",
        }}>
          {detail}
        </div>
      </div>
    </div>
  );
};

export const TemplateBreakdownScene: React.FC<Props> = ({
  breakdownTitle, breakdownSubtitle, breakdownCards,
  footageFile, footageStartFrom = 30,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const titleF  = Math.max(0, frame - 4);
  const titleSp = spring({ frame: titleF, fps, config: SP });
  const titleY  = interpolate(titleSp, [0, 1], [30, 0]);
  const titleO  = interpolate(titleF, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  // Cards stagger every 26 frames
  const CARD_STARTS = [22, 48, 74];

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut, overflow: "hidden" }}>

      {footageFile ? (
        <FootageBackground
          file={footageFile}
          startFrom={footageStartFrom}
          overlayOpacity={0.42}
          zoomEnd={1.06}
          panX={18}
          panY={-12}
          bottomGradient
          topGradient
        />
      ) : (
        <AbsoluteFill style={{ backgroundColor: "#050A14" }} />
      )}

      {/* Top accent */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 5,
        background: `linear-gradient(90deg, ${T.accent}, ${T.accent}44)`,
      }} />

      {/* ── Content ── */}
      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "140px 68px 260px",
        gap: 0,
      }}>

        {/* Section header */}
        <div style={{
          transform: `translateY(${titleY}px)`,
          opacity: titleO,
          willChange: "transform, opacity",
          marginBottom: 36,
        }}>
          <div style={{
            fontSize: 22,
            fontWeight: 700,
            color: T.accent,
            fontFamily: T.sans,
            letterSpacing: "0.14em",
            textTransform: "uppercase" as const,
            marginBottom: 10,
          }}>
            {breakdownSubtitle}
          </div>
          <div style={{
            fontSize: 86,
            fontWeight: 900,
            color: "#FFFFFF",
            fontFamily: T.sans,
            letterSpacing: "-0.040em",
            lineHeight: 0.96,
            textShadow: "0 4px 28px rgba(0,0,0,0.7)",
          }}>
            {breakdownTitle}
          </div>
        </div>

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {breakdownCards.map((card, i) => (
            <Card
              key={i}
              frame={frame}
              fps={fps}
              startFrame={CARD_STARTS[i] ?? i * 26 + 22}
              index={i}
              label={card.label}
              detail={card.detail}
              colorKey={card.color}
            />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
