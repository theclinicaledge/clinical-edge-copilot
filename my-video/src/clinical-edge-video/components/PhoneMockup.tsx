import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { T } from "../styles/tokens";

interface PhoneMockupProps {
  prompt: string;
  typingProgress?: number; // 0-1, how far the "reasoning" animation is
  style?: React.CSSProperties;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  prompt,
  typingProgress = 0,
  style,
}) => {
  const frame = useCurrentFrame();

  // Subtle rocking animation
  const tilt = interpolate(Math.sin(frame * 0.025), [-1, 1], [-0.8, 0.8]);

  // Dot blinking animation for "reasoning"
  const dot1 = interpolate(Math.sin(frame * 0.18), [-1, 1], [0.25, 1.0]);
  const dot2 = interpolate(Math.sin(frame * 0.18 + 1.05), [-1, 1], [0.25, 1.0]);
  const dot3 = interpolate(Math.sin(frame * 0.18 + 2.1), [-1, 1], [0.25, 1.0]);

  const showResponse = typingProgress > 0.55;
  const responseOpacity = interpolate(typingProgress, [0.55, 0.75], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{
      transform: `rotate(${tilt}deg)`,
      ...style,
    }}>
      {/* Phone shell */}
      <div style={{
        width: 320,
        height: 620,
        background: "linear-gradient(160deg, #0f1f32 0%, #0a1522 100%)",
        borderRadius: 40,
        border: "1.5px solid rgba(0,194,209,0.25)",
        boxShadow: `
          0 40px 80px rgba(0,0,0,0.7),
          0 0 0 1px rgba(255,255,255,0.04),
          inset 0 1px 0 rgba(255,255,255,0.07),
          0 0 60px rgba(0,194,209,0.12)
        `,
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
      }}>
        {/* Notch */}
        <div style={{
          position: "absolute",
          top: 14,
          left: "50%",
          transform: "translateX(-50%)",
          width: 90,
          height: 24,
          background: "#060d1a",
          borderRadius: 12,
          zIndex: 10,
        }} />

        {/* Screen content */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, #0b1f2a 0%, #0a1724 100%)",
          display: "flex",
          flexDirection: "column",
          paddingTop: 52,
        }}>
          {/* App header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 20px 10px",
            borderBottom: "1px solid rgba(0,194,209,0.12)",
          }}>
            <span style={{
              fontSize: 15,
              fontWeight: 700,
              color: T.textPrimary,
              fontFamily: T.sans,
              letterSpacing: "-0.01em",
            }}>
              Clinical Edge
            </span>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}>
              <div style={{
                width: 7, height: 7,
                borderRadius: "50%",
                backgroundColor: T.teal,
                boxShadow: `0 0 8px ${T.teal}`,
              }} />
              <span style={{
                fontSize: 10,
                color: T.teal,
                fontFamily: T.mono,
                letterSpacing: "0.08em",
              }}>
                AI Ready
              </span>
            </div>
          </div>

          {/* Chat area */}
          <div style={{
            flex: 1,
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            overflowY: "hidden",
          }}>
            {/* User prompt bubble */}
            <div style={{
              background: "rgba(0,194,209,0.12)",
              border: "1px solid rgba(0,194,209,0.22)",
              borderRadius: "14px 14px 4px 14px",
              padding: "12px 14px",
              alignSelf: "flex-end",
              maxWidth: "90%",
            }}>
              <span style={{
                fontSize: 11.5,
                color: T.textBody,
                fontFamily: T.body,
                lineHeight: 1.5,
              }}>
                {prompt.length > 110 ? prompt.slice(0, 110) + "…" : prompt}
              </span>
            </div>

            {/* Reasoning indicator or response */}
            {!showResponse ? (
              <div style={{
                background: "rgba(13,32,64,0.7)",
                border: "1px solid rgba(0,194,209,0.14)",
                borderRadius: "14px 14px 14px 4px",
                padding: "14px 16px",
                alignSelf: "flex-start",
                maxWidth: "80%",
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}>
                  <span style={{
                    fontSize: 10,
                    color: T.teal,
                    fontFamily: T.mono,
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                  }}>
                    Reasoning
                  </span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[dot1, dot2, dot3].map((d, i) => (
                      <div key={i} style={{
                        width: 5, height: 5,
                        borderRadius: "50%",
                        backgroundColor: T.teal,
                        opacity: d,
                      }} />
                    ))}
                  </div>
                </div>
                {/* Progress bar */}
                <div style={{
                  width: 140,
                  height: 3,
                  background: "rgba(0,194,209,0.12)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${typingProgress * 100}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${T.teal}, #00e5f2)`,
                    borderRadius: 2,
                    boxShadow: `0 0 8px ${T.teal}`,
                    transition: "width 0.1s linear",
                  }} />
                </div>
              </div>
            ) : (
              <div style={{
                opacity: responseOpacity,
                background: "rgba(13,32,64,0.7)",
                border: "1px solid rgba(0,194,209,0.14)",
                borderRadius: "14px 14px 14px 4px",
                padding: "14px 16px",
                alignSelf: "flex-start",
                maxWidth: "92%",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}>
                  <div style={{
                    width: 7, height: 7,
                    borderRadius: "50%",
                    backgroundColor: "#fc5c5c",
                    boxShadow: "0 0 8px rgba(252,92,92,0.6)",
                  }} />
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#fca5a5",
                    fontFamily: T.mono,
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                  }}>
                    High Urgency
                  </span>
                </div>
                <span style={{
                  fontSize: 11,
                  color: T.textBody,
                  fontFamily: T.body,
                  lineHeight: 1.5,
                }}>
                  Possible sepsis with shock. Assess mentation and perfusion first.
                </span>
              </div>
            )}
          </div>

          {/* Bottom input area */}
          <div style={{
            padding: "10px 16px 16px",
            borderTop: "1px solid rgba(0,194,209,0.08)",
          }}>
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(0,194,209,0.14)",
              borderRadius: 20,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span style={{
                fontSize: 11,
                color: T.textDimmer,
                fontFamily: T.body,
              }}>
                Describe your clinical scenario…
              </span>
              <div style={{
                width: 24, height: 24,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${T.teal}, #0096a8)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <span style={{ color: "#fff", fontSize: 12, lineHeight: 1 }}>↑</span>
              </div>
            </div>
          </div>
        </div>

        {/* Screen edge shine */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 40%)",
          pointerEvents: "none",
          borderRadius: 40,
        }} />
      </div>
    </div>
  );
};
