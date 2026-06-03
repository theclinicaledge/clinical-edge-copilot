import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { T } from "../tokens";
import { CELogo } from "./CELogo";
import { ClinicalScenario } from "../data/scenarios";

// ─── Loading bar indicator — matches App.jsx barPulse animation ───────────────
function LoadingBars({ frame }: { frame: number }) {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", height: 36 }}>
      {[0, 1, 2, 3, 4].map((i) => {
        // Each bar is offset in phase
        const phase = (frame * 0.10) + i * 0.55;
        const height = interpolate(Math.sin(phase), [-1, 1], [9, 30]);
        const opacity = interpolate(Math.sin(phase), [-1, 1], [0.35, 1.0]);
        return (
          <div key={i} style={{
            width: 5,
            height,
            borderRadius: 3,
            background: T.accent,
            opacity,
            flexShrink: 0,
          }} />
        );
      })}
    </div>
  );
}

// ─── Single output section card — exact App.jsx SectionCard style ─────────────
// Scaled up for video readability
function SectionCard({
  title,
  content,
  accent,
  opacity = 1,
}: {
  title: string;
  content: string;
  accent: string;
  opacity?: number;
}) {
  return (
    <div style={{
      // App.jsx: background:#FFFFFF, border:1px solid #D6D0C4, borderLeft:3px solid accent
      background: T.lightCard,
      border: `1px solid ${T.lightCardBorder}`,
      borderLeft: `4px solid ${accent}`,
      borderRadius: 8,
      padding: "22px 26px",
      marginBottom: 14,
      opacity,
    }}>
      {/* Label — App.jsx: 10px IBM Plex Mono 700 uppercase 1.5px letter-spacing */}
      <div style={{
        fontSize: 20,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "1.5px",
        color: accent,
        marginBottom: 12,
        fontFamily: T.mono,
        opacity: 0.88,
      }}>
        {title}
      </div>
      {/* Content — App.jsx: 14px, color #1E2A3A */}
      <div style={{
        fontSize: 30,
        lineHeight: 1.62,
        color: T.lightCardText,
        fontFamily: T.sans,
        fontWeight: 400,
      }}>
        {content}
      </div>
    </div>
  );
}

// ─── Urgency badge — App.jsx UrgencyBadge style, scaled ──────────────────────
function UrgencyBadge({ level, opacity = 1 }: { level: string; opacity?: number }) {
  // Using HIGH colors from App.jsx URGENCY_STYLES
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      background: T.urgHighBg,
      border: `1px solid ${T.urgHighBorder}`,
      borderRadius: 6,
      padding: "12px 18px",
      marginBottom: 18,
      opacity,
    }}>
      <div style={{
        width: 9, height: 9, borderRadius: "50%",
        background: T.urgHighText,
        flexShrink: 0,
      }} />
      <span style={{
        fontSize: 22,
        fontWeight: 700,
        color: T.urgHighText,
        fontFamily: T.mono,
        letterSpacing: "1.2px",
        textTransform: "uppercase",
      }}>
        Urgency: HIGH
      </span>
    </div>
  );
}

// ─── Main scene ───────────────────────────────────────────────────────────────

interface Props {
  scenario: ClinicalScenario;
}

// Timeline within this 210-frame (7s) scene:
// 0–18f:   panel slides/fades in
// 18–55f:  header + input visible, prompt text "typed in"
// 55–90f:  loading bars
// 90–210f: urgency badge + section cards appear one by one

