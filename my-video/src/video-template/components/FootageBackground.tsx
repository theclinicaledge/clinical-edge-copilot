import React from "react";
import { AbsoluteFill, Video, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

// ─── FootageBackground ────────────────────────────────────────────────────────
// Renders a Pexels stock video as the full-bleed scene background.
// Applies a slow zoom-in and optional pan so static footage feels cinematic.
// A semi-transparent dark overlay keeps text legible.

interface Props {
  // Path relative to public/ — e.g. "footage/complete-heart-block/clip.mp4"
  file: string;
  // Frame in the source video to start from (avoids boring first frames)
  startFrom?: number;
  // Dark overlay opacity — 0 = fully visible, 1 = fully dark. Default 0.42.
  overlayOpacity?: number;
  // Zoom scale at end of scene. 1.08 = 8% slow push-in. Default 1.08.
  zoomEnd?: number;
  // Horizontal pan in px over the scene duration. Negative = drift left.
  panX?: number;
  // Vertical pan in px over the scene duration. Negative = drift up.
  panY?: number;
  // Overlay gradient — adds a bottom-to-top dark gradient for text safety
  bottomGradient?: boolean;
  topGradient?: boolean;
}

export const FootageBackground: React.FC<Props> = ({
  file,
  startFrom      = 0,
  overlayOpacity = 0.42,
  zoomEnd        = 1.08,
  panX           = 0,
  panY           = -24,
  bottomGradient = true,
  topGradient    = true,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const scale = interpolate(frame, [0, durationInFrames], [1.0, zoomEnd], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const tx = interpolate(frame, [0, durationInFrames], [0, panX], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const ty = interpolate(frame, [0, durationInFrames], [0, panY], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* ── Video layer ── */}
      <div style={{
        position: "absolute",
        inset: "-8%",        // overscan so edges don't show during zoom
        transform: `scale(${scale}) translate(${tx}px, ${ty}px)`,
        transformOrigin: "center center",
        willChange: "transform",
      }}>
        <Video
          src={staticFile(file)}
          startFrom={startFrom}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          // Mute — music/VO will be added in post
          muted
        />
      </div>

      {/* ── Flat dark overlay ── */}
      <AbsoluteFill style={{
        background: `rgba(5, 10, 20, ${overlayOpacity})`,
        pointerEvents: "none",
      }} />

      {/* ── Bottom gradient — text safe zone ── */}
      {bottomGradient && (
        <div style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0, height: 640,
          background: "linear-gradient(0deg, rgba(5,10,20,0.92) 0%, rgba(5,10,20,0.55) 45%, transparent 100%)",
          pointerEvents: "none",
        }} />
      )}

      {/* ── Top gradient — branding safe zone ── */}
      {topGradient && (
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, height: 280,
          background: "linear-gradient(180deg, rgba(5,10,20,0.75) 0%, transparent 100%)",
          pointerEvents: "none",
        }} />
      )}
    </AbsoluteFill>
  );
};
