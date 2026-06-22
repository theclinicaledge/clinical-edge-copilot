import React from "react";
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig,
  spring, interpolate,
} from "remotion";
import { T }                 from "../../clinical-edge-video/tokens";
import { FootageBackground } from "../components/FootageBackground";
import { VideoScript }       from "../types";

const SP = { damping: 18, stiffness: 88, mass: 1.05 };

type Props = Pick<VideoScript, "nursingTitle" | "nursingActions" | "closingLine" | "urgency"> & {
  footageFile?: string;
  footageStartFrom?: number;
};

const URGENCY_COLOR: Record<string, string> = {
  HIGH: "#e05572", MODERATE: "#F2B94B", LOW: "#1FBF75",
};

const ActionRow: React.FC<{
  frame: number; fps: number; startFrame: number;
  index: number; text: string; accentColor: string;
}> = ({ frame, fps, startFrame, index, text, accentColor }) => {
  const f  = Math.max(0, frame - startFrame);
  const sp = spring({ frame: f, fps, config: SP });
  const x  = interpolate(sp, [0, 1], [-60, 0]);
  const o  = interpolate(f, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const isFirst = index === 0;

  return (
    <div style={{
      transform: `translateX(${x}px)`,
      opacity: o,
      willChange: "transform, opacity",
      display: "flex",
      alignItems: "center",
      gap: 20,
      padding: "14px 0",
      borderBottom: "1px solid rgba(255,255,255,0.10)",
    }}>
      <div style={{
        width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
        background: isFirst ? accentColor : T.accent,
        boxShadow: `0 0 12px ${isFirst ? accentColor : T.accent}`,
      }} />
      <span style={{
        fontSize: isFirst ? 38 : 34,
        fontWeight: isFirst ? 800 : 500,
        color: isFirst ? "#FFFFFF" : "rgba(255,255,255,0.88)",
        fontFamily: T.sans,
        letterSpacing: "-0.02em",
        lineHeight: 1.2,
        textShadow: "0 2px 12px rgba(0,0,0,0.6)",
      }}>
        {text}
      </span>
    </div>
  );
};

export const TemplateNursingScene: React.FC<Props> = ({
  nursingTitle, nursingActions, closingLine, urgency,
  footageFile, footageStartFrom = 60,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const accentColor = URGENCY_COLOR[urgency] ?? T.accent;

  const fadeIn  = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const titleF  = Math.max(0, frame - 4);
  const titleSp = spring({ frame: titleF, fps, config: SP });
  const titleY  = interpolate(titleSp, [0, 1], [30, 0]);
  const titleO  = interpolate(titleF, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  // 14 frames apart per action, start at frame 22
  const actionStarts = nursingActions.map((_, i) => 22 + i * 14);

  const closingStart = actionStarts[nursingActions.length - 1] + 22;
  const closingO = interpolate(Math.max(0, frame - closingStart), [0, 16], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Show max 5 actions to avoid overflow on phone
  const visibleActions = nursingActions.slice(0, 5);

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut, overflow: "hidden" }}>

      {footageFile ? (
        <FootageBackground
          file={footageFile}
          startFrom={footageStartFrom}
          overlayOpacity={0.55}
          zoomEnd={1.06}
          panX={-14}
          panY={-20}
          bottomGradient
          topGradient
        />
      ) : (
        <AbsoluteFill style={{ backgroundColor: "#050A14" }} />
      )}

      {/* Top accent — urgency colored */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 5,
        background: `linear-gradient(90deg, ${accentColor}, ${accentColor}44)`,
      }} />

      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        padding: "140px 68px 240px",
      }}>

        {/* Title */}
        <div style={{
          transform: `translateY(${titleY}px)`,
          opacity: titleO,
          willChange: "transform, opacity",
          marginBottom: 30,
        }}>
          <div style={{
            fontSize: 22,
            fontWeight: 700,
            color: accentColor,
            fontFamily: T.sans,
            letterSpacing: "0.14em",
            textTransform: "uppercase" as const,
            marginBottom: 10,
          }}>
            Nursing priorities
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
            {nursingTitle}
          </div>
        </div>

        {/* Actions */}
        <div style={{ flex: 1 }}>
          {visibleActions.map((action, i) => (
            <ActionRow
              key={i}
              frame={frame}
              fps={fps}
              startFrame={actionStarts[i]}
              index={i}
              text={action}
              accentColor={accentColor}
            />
          ))}
        </div>

        {/* Closing pull-quote */}
        <div style={{
          opacity: closingO,
          padding: "18px 24px",
          borderLeft: `4px solid ${T.accent}`,
          background: "rgba(10,191,188,0.08)",
          backdropFilter: "blur(8px)",
          borderRadius: "0 14px 14px 0",
          marginTop: 18,
        }}>
          {closingLine.split("\n").map((line, i) => (
            <div key={i} style={{
              fontSize: i === 0 ? 28 : 24,
              fontWeight: i === 0 ? 600 : 400,
              color: i === 0 ? "#FFFFFF" : "rgba(255,255,255,0.70)",
              fontFamily: T.sans,
              fontStyle: "italic",
              lineHeight: 1.4,
              letterSpacing: "-0.01em",
              marginTop: i > 0 ? 6 : 0,
            }}>
              {line}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
