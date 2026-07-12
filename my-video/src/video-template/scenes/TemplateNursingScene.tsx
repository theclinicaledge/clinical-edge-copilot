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

// Each action string may contain a \n — first line is the bold heading,
// second line (if present) is a smaller detail sub-line.
const PriorityBlock: React.FC<{
  frame: number; fps: number; startFrame: number;
  index: number; text: string; accentColor: string;
}> = ({ frame, fps, startFrame, index, text, accentColor }) => {
  const f  = Math.max(0, frame - startFrame);
  const sp = spring({ frame: f, fps, config: SP });
  const x  = interpolate(sp, [0, 1], [-56, 0]);
  const o  = interpolate(f, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  const [headline, subline] = text.split("\n");
  const isFirst = index === 0;
  const borderColor = isFirst ? accentColor : T.accent;

  return (
    <div style={{
      transform: `translateX(${x}px)`,
      opacity: o,
      willChange: "transform, opacity",
      borderLeft: `5px solid ${borderColor}`,
      paddingLeft: 24,
      paddingTop: 4,
      paddingBottom: subline ? 10 : 4,
    }}>
      <div style={{
        fontSize: 58,
        fontWeight: 900,
        color: isFirst ? "#FFFFFF" : "rgba(255,255,255,0.94)",
        fontFamily: T.sans,
        letterSpacing: "-0.025em",
        lineHeight: 1.05,
        textShadow: "0 2px 18px rgba(0,0,0,0.65)",
        textTransform: "uppercase" as const,
      }}>
        {headline}
      </div>
      {subline && (
        <div style={{
          fontSize: 33,
          fontWeight: 500,
          color: accentColor,
          fontFamily: T.sans,
          letterSpacing: "-0.01em",
          lineHeight: 1.3,
          marginTop: 4,
          textShadow: "0 1px 10px rgba(0,0,0,0.5)",
        }}>
          {subline}
        </div>
      )}
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

  // 16 frames apart per action, start at frame 20
  const visibleActions = nursingActions.slice(0, 5);
  const actionStarts = visibleActions.map((_, i) => 20 + i * 16);

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut, overflow: "hidden" }}>

      {footageFile ? (
        <FootageBackground
          file={footageFile}
          startFrom={footageStartFrom}
          overlayOpacity={0.44}
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
        padding: "290px 68px 240px",
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

        {/* Priority blocks */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {visibleActions.map((action, i) => (
            <PriorityBlock
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

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
