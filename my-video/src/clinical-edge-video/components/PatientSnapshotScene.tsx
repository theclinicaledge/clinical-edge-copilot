import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Background } from "./Background";
import { ECGLine } from "./ECGLine";
import { ClinicalCard } from "./ClinicalCard";
import { T } from "../styles/tokens";
import { ClinicalScenario } from "../data/scenarios";

const CFG = { damping: 20, stiffness: 140, mass: 0.9 };

interface Props { scenario: ClinicalScenario }

export const PatientSnapshotScene: React.FC<Props> = ({ scenario }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Header
  const headerOpacity = interpolate(frame, [6, 20], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      <Background />

      {/* ECG at top */}
      <div style={{ position: "absolute", top: 140, left: 0, right: 0, opacity: 0.35 }}>
        <ECGLine width={1080} color={T.teal} />
      </div>

      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: 64,
        paddingRight: 64,
      }}>
        {/* Section label */}
        <div style={{
          position: "absolute",
          top: 184,
          left: 0, right: 0,
          textAlign: "center",
          opacity: headerOpacity,
        }}>
          <span style={{
            fontSize: 20,
            fontWeight: 700,
            color: T.teal,
            fontFamily: T.mono,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}>
            Patient Snapshot
          </span>
        </div>

        {/* Vitals cards — staggered entry */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          width: "100%",
          marginTop: 40,
        }}>
          {scenario.patientSnapshot.map((vital, i) => {
            // Each vital enters with a stagger: entry frame = 20 + i * 14
            const entryStart = 20 + i * 14;
            const vFrame = Math.max(0, frame - entryStart);
            const vSpring = spring({ frame: vFrame, fps, config: CFG });
            const vX = interpolate(vSpring, [0, 1], [48, 0]);
            const vOpacity = interpolate(vFrame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
            const accentColor = vital.flagged ? T.urgHigh : T.teal;

            return (
              <div key={i} style={{
                transform: `translateX(${vX}px)`,
                opacity: vOpacity,
                willChange: "transform, opacity",
              }}>
                <ClinicalCard accentColor={accentColor}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                    <span style={{
                      fontSize: 26,
                      fontWeight: 600,
                      color: T.textMuted,
                      fontFamily: T.mono,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}>
                      {vital.label}
                    </span>
                    <span style={{
                      fontSize: vital.flagged ? 38 : 34,
                      fontWeight: vital.flagged ? 800 : 600,
                      color: vital.flagged ? T.urgHigh : T.textPrimary,
                      fontFamily: vital.flagged ? T.sans : T.mono,
                      letterSpacing: vital.flagged ? "-0.02em" : "0.04em",
                      textShadow: vital.flagged
                        ? `0 0 22px rgba(252,165,165,0.45)`
                        : undefined,
                    }}>
                      {vital.value}
                    </span>
                  </div>
                </ClinicalCard>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
