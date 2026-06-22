import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { T } from "../../clinical-edge-video/tokens";
import { HeartBlockStrip } from "../ecg/HeartBlockStrip";

const SP = { damping: 18, stiffness: 90, mass: 1.08 };

export const CHBCTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Breathing glow
  const glow = interpolate(Math.sin(frame * 0.030), [-1, 1], [0.05, 0.14]);

  // Logo springs in
  const logoF = Math.max(0, frame - 8);
  const logoSp = spring({ frame: logoF, fps, config: SP });
  const logoY = interpolate(logoSp, [0, 1], [36, 0]);
  const logoOpacity = interpolate(logoF, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  // Handle spring
  const handleF = Math.max(0, frame - 30);
  const handleSp = spring({ frame: handleF, fps, config: SP });
  const handleY = interpolate(handleSp, [0, 1], [24, 0]);
  const handleOpacity = interpolate(handleF, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  // Description line
  const descF = Math.max(0, frame - 44);
  const descOpacity = interpolate(descF, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  // ECG strip bg
  const stripOpacity = interpolate(frame, [10, 40], [0, 0.14], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: T.pageBg, overflow: "hidden", opacity: fadeIn }}>

      {/* ── Grid bg ── */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(10,191,188,0.012) 1px, transparent 1px),
          linear-gradient(90deg, rgba(10,191,188,0.012) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
        pointerEvents: "none",
      }} />

      {/* ── Center radial glow ── */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        width: 900, height: 900, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(10,191,188,${glow.toFixed(3)}) 0%, transparent 55%)`,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }} />

      {/* ── ECG strip in background ── */}
      <div style={{
        position: "absolute",
        bottom: 100,
        left: 0,
        opacity: stripOpacity,
      }}>
        <HeartBlockStrip
          width={1080}
          height={220}
          scrollSpeed={3.0}
          showGrid={false}
          pCycleW={108}
          qrsCycleW={231}
        />
      </div>

      {/* ── Top + bottom vignettes ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 200,
        background: "linear-gradient(180deg, rgba(0,0,0,0.30) 0%, transparent 100%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 240,
        background: `linear-gradient(0deg, ${T.pageBg} 0%, transparent 100%)`,
        pointerEvents: "none",
      }} />

      {/* ── Top bar ── */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, height: 6,
        background: `linear-gradient(90deg, ${T.accent}, rgba(10,191,188,0.3))`,
      }} />

      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
        gap: 0,
      }}>

        {/* ── Brand name ── */}
        <div style={{
          transform: `translateY(${logoY}px)`,
          opacity: logoOpacity,
          willChange: "transform, opacity",
          textAlign: "center",
          marginBottom: 20,
        }}>
          <div style={{
            fontSize: 22,
            fontWeight: 600,
            color: T.accent,
            fontFamily: T.sans,
            letterSpacing: "0.10em",
            textTransform: "uppercase" as const,
            marginBottom: 12,
          }}>
            Clinical Edge
          </div>
          <div style={{
            fontSize: 80,
            fontWeight: 800,
            color: T.textPrimary,
            fontFamily: T.sans,
            letterSpacing: "-0.045em",
            lineHeight: 1.0,
          }}>
            Complete Heart Block
          </div>
        </div>

        {/* ── Teal divider ── */}
        <div style={{
          width: 64,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${T.accent}, transparent)`,
          borderRadius: 1,
          marginBottom: 28,
          opacity: handleOpacity,
          boxShadow: `0 0 20px ${T.accent}`,
        }} />

        {/* ── TikTok handle ── */}
        <div style={{
          transform: `translateY(${handleY}px)`,
          opacity: handleOpacity,
          willChange: "transform, opacity",
          textAlign: "center",
          marginBottom: 20,
        }}>
          <div style={{
            fontSize: 52,
            fontWeight: 800,
            color: T.textPrimary,
            fontFamily: T.sans,
            letterSpacing: "-0.030em",
          }}>
            @clinicaledge.co
          </div>
        </div>

        {/* ── Description ── */}
        <div style={{
          opacity: descOpacity,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}>
          {["Daily clinical reasoning for nurses.", "Rhythm interpretation. ICU drips. Real scenarios."].map((line, i) => (
            <div key={i} style={{
              fontSize: 28,
              fontWeight: i === 0 ? 500 : 400,
              color: i === 0 ? T.textSecondary : T.textMuted,
              fontFamily: T.sans,
              letterSpacing: "-0.01em",
              lineHeight: 1.4,
            }}>
              {line}
            </div>
          ))}
        </div>

        {/* ── Follow pill ── */}
        <div style={{
          opacity: descOpacity,
          marginTop: 48,
          background: T.accent,
          borderRadius: 100,
          padding: "16px 56px",
        }}>
          <span style={{
            fontSize: 32,
            fontWeight: 800,
            color: "#0A1628",
            fontFamily: T.sans,
            letterSpacing: "-0.01em",
          }}>
            Follow for more →
          </span>
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
