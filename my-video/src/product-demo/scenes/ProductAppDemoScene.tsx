import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { T } from "../../clinical-edge-video/tokens";
import { CELogo } from "../../clinical-edge-video/components/CELogo";
import { ProductDemoScript, AppSection } from "../types";

const SP  = { damping: 16, stiffness: 95, mass: 1.0 };   // snappier reveal
const SPF = { damping: 24, stiffness: 110, mass: 0.9 };

// Real CE section accent colors (from frontend/src/App.jsx SECTIONS array)
const CE_SECTION_COLORS: Record<string, string> = {
  "What this could be":    "#4da3ff",
  "Possible concerns":     "#e05572",
  "What to assess next":   "#1FBF75",
  "What I'd assess next":  "#1FBF75",
  "What to consider next": "#F2B94B",
  "What I'd do right now": "#F2B94B",
  "Where this may be heading": "#F2B94B",
  "Closing":               "#0ABFBC",
};

// Real CE card colors (from frontend/src/styles/tokens.css and App.jsx)
const CE_WARM_CARD = "#FFFDF8";
const CE_WARM_LINE = "#D6D0C4";
const CE_WARM_BG   = "#E7E1D6";

type Props = Pick<ProductDemoScript, "appPrompt" | "appResponseItems" | "appUrgency" | "appSections">;

// ── Timing constants (relative to scene start) ───────────────────────────────
const T_PHONE   = 4;
const T_HEADER  = 18;
const T_PROMPT  = 28;
const T_URGENCY = 46;
// Each section: title at T_Sn, items stagger 12 frames each
const T_S1 = 60;
const T_S2 = 96;
const T_S3 = 132;
const T_S4 = 166;

