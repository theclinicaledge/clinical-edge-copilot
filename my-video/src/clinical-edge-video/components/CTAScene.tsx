import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { T } from "../tokens";
import { CELogo } from "./CELogo";

const SPRING = { damping: 16, stiffness: 108, mass: 1.08 };

// ─── App Store CTA — plain text only, no badge ────────────────────────────────
// Spec: "Download on the App Store" — use plain text, no distorted badge
// Replace with official SVG from developer.apple.com when available

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Logo + wordmark
  const brandFrame = Math.max(0, frame - 4);
  const brandSpring = spring({ frame: brandFrame, fps, config: SPRING });
  const brandY = interpolate(brandSpring, [0, 1], [32, 0]);
  const brandOpacity = interpolate(brandFrame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Divider line
  const dividerOpacity = interpolate(frame, [32, 46], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Module list
  const modFrame = Math.max(0, frame - 38);
  const modSpring = spring({ frame: modFrame, fps, config: SPRING });
  const modY = interpolate(modSpring, [0, 1], [22, 0]);
  const modOpacity = interpolate(modFrame, [0, 16], [0, 1], {
    extrapolateRight: "clamp",
  });

  // CTA line
  const ctaFrame = Math.max(0, frame - 56);
  const ctaSpring = spring({ frame: ctaFrame, fps, config: SPRING });
  const ctaScale = interpolate(ctaSpring, [0, 1], [0.90, 1.0]);
  const ctaOpacity = interpolate(ctaFrame, [0, 16], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Teal glow pulse
  const glowPulse = interpolate(Math.sin(frame * 0.05), [-1, 1], [0.5, 1.0]);
  const glow = interpolate(Math.sin(frame * 0.028), [-1, 1], [0.05, 0.13]);

  // Grid
  const gridOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fadeIn, backgroundColor: T.pageBg }}>

      {/* Subtle grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(10,191,188,0.022) 1px, transparent 1px),
          linear-gradient(90deg, rgba(10,191,188,0.022) 1px, transparent 1px)
        `,
        backgroundSize: "88px 88px",
        opacity: gridOpacity,
        pointerEvents: "none",
      }} />

      {/* Center glow */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        width: 900, height: 900, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(10,191,188,${glow.toFixed(3)}) 0%, transparent 55%)`,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }} />

      {/* Bottom fade */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 300,
        background: `linear-gradient(0deg, ${T.pageBg} 0%, transparent 100%)`,
        pointerEvents: "none",
      }} />

      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
      }}>

        {/* ── Brand lockup ── */}
        <div style={{
          transform: `translateY(${brandY}px)`,
          opacity: brandOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 32,
          willChange: "transform, opacity",
        }}>
          {/* Logo + name row */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            marginBottom: 20,
          }}>
            <CELogo size={72} />
            <span style={{
              fontSize: 72,
              fontWeight: 800,
              color: T.textPrimary,
              fontFamily: T.sans,
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}>
              Clinical Edge
            </span>
          </div>
        </div>

        {/* ── Teal divider ── */}
        <div style={{
          width: 96,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${T.accent}, transparent)`,
          borderRadius: 1,
          marginBottom: 36,
          opacity: dividerOpacity,
        }} />

        {/* ── Module list ── */}
        <div style={{
          transform: `translateY(${modY}px)`,
          opacity: modOpacity,
          textAlign: "center",
          marginBottom: 72,
          willChange: "transform, opacity",
        }}>
          <span style={{
            fontSize: 38,
            fontWeight: 500,
            color: T.textMuted,
            fontFamily: T.mono,
            letterSpacing: "0.06em",
          }}>
            Copilot · Rhythm Lab · ICU Drips
          </span>
        </div>

        {/* ── App Store CTA — plain text, no badge ── */}
        {/* Official App Store badge: developer.apple.com/app-store/marketing/guidelines/ */}
        <div style={{
          transform: `scale(${ctaScale})`,
          opacity: ctaOpacity,
          willChange: "transform, opacity",
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}>
            {/* Download line */}
            <span style={{
              fontSize: 34,
              fontWeight: 500,
              color: T.textSecondary,
              fontFamily: T.sans,
              letterSpacing: "-0.01em",
            }}>
              Download on the
            </span>
            {/* App Store — large, clean */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              background: T.darkCard,
              border: `1.5px solid rgba(10,191,188,${(0.40 * glowPulse).toFixed(3)})`,
              borderRadius: 18,
              padding: "22px 52px",
              boxShadow: `0 0 ${(50 * glowPulse).toFixed(0)}px rgba(10,191,188,0.12)`,
            }}>
              {/* Apple logo — minimal SVG, no external image */}
              <svg width="40" height="48" viewBox="0 0 814 1000" fill={T.textPrimary}>
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 376.7 0 264 0 216.3 0 107.7 52.8 51 98.6 24.5c41.8-24.4 85.7-39.5 128.6-39.5 75.4 0 120.3 41.9 181.8 41.9 60.3 0 113.6-43.1 190.6-43.1 74.4 0 120.9 33.3 148.4 54.9zM490.1 15.6C527.3 7.2 565.2 0 602.4 0c-5.8 58.6-29 107.1-62.8 142.3-31.2 32.1-71.9 49.1-110.7 49.1-3.2-46.8 12.9-95.9 61.2-135.8z" />
              </svg>
              <span style={{
                fontSize: 52,
                fontWeight: 700,
                color: T.textPrimary,
                fontFamily: T.sans,
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}>
                App Store
              </span>
            </div>
          </div>
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
