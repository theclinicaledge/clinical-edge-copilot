import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { T } from "../tokens";
import { ClinicalScenario } from "../data/scenarios";

const SPRING = { damping: 20, stiffness: 130, mass: 1.0 };

interface Props {
  scenario: ClinicalScenario;
}

// Large section card — real app style, scaled for video
// White card on warm background, colored left border
function BigCard({
  label,
  headline,
  bullets,
  accent,
  frame,
  fps,
  entryFrame,
}: {
  label: string;
  headline?: string;
  bullets?: string[];
  accent: string;
  frame: number;
  fps: number;
  entryFrame: number;
}) {
  const cFrame = Math.max(0, frame - entryFrame);
  const cSpring = spring({ frame: cFrame, fps, config: SPRING });
  const cY = interpolate(cSpring, [0, 1], [50, 0]);
  const cScale = interpolate(cSpring, [0, 1], [0.94, 1.0]);
  const cOpacity = interpolate(cFrame, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{
      transform: `translateY(${cY}px) scale(${cScale})`,
      opacity: cOpacity,
      willChange: "transform, opacity",
    }}>
      <div style={{
        background: T.lightCard,
        border: `1px solid ${T.lightCardBorder}`,
        borderLeft: `5px solid ${accent}`,
        borderRadius: 8,
        padding: "28px 32px",
        marginBottom: 20,
      }}>
        {/* Label */}
        <div style={{
          fontSize: 22,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          color: accent,
          marginBottom: 14,
          fontFamily: T.mono,
          opacity: 0.88,
        }}>
          {label}
        </div>

        {/* Headline */}
        {headline && (
          <div style={{
            fontSize: 44,
            fontWeight: 700,
            color: T.lightCardText,
            fontFamily: T.sans,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: bullets ? 16 : 0,
          }}>
            {headline}
          </div>
        )}

        {/* Bullets */}
        {bullets && bullets.map((b, i) => (
          <div key={i} style={{
            display: "flex",
            gap: 14,
            alignItems: "flex-start",
            marginBottom: i < bullets.length - 1 ? 10 : 0,
          }}>
            <span style={{
              color: accent,
              fontWeight: 700,
              flexShrink: 0,
              fontSize: 28,
              lineHeight: 1.45,
            }}>›</span>
            <span style={{
              fontSize: 32,
              lineHeight: 1.45,
              color: T.lightCardText,
              fontFamily: T.sans,
              fontWeight: 400,
            }}>
              {b}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const TakeawayScene: React.FC<Props> = ({ scenario }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const labelOpacity = interpolate(frame, [6, 22], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Closing line at the bottom
  const closingOpacity = interpolate(frame, [88, 108], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{
      opacity: fadeIn * fadeOut,
      background: T.workspaceBg, // warm workspace background
    }}>

      {/* Warm workspace — fills the full frame, like viewing the output section */}
      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        paddingTop: 160,
        paddingLeft: 64,
        paddingRight: 64,
        paddingBottom: 60,
      }}>

        {/* Section label */}
        <div style={{
          opacity: labelOpacity,
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 40,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: T.sectionRed,
            flexShrink: 0,
          }} />
          <span style={{
            fontSize: 24,
            fontWeight: 500,
            color: T.textSubtle,
            fontFamily: T.mono,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}>
            Clinical Takeaway
          </span>
        </div>

        {/* Card 1: Biggest concern */}
        <BigCard
          label="Possible concerns"
          headline={scenario.concern.split(".")[0] + "."}
          accent={T.sectionRed}
          frame={frame}
          fps={fps}
          entryFrame={14}
        />

        {/* Card 2: Actions */}
        <BigCard
          label="What to do now"
          bullets={scenario.actions}
          accent={T.sectionGreen}
          frame={frame}
          fps={fps}
          entryFrame={38}
        />

        {/* Closing italic pull-quote — App.jsx Closing section style */}
        <div style={{
          opacity: closingOpacity,
          borderLeft: `3px solid ${T.closingAccent}`,
          padding: "16px 22px",
          marginTop: 6,
          background: "rgba(255,255,255,0.55)",
          borderRadius: "0 8px 8px 0",
        }}>
          <p style={{
            margin: 0,
            fontSize: 28,
            fontStyle: "italic",
            color: T.textSubtle,
            lineHeight: 1.62,
            letterSpacing: "0.008em",
            fontFamily: T.sans,
          }}>
            {scenario.closingLine}
          </p>
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
