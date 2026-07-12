import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { T } from "../../clinical-edge-video/tokens";
import { FootageBackground } from "../../video-template/components/FootageBackground";
import { ProductDemoScript } from "../types";

const SP = { damping: 22, stiffness: 90, mass: 1.1 };

type Props = Pick<ProductDemoScript, "hookLine" | "hookSub"> & {
  footageFile?: string;
};

export const ProductHookScene: React.FC<Props> = ({ hookLine, hookSub, footageFile }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Series label
  const labelF  = Math.max(0, frame - 6);
  const labelO  = interpolate(labelF, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  // Hook line 1
  const h1F  = Math.max(0, frame - 16);
  const h1Sp = spring({ frame: h1F, fps, config: SP });
  const h1Y  = interpolate(h1Sp, [0, 1], [80, 0]);
  const h1O  = interpolate(h1F, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  // Hook line 2
  const h2F  = Math.max(0, frame - 26);
  const h2Sp = spring({ frame: h2F, fps, config: SP });
  const h2Y  = interpolate(h2Sp, [0, 1], [80, 0]);
  const h2O  = interpolate(h2F, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  // Subtext — "Vitals looked okay." — appears last, creates tension
  const subF  = Math.max(0, frame - 46);
  const subSp = spring({ frame: subF, fps, config: SP });
  const subY  = interpolate(subSp, [0, 1], [20, 0]);
  const subO  = interpolate(subF, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  const lines = hookLine.split("\n");

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut, overflow: "hidden" }}>

      {footageFile ? (
        <FootageBackground
          file={footageFile}
          startFrom={0}
          overlayOpacity={0.32}
          zoomEnd={1.08}
          panY={-24}
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
        justifyContent: "center",
        padding: "140px 72px 300px",
      }}>

        {/* Series label */}
        <div style={{
          opacity: labelO,
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 30,
        }}>
          <div style={{ width: 36, height: 3, borderRadius: 2, background: T.accent }} />
          <span style={{
            fontSize: 26,
            fontWeight: 700,
            color: T.accent,
            fontFamily: T.sans,
            letterSpacing: "0.12em",
            textTransform: "uppercase" as const,
          }}>
            Clinical Assessment Series
          </span>
        </div>

        {/* Hook line 1 */}
        <div style={{ transform: `translateY(${h1Y}px)`, opacity: h1O, willChange: "transform, opacity" }}>
          <span style={{
            fontSize: 118,
            fontWeight: 900,
            color: "#FFFFFF",
            fontFamily: T.sans,
            letterSpacing: "-0.04em",
            lineHeight: 0.96,
            display: "block",
            textShadow: "0 4px 32px rgba(0,0,0,0.7)",
          }}>
            {lines[0]}
          </span>
        </div>

        {/* Hook line 2 */}
        {lines[1] && (
          <div style={{ transform: `translateY(${h2Y}px)`, opacity: h2O, willChange: "transform, opacity", marginTop: 6 }}>
            <span style={{
              fontSize: 118,
              fontWeight: 900,
              color: T.accent,
              fontFamily: T.sans,
              letterSpacing: "-0.04em",
              lineHeight: 0.96,
              display: "block",
              textShadow: `0 4px 40px ${T.accent}60`,
            }}>
              {lines[1]}
            </span>
          </div>
        )}

        {/* Subtext — creates the clinical tension */}
        <div style={{
          transform: `translateY(${subY}px)`,
          opacity: subO,
          willChange: "transform, opacity",
          marginTop: 36,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
            background: "rgba(255,255,255,0.45)",
          }} />
          <span style={{
            fontSize: 42,
            fontWeight: 400,
            color: "rgba(255,255,255,0.60)",
            fontFamily: T.sans,
            letterSpacing: "-0.02em",
            fontStyle: "italic",
          }}>
            {hookSub}
          </span>
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