// Real CE SectionCard — matches the actual app card structure
const SectionCard: React.FC<{
  frame: number; fps: number;
  titleStart: number; itemsStart: number;
  section: AppSection;
}> = ({ frame, fps, titleStart, itemsStart, section }) => {
  const accent = section.color ?? CE_SECTION_COLORS[section.title] ?? "#0ABFBC";

  const titleO = interpolate(
    Math.max(0, frame - titleStart), [0, 12], [0, 1], { extrapolateRight: "clamp" }
  );

  return (
    <div style={{
      opacity: titleO,
      background: CE_WARM_CARD,
      borderRadius: 12,
      border: `1px solid ${CE_WARM_LINE}`,
      borderLeft: `3px solid ${accent}`,
      padding: "12px 16px",
      marginBottom: 10,
    }}>
      {/* Section title — matches real app: accent color, uppercase label */}
      <div style={{
        fontSize: 15,
        fontWeight: 800,
        color: accent,
        fontFamily: T.sans,
        letterSpacing: "0.08em",
        textTransform: "uppercase" as const,
        marginBottom: 8,
      }}>
        {section.title}
      </div>

      {/* Bullet items */}
      {section.items.map((item, i) => {
        const f  = Math.max(0, frame - (itemsStart + i * 12));
        const sp = spring({ frame: f, fps, config: SPF });
        const y  = interpolate(sp, [0, 1], [10, 0]);
        const o  = interpolate(f, [0, 10], [0, 1], { extrapolateRight: "clamp" });
        return (
          <div key={i} style={{
            transform: `translateY(${y}px)`,
            opacity: o,
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "4px 0",
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%", flexShrink: 0, marginTop: 8,
              background: accent,
              boxShadow: `0 0 4px ${accent}80`,
            }} />
            <span style={{
              fontSize: 22,
              fontWeight: 450,
              color: "#1E2A3A",
              fontFamily: T.sans,
              lineHeight: 1.4,
              letterSpacing: "-0.01em",
            }}>
              {item}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const ProductAppDemoScene: React.FC<Props> = ({
  appPrompt, appResponseItems, appUrgency = "MODERATE", appSections,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Phone reveal — dramatic scale + rise entrance
  const phoneF  = Math.max(0, frame - T_PHONE);
  const phoneSp = spring({ frame: phoneF, fps, config: SP });
  const phoneSc = interpolate(phoneSp, [0, 1], [0.76, 1.0]);
  const phoneRiseY = interpolate(phoneSp, [0, 1], [60, 0]);
  const phoneO  = interpolate(phoneF, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  // Continuous float + perspective tilt after reveal settles
  const settled = Math.max(0, frame - 35);
  const floatY  = settled > 0 ? Math.sin(settled * 0.042) * 9 : 0;
  const tiltDeg = settled > 0 ? Math.sin(settled * 0.027) * 1.6 : 0;

  // App header
  const headerO = interpolate(Math.max(0, frame - T_HEADER), [0, 14], [0, 1], { extrapolateRight: "clamp" });

  // Prompt card
  const promptF  = Math.max(0, frame - T_PROMPT);
  const promptSp = spring({ frame: promptF, fps, config: SP });
  const promptY  = interpolate(promptSp, [0, 1], [18, 0]);
  const promptO  = interpolate(promptF, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  // Urgency badge
  const urgencyO = interpolate(Math.max(0, frame - T_URGENCY), [0, 12], [0, 1], { extrapolateRight: "clamp" });

  // Context label
  const ctxO = interpolate(Math.max(0, frame - 8), [0, 16], [0, 1], { extrapolateRight: "clamp" });

  // Urgency badge colors — match real CE URGENCY_STYLES (warm surface variant)
  const urgencyColor = appUrgency === "HIGH" ? "#8E2F2F" : appUrgency === "LOW" ? "#0F766E" : "#9A6F1F";
  const urgencyDot   = appUrgency === "HIGH" ? "#e05572" : appUrgency === "LOW" ? "#5eead4" : "#e8c060";
  const urgencyBg    = appUrgency === "HIGH" ? "rgba(190,70,70,0.10)" : appUrgency === "LOW" ? "rgba(15,118,110,0.10)" : "rgba(154,111,31,0.10)";
  const urgencyBorder= appUrgency === "HIGH" ? "#B45454" : appUrgency === "LOW" ? "#0F766E" : "#B8922A";

  // Phone dimensions — 77% of screen height, dominant hero
  const PHONE_W = 900;
  const PHONE_H = 1480;
  const PHONE_L = (1080 - PHONE_W) / 2;  // 90px each side
  const PHONE_T = 300;

  const displayPrompt = appPrompt.length > 90 ? appPrompt.slice(0, 87) + "..." : appPrompt;

  // Build sections from appSections or fallback
  const sections: AppSection[] = appSections ?? [
    { title: "What this could be",    color: "#4da3ff", items: appResponseItems.slice(0, 2) },
    { title: "What to assess next",   color: "#1FBF75", items: appResponseItems.slice(2, 4) },
    { title: "What I'd do right now", color: "#F2B94B", items: appResponseItems.slice(4) },
  ];

  const sectionStarts = [
    { t: T_S1, i: T_S1 + 10 },
    { t: T_S2, i: T_S2 + 10 },
    { t: T_S3, i: T_S3 + 10 },
    { t: T_S4, i: T_S4 + 10 },
  ];

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut, overflow: "hidden" }}>

      {/* Dark CE background */}
      <AbsoluteFill style={{
        background: "linear-gradient(180deg, #020810 0%, #050A14 55%, #030D1A 100%)",
      }} />

      {/* Radial glow behind phone */}
      <div style={{
        position: "absolute",
        left: "50%", top: PHONE_T + PHONE_H / 2,
        transform: "translate(-50%, -50%)",
        width: 1080, height: 900,
        background: `radial-gradient(ellipse 540px 450px at center, rgba(10,191,188,0.13) 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Top accent bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 5,
        background: `linear-gradient(90deg, ${T.accent}, ${T.accent}44)`,
      }} />

      {/* Context label */}
      <div style={{
        position: "absolute", top: 210, left: 0, right: 0,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
        opacity: ctxO,
      }}>
        <div style={{
          fontSize: 22, fontWeight: 700, color: T.accent, fontFamily: T.sans,
          letterSpacing: "0.12em", textTransform: "uppercase" as const,
        }}>
          How Clinical Edge thinks
        </div>
        <div style={{
          width: 40, height: 2,
          background: `linear-gradient(90deg, transparent, ${T.accent}, transparent)`,
          borderRadius: 1,
        }} />
      </div>

      {/* ── Phone frame ── */}
      <div style={{
        position: "absolute",
        left: PHONE_L, top: PHONE_T,
        width: PHONE_W, height: PHONE_H,
        transform: `scale(${phoneSc}) translateY(${phoneRiseY + floatY}px) rotate(${tiltDeg}deg)`,
        transformOrigin: "center center",
        opacity: phoneO,
        willChange: "transform, opacity",
        borderRadius: 52,
        background: "#0D1520",
        border: `2.5px solid rgba(10,191,188,0.35)`,
        boxShadow: `
          0 60px 140px rgba(0,0,0,0.92),
          0 0 0 1px rgba(255,255,255,0.05),
          inset 0 0 0 1px rgba(10,191,188,0.10),
          0 0 120px rgba(10,191,188,0.12)
        `,
        overflow: "hidden",
      }}>

        {/* Status bar */}
        <div style={{
          height: 44, background: "rgba(11,31,42,0.97)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px", flexShrink: 0,
        }}>
          <span style={{ fontSize: 17, fontWeight: 600, color: "rgba(255,255,255,0.8)", fontFamily: T.sans }}>
            9:41
          </span>
          <div style={{ width: 18, height: 11, borderRadius: 3, border: "1.5px solid rgba(255,255,255,0.5)", position: "relative" }}>
            <div style={{ position: "absolute", left: 2, top: 2, bottom: 2, right: 4, background: "rgba(255,255,255,0.5)", borderRadius: 1 }} />
          </div>
        </div>

        {/* App header — matches real CE top bar */}
        <div style={{
          height: 72, background: "rgba(11,31,42,0.97)",
          borderBottom: `1px solid rgba(10,191,188,0.18)`,
          display: "flex", alignItems: "center", padding: "0 24px", gap: 14,
          opacity: headerO, flexShrink: 0,
        }}>
          <CELogo size={34} color={T.accent} />
          <span style={{
            fontSize: 30, fontWeight: 800, color: "#F8FBFC",
            fontFamily: T.sans, letterSpacing: "-0.03em",
          }}>
            Clinical Edge
          </span>
          <div style={{
            marginLeft: "auto",
            background: "rgba(10,191,188,0.12)",
            border: "1px solid rgba(10,191,188,0.35)",
            borderRadius: 100, padding: "5px 14px",
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.accent, fontFamily: T.sans, letterSpacing: "0.06em" }}>
              COPILOT
            </span>
          </div>
        </div>

        {/* ── Workspace — real CE warm background ── */}
        <div style={{
          flex: 1, background: CE_WARM_BG,
          overflow: "hidden", padding: "16px 18px",
          display: "flex", flexDirection: "column", gap: 10,
        }}>

          {/* User prompt card — real CE dark card (#1E2A3A) */}
          <div style={{
            transform: `translateY(${promptY}px)`,
            opacity: promptO,
            background: "#1E2A3A",
            borderRadius: 14,
            border: "1px solid rgba(240,237,230,0.08)",
            padding: "14px 18px",
          }}>
            <div style={{
              fontSize: 14, fontWeight: 700, color: T.accent,
              fontFamily: T.sans, letterSpacing: "0.07em",
              textTransform: "uppercase" as const, marginBottom: 7,
            }}>
              Clinical Reasoning Mode
            </div>
            <div style={{
              fontSize: 22, fontWeight: 400, color: "#F0EDE6",
              fontFamily: T.sans, lineHeight: 1.42, letterSpacing: "-0.01em",
            }}>
              {displayPrompt}
            </div>
          </div>

          {/* Urgency badge — matches real CE UrgencyBadge component */}
          <div style={{
            opacity: urgencyO,
            display: "inline-flex", alignItems: "center", alignSelf: "flex-start",
            gap: 8,
            background: urgencyBg,
            border: `1px solid ${urgencyBorder}`,
            borderRadius: 100, padding: "6px 16px",
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: urgencyDot }} />
            <span style={{
              fontSize: 17, fontWeight: 700, color: urgencyColor,
              fontFamily: T.sans, letterSpacing: "0.04em",
              textTransform: "uppercase" as const,
            }}>
              Urgency: {appUrgency}
            </span>
          </div>

          {/* CE section cards — real structure with left border + accent title */}
          {sections.slice(0, 4).map((section, si) => (
            <SectionCard
              key={si}
              frame={frame}
              fps={fps}
              titleStart={sectionStarts[si]?.t ?? T_S1 + si * 36}
              itemsStart={sectionStarts[si]?.i ?? T_S1 + si * 36 + 10}
              section={section}
            />
          ))}

          {/* Disclaimer — matches real CE trust cue */}
          <div style={{
            opacity: interpolate(Math.max(0, frame - T_S4 + 20), [0, 18], [0, 1], { extrapolateRight: "clamp" }),
            fontSize: 13, fontWeight: 400, color: "#8A9BAC",
            fontFamily: T.sans, lineHeight: 1.4,
            padding: "2px 2px", fontStyle: "italic",
          }}>
            Support tool only — always use your clinical judgment.
          </div>

        </div>
      </div>

    </AbsoluteFill>
  );
};
