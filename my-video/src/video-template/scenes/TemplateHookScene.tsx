import React from "react";
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig,
  spring, interpolate,
} from "remotion";
import { T }                  from "../../clinical-edge-video/tokens";
import { FootageBackground }  from "../components/FootageBackground";
import { VideoScript }        from "../types";

const SP = { damping: 22, stiffness: 90, mass: 1.1 };

type Props = Pick<VideoScript, "hookLine" | "hookSub" | "badgeText" | "urgency"> & {
  footageFile?: string;
};

const URGENCY_COLOR: Record<string, string> = {
  HIGH: "#e05572", MODERATE: "#F2B94B", LOW: "#1FBF75",
};

export const TemplateHookScene: React.FC<Props> = ({
  hookLine, hookSub, badgeText, urgency, footageFile,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const accentColor = URGENCY_COLOR[urgency] ?? T.accent;

  const fadeIn  = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Label slides in from top
  const labelF  = Math.max(0, frame - 6);
  const labelSp = spring({ frame: labelF, fps, config: SP });
  const labelY  = interpolate(labelSp, [0, 1], [-20, 0]);
  const labelO  = interpolate(labelF, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  // Hook lines spring up from below
  const lines = hookLine.split("\n");
  const h1F   = Math.max(0, frame - 16);
  const h1Sp  = spring({ frame: h1F, fps, config: SP });
  const h1Y   = interpolate(h1Sp, [0, 1], [80, 0]);
  const h1O   = interpolate(h1F, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  const h2F   = Math.max(0, frame - 26);
  const h2Sp  = spring({ frame: h2F, fps, config: SP });
  const h2Y   = interpolate(h2Sp, [0, 1], [80, 0]);
  const h2O   = interpolate(h2F, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  // Badge pulses
  const badgeF     = Math.max(0, frame - 42);
  const badgeO     = interpolate(badgeF, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const badgePulse = interpolate(Math.sin(frame * 0.10), [-1, 1], [0.68, 1.0]);

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut, overflow: "hidden" }}>

      {/* ── Footage or fallback dark bg ── */}
      {footageFile ? (
        <FootageBackground
          file={footageFile}
          startFrom={0}
          overlayOpacity={0.38}
          zoomEnd={1.10}
          panY={-30}
          bottomGradient
          topGradient
        />
      ) : (
        <AbsoluteFill style={{ backgroundColor: "#050A14" }} />
      )}

      {/* ── Top accent bar ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 5,
        background: `linear-gradient(90deg, ${accentColor}, ${accentColor}55)`,
      }} />

      {/* ── Content — safe zone: 140px top, 320px bottom ── */}
      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "140px 72px 320px",
      }}>

        {/* Category label */}
        <div style={{
          transform: `translateY(${labelY}px)`,
          opacity: labelO,
          willChange: "transform, opacity",
          display: "flex", alignItems: "center", gap: 14,
          marginBottom: 28,
        }}>
          <div style={{ width: 36, height: 3, borderRadius: 2, background: accentColor }} />
          <span style={{
            fontSize: 26,
            fontWeight: 700,
            color: accentColor,
            fontFamily: T.sans,
            letterSpacing: "0.14em",
            textTransform: "uppercase" as const,
          }}>
            {hookSub}
          </span>
        </div>

        {/* Hook line 1 */}
        <div style={{
          transform: `translateY(${h1Y}px)`,
          opacity: h1O,
          willChange: "transform, opacity",
        }}>
          <span style={{
            fontSize: 128,
            fontWeight: 900,
            color: "#FFFFFF",
            fontFamily: T.sans,
            letterSpacing: "-0.04em",
            lineHeight: 0.95,
            display: "block",
            textShadow: "0 4px 32px rgba(0,0,0,0.7)",
          }}>
            {lines[0]}
          </span>
        </div>

        {/* Hook line 2 */}
        {lines[1] && (
          <div style={{
            transform: `translateY(${h2Y}px)`,
            opacity: h2O,
            willChange: "transform, opacity",
            marginTop: 6,
          }}>
            <span style={{
              fontSize: 128,
              fontWeight: 900,
              color: accentColor,
              fontFamily: T.sans,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
              display: "block",
              textShadow: `0 4px 40px ${accentColor}60`,
            }}>
              {lines[1]}
            </span>
          </div>
        )}
      </AbsoluteFill>

      {/* ── Badge — bottom center ── */}
      {badgeText && (
        <div style={{
          position: "absolute",
          bottom: 140,
          left: "50%",
          transform: "translateX(-50%)",
          opacity: badgeO * badgePulse,
          whiteSpace: "nowrap" as const,
          background: `${accentColor}22`,
          border: `2px solid ${accentColor}99`,
          borderRadius: 100,
          padding: "12px 40px",
        }}>
          <span style={{
            fontSize: 26,
            fontWeight: 800,
            color: accentColor,
            fontFamily: T.sans,
            letterSpacing: "0.12em",
            textTransform: "uppercase" as const,
          }}>
            ⚠ {badgeText}
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};
