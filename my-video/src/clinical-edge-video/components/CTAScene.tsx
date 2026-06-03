import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Background } from "./Background";
import { ECGLine } from "./ECGLine";
import { T } from "../styles/tokens";
import { ClinicalScenario } from "../data/scenarios";

const CFG = { damping: 18, stiffness: 120, mass: 1.05 };

interface Props { scenario: ClinicalScenario }

export const CTAScene: React.FC<Props> = ({ scenario }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Logo + brand name
  const brandFrame = Math.max(0, frame - 8);
  const brandSpring = spring({ frame: brandFrame, fps, config: CFG });
  const brandY = interpolate(brandSpring, [0, 1], [24, 0]);
  const brandOpacity = interpolate(brandFrame, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  // Tagline enters later
  const tagFrame = Math.max(0, frame - 32);
  const tagSpring = spring({ frame: tagFrame, fps, config: CFG });
  const tagY = interpolate(tagSpring, [0, 1], [20, 0]);
  const tagOpacity = interpolate(tagFrame, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  // CTA enters last
  const ctaFrame = Math.max(0, frame - 52);
  const ctaSpring = spring({ frame: ctaFrame, fps, config: CFG });
  const ctaScale = interpolate(ctaSpring, [0, 1], [0.88, 1.0]);
  const ctaOpacity = interpolate(ctaFrame, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  // Glow pulse on CTA
  const glowPulse = interpolate(Math.sin(frame * 0.06), [-1, 1], [0.55, 1.0]);

  // ECG opacity
  const ecgOpacity = interpolate(frame, [20, 40], [0, 0.4], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <Background />

      {/* ECG lines — top and bottom for visual framing */}
      <div style={{ position: "absolute", top: 220, left: 0, right: 0, opacity: ecgOpacity }}>
        <ECGLine width={1080} color={T.teal} />
      </div>
      <div style={{ position: "absolute", bottom: 220, left: 0, right: 0, opacity: ecgOpacity * 0.6 }}>
        <ECGLine width={1080} color={T.teal} />
      </div>

      {/* Center glow bloom */}
      <div style={{
        position: "absolute",
        left: "50%", top: "50%",
        width: 700, height: 700,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(0,194,209,${(0.14 * glowPulse).toFixed(3)}) 0%, transparent 55%)`,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }} />

      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: 72,
        paddingRight: 72,
        gap: 0,
      }}>
        {/* Brand mark */}
        <div style={{
          transform: `translateY(${brandY}px)`,
          opacity: brandOpacity,
          textAlign: "center",
          marginBottom: 24,
          willChange: "transform, opacity",
        }}>
          {/* CE monogram */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            marginBottom: 16,
          }}>
            <div style={{
              width: 56, height: 56,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${T.teal} 0%, #0096a8 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 28px rgba(0,194,209,0.5)`,
              flexShrink: 0,
            }}>
              <span style={{
                fontSize: 26,
                fontWeight: 900,
                color: "#fff",
                fontFamily: T.sans,
                letterSpacing: "-0.03em",
              }}>
                CE
              </span>
            </div>
            <span style={{
              fontSize: 36,
              fontWeight: 800,
              color: T.textPrimary,
              fontFamily: T.sans,
              letterSpacing: "-0.025em",
            }}>
              Clinical Edge
            </span>
          </div>

          {/* Thin teal separator */}
          <div style={{
            width: 64,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${T.teal}, transparent)`,
            margin: "0 auto",
            borderRadius: 1,
          }} />
        </div>

        {/* Tagline */}
        <div style={{
          transform: `translateY(${tagY}px)`,
          opacity: tagOpacity,
          textAlign: "center",
          marginBottom: 64,
          willChange: "transform, opacity",
        }}>
          <span style={{
            fontSize: 44,
            fontWeight: 700,
            color: T.textPrimary,
            fontFamily: T.sans,
            letterSpacing: "-0.025em",
            lineHeight: 1.2,
            display: "block",
          }}>
            AI-powered clinical reasoning for nurses.
          </span>
        </div>

        {/* CTA pill */}
        <div style={{
          transform: `scale(${ctaScale})`,
          opacity: ctaOpacity,
          willChange: "transform, opacity",
        }}>
          <div style={{
            background: "rgba(0,194,209,0.10)",
            border: `1.5px solid rgba(0,194,209,${(0.45 * glowPulse).toFixed(3)})`,
            borderRadius: 999,
            padding: "22px 56px",
            textAlign: "center",
            boxShadow: `0 0 ${40 * glowPulse}px rgba(0,194,209,0.22)`,
          }}>
            <span style={{
              fontSize: 48,
              fontWeight: 800,
              color: T.teal,
              fontFamily: T.sans,
              letterSpacing: "-0.02em",
              textShadow: `0 0 32px rgba(0,194,209,${(0.6 * glowPulse).toFixed(3)})`,
            }}>
              {scenario.cta}
            </span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
