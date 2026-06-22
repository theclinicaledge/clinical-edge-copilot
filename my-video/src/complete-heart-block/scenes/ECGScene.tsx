import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { T } from "../../clinical-edge-video/tokens";
import { HeartBlockStrip } from "../ecg/HeartBlockStrip";

const SP = { damping: 18, stiffness: 95, mass: 1.0 };

// ─── Callout bubble ───────────────────────────────────────────────────────────
const Callout: React.FC<{
  frame: number;
  startFrame: number;
  fps: number;
  text: string;
  subText: string;
  color: string;
  side: "left" | "right";
  yPct: number; // vertical position as % of container height
}> = ({ frame, startFrame, fps, text, subText, color, side, yPct }) => {
  const f = Math.max(0, frame - startFrame);
  const sp = spring({ frame: f, fps, config: SP });
  const x = interpolate(sp, [0, 1], [side === "left" ? -48 : 48, 0]);
  const opacity = interpolate(f, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "absolute",
      top: `${yPct}%`,
      ...(side === "left" ? { left: 48 } : { right: 48 }),
      transform: `translateX(${x}px)`,
      opacity,
      willChange: "transform, opacity",
      maxWidth: 340,
    }}>
      <div style={{
        background: `rgba(17,24,39,0.92)`,
        border: `1.5px solid ${color}40`,
        borderLeft: side === "left" ? `3px solid ${color}` : undefined,
        borderRight: side === "right" ? `3px solid ${color}` : undefined,
        borderRadius: 12,
        padding: "16px 20px",
        backdropFilter: "blur(8px)",
      }}>
        <div style={{
          fontSize: 26,
          fontWeight: 700,
          color,
          fontFamily: T.sans,
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          marginBottom: 6,
        }}>
          {text}
        </div>
        <div style={{
          fontSize: 20,
          fontWeight: 400,
          color: T.textSecondary,
          fontFamily: T.sans,
          lineHeight: 1.35,
        }}>
          {subText}
        </div>
      </div>
    </div>
  );
};

// ─── Dissociation label ───────────────────────────────────────────────────────
const DissociationLabel: React.FC<{ frame: number; startFrame: number; fps: number }> = ({
  frame, startFrame, fps,
}) => {
  const f = Math.max(0, frame - startFrame);
  const sp = spring({ frame: f, fps, config: SP });
  const scale = interpolate(sp, [0, 1], [0.88, 1.0]);
  const opacity = interpolate(f, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "absolute",
      bottom: 52,
      left: "50%",
      transform: `translateX(-50%) scale(${scale})`,
      opacity,
      willChange: "transform, opacity",
      textAlign: "center",
    }}>
      <div style={{
        background: "rgba(239,68,68,0.10)",
        border: "1.5px solid rgba(239,68,68,0.40)",
        borderRadius: 100,
        padding: "12px 40px",
      }}>
        <span style={{
          fontSize: 26,
          fontWeight: 700,
          color: "#f87171",
          fontFamily: T.sans,
          letterSpacing: "0.04em",
        }}>
          NO RELATIONSHIP BETWEEN P AND QRS
        </span>
      </div>
    </div>
  );
};

// ─── ECGScene ─────────────────────────────────────────────────────────────────

export const ECGScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Title springs in
  const titleF = Math.max(0, frame - 6);
  const titleSp = spring({ frame: titleF, fps, config: SP });
  const titleY = interpolate(titleSp, [0, 1], [30, 0]);
  const titleOpacity = interpolate(titleF, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  // Heart rate badge
  const hrF = Math.max(0, frame - 18);
  const hrOpacity = interpolate(hrF, [0, 16], [0, 1], { extrapolateRight: "clamp" });
  const hrPulse = interpolate(Math.sin(frame * 0.09), [-1, 1], [0.75, 1.0]);

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

      {/* ── Top bar ── */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, height: 6,
        background: `linear-gradient(90deg, ${T.accent}, rgba(10,191,188,0.3))`,
      }} />

      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        padding: "80px 72px 80px",
        gap: 0,
      }}>

        {/* ── Title block ── */}
        <div style={{
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          willChange: "transform, opacity",
          marginBottom: 24,
        }}>
          <div style={{
            fontSize: 22,
            fontWeight: 600,
            color: T.accent,
            fontFamily: T.sans,
            letterSpacing: "0.10em",
            textTransform: "uppercase" as const,
            marginBottom: 8,
          }}>
            Cardiac Rhythm Series
          </div>
          <div style={{
            fontSize: 80,
            fontWeight: 800,
            color: T.textPrimary,
            fontFamily: T.sans,
            letterSpacing: "-0.040em",
            lineHeight: 1.0,
          }}>
            Complete Heart Block
          </div>
          <div style={{
            fontSize: 32,
            fontWeight: 400,
            color: T.textSecondary,
            fontFamily: T.sans,
            letterSpacing: "-0.01em",
            marginTop: 6,
          }}>
            3rd Degree AV Block
          </div>
        </div>

        {/* ── HR badges ── */}
        <div style={{
          opacity: hrOpacity,
          display: "flex",
          gap: 20,
          marginBottom: 32,
        }}>
          <div style={{
            background: "rgba(10,191,188,0.10)",
            border: "1.5px solid rgba(10,191,188,0.30)",
            borderRadius: 8,
            padding: "8px 20px",
          }}>
            <span style={{
              fontSize: 22,
              fontWeight: 600,
              color: T.accent,
              fontFamily: T.sans,
            }}>
              P rate: ~75 bpm
            </span>
          </div>
          <div style={{
            background: "rgba(242,185,75,0.10)",
            border: "1.5px solid rgba(242,185,75,0.30)",
            borderRadius: 8,
            padding: "8px 20px",
            opacity: hrPulse,
          }}>
            <span style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#F2B94B",
              fontFamily: T.sans,
            }}>
              Ventricular: ~35 bpm ⚠
            </span>
          </div>
        </div>

        {/* ── ECG strip container ── */}
        <div style={{
          position: "relative",
          background: "rgba(0,0,0,0.35)",
          border: "1px solid rgba(10,191,188,0.15)",
          borderRadius: 16,
          overflow: "hidden",
          flex: 1,
          minHeight: 320,
          maxHeight: 380,
        }}>
          <HeartBlockStrip
            width={936}
            height={340}
            scrollSpeed={4.5}
            showGrid
            pCycleW={108}
            qrsCycleW={231}
            pAmp={14}
            qrsH={96}
            qrsW={36}
          />

          {/* ── Callout: P wave ── */}
          <Callout
            frame={frame}
            startFrame={30}
            fps={fps}
            text="P waves"
            subText="Regular. 75/min. SA node firing normally."
            color={T.accent}
            side="left"
            yPct={8}
          />

          {/* ── Callout: QRS ── */}
          <Callout
            frame={frame}
            startFrame={62}
            fps={fps}
            text="Wide QRS"
            subText="Slow. ~35/min. Ventricular escape rhythm."
            color="#F2B94B"
            side="right"
            yPct={8}
          />
        </div>

        {/* ── Dissociation label ── */}
        <div style={{ position: "relative", height: 96 }}>
          <DissociationLabel frame={frame} startFrame={100} fps={fps} />
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
