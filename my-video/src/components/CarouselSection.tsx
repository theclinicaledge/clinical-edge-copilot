import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { GlowBackground } from "./GlowBackground";
import { ParticleField } from "./ParticleField";
import { T } from "../tokens";

// Shared carousel-style section layout used for all 4 Copilot output sections.
// Matches the Clinical Edge carousel design language:
//   - Large colored section headline (left-aligned, top of frame)
//   - Subtitle body text
//   - Colored divider rule
//   - Dark card with left accent border + staggered bullet/numbered items

const TRANS = 15;
const SPRING_CFG = { damping: 22, stiffness: 145, mass: 0.92 };

export interface BulletItem {
  text: string;
}

export interface NumberedItem {
  num: string;
  action: string;
  sub: string;
}

interface CarouselSectionProps {
  accentColor: string;
  sectionLabel: string;   // e.g. "WHAT THIS COULD BE"
  headline: string;       // supports \n line breaks
  subtitle: string;
  bullets?: BulletItem[];
  numbered?: NumberedItem[];
  glowIntensity?: number;
}

export const CarouselSection: React.FC<CarouselSectionProps> = ({
  accentColor,
  sectionLabel,
  headline,
  subtitle,
  bullets,
  numbered,
  glowIntensity = 1.0,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // ─── Scene transitions ────────────────────────────────────────────────────
  const fadeIn  = interpolate(frame, [0, TRANS], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - TRANS, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sceneOpacity = Math.min(fadeIn, fadeOut);

  const blurIn  = interpolate(frame, [0, TRANS], [6, 0], { extrapolateRight: "clamp" });
  const blurOut = interpolate(frame, [durationInFrames - TRANS, durationInFrames], [0, 6], { extrapolateLeft: "clamp" });
  const sceneBlur = frame < TRANS ? blurIn : frame > durationInFrames - TRANS ? blurOut : 0;

  // ─── Camera push ─────────────────────────────────────────────────────────
  const cam = interpolate(frame, [0, durationInFrames], [1.0, 1.022], { extrapolateRight: "clamp" });

  // ─── Section label ────────────────────────────────────────────────────────
  const labelOpacity = interpolate(frame, [TRANS, TRANS + 16], [0, 1], { extrapolateRight: "clamp" });

  // ─── Headline spring ─────────────────────────────────────────────────────
  const headFrame = Math.max(0, frame - TRANS - 4);
  const headSpring = spring({ frame: headFrame, fps, config: SPRING_CFG });
  const headY = interpolate(headSpring, [0, 1], [36, 0]);
  const headOpacity = interpolate(headFrame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // ─── Subtitle ─────────────────────────────────────────────────────────────
  const subOpacity = interpolate(frame, [TRANS + 28, TRANS + 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ─── Divider ─────────────────────────────────────────────────────────────
  const dividerW = interpolate(frame, [TRANS + 44, TRANS + 76], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ─── Card entry ──────────────────────────────────────────────────────────
  const cardFrame = Math.max(0, frame - (TRANS + 58));
  const cardSpring = spring({ frame: cardFrame, fps, config: SPRING_CFG });
  const cardY = interpolate(cardSpring, [0, 1], [28, 0]);
  const cardOpacity = interpolate(cardFrame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // ─── Item stagger ────────────────────────────────────────────────────────
  const ITEM_START = TRANS + 68;  // frame 83
  const BULLET_GAP = 25;
  const NUMBERED_GAP = 28;

  return (
    <AbsoluteFill style={{
      opacity: sceneOpacity,
      filter: sceneBlur > 0 ? `blur(${sceneBlur}px)` : undefined,
    }}>

      {/* Background + camera push */}
      <AbsoluteFill style={{ transform: `scale(${cam})`, transformOrigin: "center center" }}>
        <GlowBackground intensity={glowIntensity} />
        <ParticleField count={20} slowFactor={0.30} dimFactor={0.58} />
      </AbsoluteFill>

      {/* Section-tinted atmospheric bloom — very subtle colour hint upper-left */}
      <div style={{
        position: "absolute",
        top: 0, left: 0,
        width: "75%", height: "52%",
        background: `radial-gradient(ellipse 88% 78% at 8% 8%, ${accentColor}14 0%, transparent 62%)`,
        pointerEvents: "none",
      }} />

      {/* Vignette */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse 90% 94% at 50% 44%, transparent 24%, rgba(5,12,24,0.28) 56%, rgba(3,7,15,0.76) 100%)",
        pointerEvents: "none",
      }} />

      {/* Content — left-aligned, starts near top (matching carousel layout) */}
      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        paddingLeft: 64,
        paddingRight: 64,
        paddingTop: 188,
      }}>

        {/* Section label */}
        <div style={{
          opacity: labelOpacity,
          fontSize: 20,
          fontWeight: 700,
          color: accentColor,
          fontFamily: T.mono,
          letterSpacing: "0.20em",
          textTransform: "uppercase",
          marginBottom: 18,
        }}>
          {sectionLabel}
        </div>

        {/* Big colored headline — left-aligned, Syne extra-bold */}
        <div style={{
          transform: `translateY(${headY}px)`,
          opacity: headOpacity,
          marginBottom: 26,
        }}>
          {headline.split("\n").map((line, i) => (
            <div key={i} style={{
              fontSize: 94,
              fontWeight: 800,
              color: accentColor,
              fontFamily: T.sans,
              letterSpacing: "-0.04em",
              lineHeight: 0.97,
              display: "block",
            }}>
              {line}
            </div>
          ))}
        </div>

        {/* Subtitle */}
        <div style={{
          opacity: subOpacity,
          fontSize: 36,
          fontWeight: 400,
          color: T.textBody,
          fontFamily: T.body,
          lineHeight: 1.45,
          marginBottom: 28,
        }}>
          {subtitle}
        </div>

        {/* Colored divider rule */}
        <div style={{
          width: `${dividerW}%`,
          height: 2,
          background: `linear-gradient(90deg, ${accentColor}95, ${accentColor}10)`,
          marginBottom: 26,
          borderRadius: 2,
        }} />

        {/* Card — dark, left accent border */}
        <div style={{
          transform: `translateY(${cardY}px)`,
          opacity: cardOpacity,
          borderRadius: 16,
          background: "rgba(7, 16, 30, 0.78)",
          border: `1px solid ${accentColor}18`,
          borderLeft: `3px solid ${accentColor}`,
          backdropFilter: "blur(10px)",
          padding: bullets ? "30px 36px" : "26px 32px",
        }}>

          {/* Bullet items */}
          {bullets && bullets.map((item, i) => {
            const iStart = ITEM_START + i * BULLET_GAP;
            const iOp = interpolate(frame, [iStart, iStart + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const iX  = interpolate(frame, [iStart, iStart + 22], [-20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={i} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 20,
                marginBottom: i < bullets.length - 1 ? 22 : 0,
                opacity: iOp,
                transform: `translateX(${iX}px)`,
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: accentColor,
                  flexShrink: 0,
                  marginTop: 14,
                }} />
                <div style={{
                  fontSize: 34,
                  fontWeight: 400,
                  color: T.textPrimary,
                  fontFamily: T.body,
                  lineHeight: 1.45,
                }}>
                  {item.text}
                </div>
              </div>
            );
          })}

          {/* Numbered items */}
          {numbered && numbered.map((item, i) => {
            const iStart = ITEM_START + i * NUMBERED_GAP;
            const iOp = interpolate(frame, [iStart, iStart + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const iX  = interpolate(frame, [iStart, iStart + 24], [-20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={i} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 20,
                marginBottom: i < numbered.length - 1 ? 26 : 0,
                opacity: iOp,
                transform: `translateX(${iX}px)`,
              }}>
                {/* Teal number badge — matching real Copilot app design */}
                <div style={{
                  width: 46, height: 46, borderRadius: "50%",
                  border: `1.5px solid ${T.teal}`,
                  background: "rgba(0,194,203,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <span style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: T.teal,
                    fontFamily: T.mono,
                    letterSpacing: "0.02em",
                  }}>
                    {item.num}
                  </span>
                </div>

                <div>
                  <div style={{
                    fontSize: 33,
                    fontWeight: 700,
                    color: T.textPrimary,
                    fontFamily: T.body,
                    lineHeight: 1.2,
                    marginBottom: 5,
                  }}>
                    {item.action}
                  </div>
                  <div style={{
                    fontSize: 27,
                    fontWeight: 400,
                    color: T.textBody,
                    fontFamily: T.body,
                    lineHeight: 1.40,
                  }}>
                    {item.sub}
                  </div>
                </div>
              </div>
            );
          })}

        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
