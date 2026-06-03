import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Background } from "./Background";
import { ECGLine } from "./ECGLine";
import { ClinicalCard } from "./ClinicalCard";
import { T } from "../styles/tokens";
import { ClinicalScenario } from "../data/scenarios";

const CFG = { damping: 20, stiffness: 130, mass: 1.0 };

interface Props { scenario: ClinicalScenario }

const cards = (scenario: ClinicalScenario) => [
  {
    tag: "Urgency Level",
    color: T.urgHigh,
    bg: T.urgHighBg,
    border: T.urgHighBorder,
    content: scenario.urgency === "HIGH" ? "High Urgency" : scenario.urgency === "MODERATE" ? "Moderate Urgency" : "Low Urgency",
    icon: "⚡",
  },
  {
    tag: "Biggest Concern",
    color: "#fcd34d",
    bg: "rgba(245,158,11,0.10)",
    border: "rgba(245,158,11,0.35)",
    content: scenario.biggestConcern,
    icon: "▲",
  },
  {
    tag: "First Nursing Actions",
    color: T.teal,
    bg: "rgba(0,194,209,0.07)",
    border: "rgba(0,194,209,0.28)",
    content: scenario.actions,
    icon: "→",
  },
];

export const InsightCardsScene: React.FC<Props> = ({ scenario }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const labelOpacity = interpolate(frame, [4, 18], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const cardData = cards(scenario);

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      <Background />

      {/* ECG at top */}
      <div style={{ position: "absolute", top: 148, left: 0, right: 0, opacity: 0.28 }}>
        <ECGLine width={1080} color={T.teal} />
      </div>

      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: 60,
        paddingRight: 60,
      }}>
        {/* Section label */}
        <div style={{
          position: "absolute",
          top: 178,
          left: 0, right: 0,
          textAlign: "center",
          opacity: labelOpacity,
        }}>
          <span style={{
            fontSize: 20,
            fontWeight: 700,
            color: T.teal,
            fontFamily: T.mono,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}>
            Clinical Insights
          </span>
        </div>

        {/* Insight cards */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 28,
          width: "100%",
          marginTop: 32,
        }}>
          {cardData.map((card, i) => {
            const entryStart = 16 + i * 20;
            const cFrame = Math.max(0, frame - entryStart);
            const cSpring = spring({ frame: cFrame, fps, config: CFG });
            const cY = interpolate(cSpring, [0, 1], [40, 0]);
            const cScale = interpolate(cSpring, [0, 1], [0.93, 1.0]);
            const cOpacity = interpolate(cFrame, [0, 14], [0, 1], { extrapolateRight: "clamp" });

            const isActions = Array.isArray(card.content);

            return (
              <div key={i} style={{
                transform: `translateY(${cY}px) scale(${cScale})`,
                opacity: cOpacity,
                willChange: "transform, opacity",
              }}>
                <div style={{
                  background: card.bg,
                  border: `1px solid ${card.border}`,
                  borderLeft: `3px solid ${card.color}`,
                  borderRadius: 16,
                  padding: "26px 30px",
                  boxShadow: `0 4px 32px rgba(0,0,0,0.32), 0 0 0 1px rgba(255,255,255,0.03)`,
                }}>
                  {/* Tag */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 12,
                  }}>
                    <span style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: card.color,
                      fontFamily: T.mono,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      opacity: 0.9,
                    }}>
                      {card.tag}
                    </span>
                  </div>

                  {/* Content */}
                  {isActions ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {(card.content as string[]).map((action, ai) => (
                        <div key={ai} style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                        }}>
                          <span style={{
                            color: card.color,
                            fontFamily: T.mono,
                            fontSize: 20,
                            lineHeight: 1.3,
                            flexShrink: 0,
                            marginTop: 1,
                          }}>
                            →
                          </span>
                          <span style={{
                            fontSize: 28,
                            fontWeight: 600,
                            color: T.textPrimary,
                            fontFamily: T.body,
                            lineHeight: 1.3,
                          }}>
                            {action}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{
                      fontSize: 38,
                      fontWeight: 800,
                      color: card.color,
                      fontFamily: T.sans,
                      letterSpacing: "-0.02em",
                      lineHeight: 1.1,
                      textShadow: `0 0 24px ${card.color}55`,
                    }}>
                      {card.content as string}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