export const CopilotDemoScene: React.FC<Props> = ({ scenario }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Panel slides up from bottom
  const panelY = interpolate(frame, [0, 22], [40, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Prompt "typing" — the text reveals character by character
  const promptReveal = interpolate(frame, [22, 58], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const promptChars = Math.floor(promptReveal * scenario.copilotPrompt.length);
  const promptText = scenario.copilotPrompt.slice(0, promptChars);
  const showCursor = frame >= 22 && frame < 65;

  // Submit button pressed at frame 58
  const submitPressed = frame >= 58;

  // Loading bars: frames 62–95
  const showLoading = frame >= 62 && frame < 95;
  const loadingOpacity = interpolate(frame, [62, 70], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  }) * interpolate(frame, [88, 95], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // "Interpreting bedside concern..." text under bars
  const phaseOpacity = loadingOpacity;

  // Urgency badge: frame 96
  const urgOpacity = interpolate(frame, [96, 112], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Section cards staggered
  const card1Opacity = interpolate(frame, [112, 128], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const card2Opacity = interpolate(frame, [142, 158], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Input card border color — teal when focused/active
  const inputBorderColor = submitPressed
    ? T.darkCardBorder2
    : T.accentFocus;

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut, backgroundColor: T.pageBg }}>

      {/* ── Full-frame app panel ── */}
      <div style={{
        position: "absolute",
        inset: 0,
        transform: `translateY(${panelY}px)`,
        display: "flex",
        flexDirection: "column",
      }}>

        {/* ── App header — matches App.jsx sticky header ── */}
        {/* background: rgba(11,31,42,0.97), borderBottom: 1px solid rgba(255,255,255,0.05) */}
        <div style={{
          background: T.headerBg,
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          padding: "28px 48px 20px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexShrink: 0,
        }}>
          <CELogo size={38} />
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{
              fontSize: 26,
              fontWeight: 700,
              color: T.textPrimary,
              fontFamily: T.sans,
              letterSpacing: "-0.3px",
              lineHeight: 1,
            }}>
              Clinical Edge
            </span>
            <span style={{
              fontSize: 16,
              fontWeight: 500,
              color: T.textMuted,
              fontFamily: T.mono,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              lineHeight: 1,
            }}>
              Copilot
            </span>
          </div>
        </div>

        {/* ── Warm workspace — matches App.jsx "background: #E7E1D6" ── */}
        <div style={{
          flex: 1,
          background: T.workspaceBg,
          overflowY: "hidden",
          padding: "40px 48px",
          display: "flex",
          flexDirection: "column",
        }}>

          {/* Hero text — from App.jsx: "Clinical reasoning support. Built for nurses." */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{
              fontFamily: T.sans,
              fontWeight: 800,
              fontSize: 52,
              color: "#111827",
              margin: "0 0 12px",
              lineHeight: 1.08,
              letterSpacing: "-0.04em",
            }}>
              Clinical reasoning support.<br />Built for nurses.
            </h1>
            <p style={{
              fontSize: 26,
              color: T.textSubtle,
              margin: 0,
              lineHeight: 1.4,
              fontWeight: 500,
              fontFamily: T.sans,
            }}>
              When something feels off. Before you call.
            </p>
          </div>

          {/* ── Input card — matches App.jsx input-card ── */}
          {/* background: #1E2A3A, border: 1px solid #0ABFBC (focused) */}
          <div style={{
            background: T.darkCard,
            border: `1px solid ${inputBorderColor}`,
            borderRadius: 8,
            padding: "26px",
            marginBottom: 18,
            boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
            flexShrink: 0,
          }}>
            {/* Textarea area */}
            <div style={{
              minHeight: 88,
              color: T.textInput,
              fontSize: 26,
              lineHeight: 1.65,
              fontFamily: T.sans,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              marginBottom: 16,
            }}>
              {promptText || (
                <span style={{ color: "#94A3B8" }}>
                  What are you thinking through right now?
                </span>
              )}
              {/* Blinking cursor */}
              {showCursor && (
                <span style={{
                  display: "inline-block",
                  width: 3,
                  height: 28,
                  background: T.accent,
                  marginLeft: 2,
                  verticalAlign: "middle",
                  opacity: Math.sin(frame * 0.20) > 0 ? 0.8 : 0,
                  borderRadius: 1,
                }} />
              )}
            </div>

            {/* Divider + submit row */}
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              paddingTop: 14,
              borderTop: "1px solid rgba(240,237,230,0.09)",
            }}>
              {/* Ask Copilot button — App.jsx: background #0ABFBC, color #0B1F2A */}
              <div style={{
                background: submitPressed ? "rgba(10,191,188,0.08)" : T.accent,
                color: submitPressed ? "#94A3B8" : "#0B1F2A",
                border: "none",
                borderRadius: 8,
                padding: "14px 32px",
                fontSize: 22,
                fontWeight: 700,
                fontFamily: T.sans,
                letterSpacing: "-0.1px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                boxShadow: submitPressed ? "none" : "0 4px 16px rgba(10,191,188,0.25)",
              }}>
                {submitPressed
                  ? <><span style={{ width: 18, height: 18, border: "2.5px solid rgba(10,191,188,0.28)", borderTopColor: T.accent, borderRadius: "50%", display: "inline-block", animation: undefined }} />Analyzing...</>
                  : "Ask Copilot"
                }
              </div>
            </div>
          </div>

          {/* ── Loading indicator ── */}
          {showLoading && (
            <div style={{
              opacity: loadingOpacity,
              padding: "8px 0 16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 14,
            }}>
              <LoadingBars frame={frame} />
              <div style={{
                fontSize: 20,
                color: "#5A7A8A",
                fontFamily: T.mono,
                letterSpacing: "0.3px",
                opacity: phaseOpacity,
              }}>
                Interpreting bedside concern...
              </div>
            </div>
          )}

          {/* ── Output — urgency badge + section cards ── */}
          {frame >= 96 && (
            <div style={{ flex: 1, overflowY: "hidden" }}>

              {/* Trust cue line — App.jsx */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                paddingBottom: 16,
                fontSize: 18,
                color: "#4A6675",
                fontFamily: T.mono,
                borderBottom: "1px solid rgba(0,0,0,0.07)",
                marginBottom: 16,
                opacity: urgOpacity,
              }}>
                <span style={{ color: "#3A5A6A", fontSize: 14 }}>◆</span>
                <span>Structured clinical reasoning — confirm with your assessment</span>
              </div>

              <UrgencyBadge level="HIGH" opacity={urgOpacity} />

              <SectionCard
                title="Possible concerns"
                content={scenario.concern}
                accent={T.sectionRed}
                opacity={card1Opacity}
              />

              <SectionCard
                title="What to assess next"
                content={scenario.assess}
                accent={T.sectionGreen}
                opacity={card2Opacity}
              />

            </div>
          )}

        </div>
      </div>
    </AbsoluteFill>
  );
};
