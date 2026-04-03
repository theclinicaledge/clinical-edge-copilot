import React, { useMemo } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { GlowBackground } from "../components/GlowBackground";
import { ParticleField }  from "../components/ParticleField";
import { ScenarioData }   from "../compositions/CopilotVideo";
import { T } from "../tokens";

const TRANS = 15;
// Typing: starts at frame 28 (after fade-in settles), ~2.4f per char
const TYPE_START = 28;
const TYPE_FPS   = 2.4; // frames per character

interface Props { scenario: ScenarioData; }

export const CopilotInputScene: React.FC<Props> = ({ scenario }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const text = scenario.inputText;

  const typeEnd = useMemo(() => TYPE_START + Math.ceil(text.length * TYPE_FPS), [text]);
  const submitFrame = typeEnd + 18; // pause after typing

  // Transition in / out
  const fadeIn  = interpolate(frame, [0, TRANS], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - TRANS, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const blurIn  = interpolate(frame, [0, TRANS], [7, 0], { extrapolateRight: "clamp" });
  const blurOut = interpolate(frame, [durationInFrames - TRANS, durationInFrames], [0, 7], {
    extrapolateLeft: "clamp",
  });
  const sceneOpacity = Math.min(fadeIn, fadeOut);
  const sceneBlur    = frame < TRANS ? blurIn : frame > durationInFrames - TRANS ? blurOut : 0;

  const cameraPush = interpolate(frame, [0, durationInFrames], [1.0, 1.018], { extrapolateRight: "clamp" });

  // Typed text
  const charsVisible = Math.floor(
    interpolate(frame, [TYPE_START, typeEnd], [0, text.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  );
  const typedText = text.slice(0, charsVisible);

  // Cursor blink
  const isTyping    = frame >= TYPE_START && frame < typeEnd;
  const cursorBlink = Math.floor(frame * 1.6) % 2 === 0;
  const showCursor  = isTyping || (frame < submitFrame && cursorBlink);

  // Submit button state
  const isSubmitted = frame >= submitFrame;
  const submitFlash = interpolate(frame, [submitFrame, submitFrame + 8, submitFrame + 22], [0, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Analyze text appears after submit
  const analyzeOpacity = interpolate(frame, [submitFrame + 10, submitFrame + 24], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Card spring entry
  const cardSpring = spring({ frame: Math.max(0, frame - 6), fps, config: { damping: 18, stiffness: 120, mass: 1.0 } });
  const cardY  = interpolate(cardSpring, [0, 1], [48, 0]);
  const cardOp = interpolate(cardSpring, [0, 1], [0, 1]);

  // Chips (the "You'll get:" strip)
  const chips = ["What this could be", "What matters most", "Assess next", "Do right now"];

  return (
    <AbsoluteFill style={{
      opacity: sceneOpacity,
      filter: sceneBlur > 0 ? `blur(${sceneBlur}px)` : undefined,
    }}>
      {/* BG */}
      <AbsoluteFill style={{ transform: `scale(${cameraPush})`, transformOrigin: "center center" }}>
        <GlowBackground intensity={0.9} />
        <ParticleField count={24} slowFactor={0.22} dimFactor={0.35} />
      </AbsoluteFill>

      {/* Vignette */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse 85% 90% at 50% 46%, transparent 20%, rgba(5,12,24,0.38) 58%, rgba(3,7,15,0.82) 100%)",
        pointerEvents: "none",
      }} />

      {/* Content — vertically centered */}
      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "stretch",
        paddingLeft: 54,
        paddingRight: 54,
      }}>
        {/* Header label */}
        <div style={{
          fontSize: 22,
          fontWeight: 700,
          color: T.teal,
          fontFamily: T.mono,
          letterSpacing: "0.20em",
          textAlign: "center",
          marginBottom: 48,
          opacity: 0.80,
          transform: `translateY(${cardY}px)`,
        }}>
          CLINICAL COPILOT
        </div>

        {/* Card wrapper */}
        <div style={{
          transform: `translateY(${cardY}px)`,
          opacity: cardOp,
        }}>
          {/* Preview chips strip */}
          <div style={{
            background: "rgba(17,41,54,0.52)",
            border: `1px solid ${T.borderCard}`,
            borderBottom: "none",
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            padding: "18px 28px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
          }}>
            <span style={{
              fontSize: 24,
              color: T.textHint,
              fontFamily: T.mono,
              flexShrink: 0,
            }}>
              You'll get:
            </span>
            {chips.map((chip) => (
              <span key={chip} style={{
                fontSize: 22,
                color: "rgba(181,239,244,0.65)",
                background: "rgba(0,194,209,0.05)",
                border: "1px solid rgba(0,194,209,0.13)",
                borderRadius: 8,
                padding: "4px 14px",
                fontFamily: T.body,
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}>
                {chip}
              </span>
            ))}
          </div>

          {/* Input card */}
          <div style={{
            background: T.bgCard,
            border: `1px solid ${T.borderCard}`,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
            padding: "36px 36px 28px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.03)",
          }}>
            {/* Textarea area */}
            <div style={{
              minHeight: 120,
              fontSize: 32,
              lineHeight: 1.65,
              color: T.textPrimary,
              fontFamily: T.body,
              fontWeight: 400,
              letterSpacing: "-0.01em",
              wordBreak: "break-word",
            }}>
              {typedText}
              {showCursor && (
                <span style={{
                  display: "inline-block",
                  width: 2,
                  height: "1.1em",
                  backgroundColor: T.teal,
                  verticalAlign: "text-bottom",
                  marginLeft: 2,
                  opacity: 0.9,
                }} />
              )}
            </div>

            {/* Divider + bottom row */}
            <div style={{
              marginTop: 24,
              paddingTop: 20,
              borderTop: `1px solid ${T.borderDivider}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span style={{
                fontSize: 24,
                color: T.textHint,
                fontFamily: T.mono,
              }}>
                ⌘ + Enter
              </span>

              {/* Submit / Analyzing button */}
              <div style={{
                background: isSubmitted
                  ? `rgba(0,194,209,${0.08 + submitFlash * 0.12})`
                  : (charsVisible > 0 ? T.teal : "rgba(0,194,209,0.08)"),
                color: isSubmitted ? T.teal : (charsVisible > 0 ? T.bgApp : T.textHint),
                borderRadius: 16,
                padding: "18px 44px",
                fontSize: 28,
                fontWeight: 700,
                fontFamily: T.body,
                letterSpacing: "-0.01em",
                boxShadow: (!isSubmitted && charsVisible > 0)
                  ? "0 4px 18px rgba(0,194,209,0.28)"
                  : "none",
                transition: "all 0.18s",
                whiteSpace: "nowrap",
              }}>
                {isSubmitted
                  ? <span style={{ opacity: analyzeOpacity }}>Analyzing...</span>
                  : "Analyze"}
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
