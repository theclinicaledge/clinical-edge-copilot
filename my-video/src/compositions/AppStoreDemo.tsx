import React from "react";
import {
  AbsoluteFill,
  Sequence,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// ─────────────────────────────────────────────────────────────────────────────
// Clinical Edge Copilot — Product Demo Video
// Composition: CopilotAppStoreDemo
// 1080×1920  |  30fps  |  1350 frames (45.0s)
//
// TUNING GUIDE
// Each scene exposes a `startFrom` prop on <OffthreadVideo>.
// Open `npm start` (Remotion Studio), scrub through each scene, then
// adjust startFrom (in frames at 30fps) to hit the right moment in the clip.
// ─────────────────────────────────────────────────────────────────────────────

const TRANS = 15; // cross-fade overlap frames

// ── Palette ─────────────────────────────────────────────────────────────────
const TEAL    = "#00C2D1";
const NAVY    = "#0A1628";
const WHITE   = "#FFFFFF";
const MONO    = "'IBM Plex Mono', 'DM Mono', monospace";
const SANS    = "Syne, system-ui, sans-serif";
const BODY    = "'DM Sans', system-ui, sans-serif";

// ── Scene fade wrapper ────────────────────────────────────────────────────────
// Applies a smooth 15-frame opacity blend at entry and exit.
// hasIn/hasOut: disable for first / last scene respectively.
const useFade = (hasIn = true, hasOut = true) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fadeIn  = hasIn  ? interpolate(frame, [0, TRANS], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const fadeOut = hasOut ? interpolate(frame, [durationInFrames - TRANS, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  return Math.min(fadeIn, fadeOut);
};

// ── Slow Ken Burns zoom ────────────────────────────────────────────────────────
// Very subtle scale drift — makes static or talking-head footage feel alive.
const useKenBurns = (start = 1.0, end = 1.06) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return interpolate(frame, [0, durationInFrames], [start, end], { extrapolateRight: "clamp" });
};

// ── Lower-third overlay ───────────────────────────────────────────────────────
// Appears at localStart, holds, then fades out at localEnd.
const LowerThird: React.FC<{
  line1: string;
  line2?: string;
  localStart: number;
  localEnd: number;
  accentLine?: boolean;
}> = ({ line1, line2, localStart, localEnd, accentLine = true }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [localStart, localStart + 14, localEnd - 12, localEnd],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const slideY = interpolate(frame, [localStart, localStart + 18], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (frame < localStart || frame > localEnd) return null;

  return (
    <div style={{
      position: "absolute",
      bottom: 160,
      left: 56,
      right: 56,
      opacity,
      transform: `translateY(${slideY}px)`,
    }}>
      {accentLine && (
        <div style={{
          width: 44,
          height: 3,
          background: TEAL,
          borderRadius: 2,
          marginBottom: 12,
        }} />
      )}
      <div style={{
        background: "rgba(8, 18, 34, 0.84)",
        backdropFilter: "blur(12px)",
        borderRadius: 14,
        border: `1px solid rgba(0,194,209,0.22)`,
        borderLeft: `3px solid ${TEAL}`,
        padding: "18px 24px",
        display: "inline-block",
        maxWidth: "100%",
      }}>
        <div style={{
          fontSize: 30,
          fontWeight: 700,
          color: WHITE,
          fontFamily: SANS,
          lineHeight: 1.2,
          letterSpacing: "-0.01em",
        }}>
          {line1}
        </div>
        {line2 && (
          <div style={{
            fontSize: 22,
            fontWeight: 500,
            color: TEAL,
            fontFamily: MONO,
            letterSpacing: "0.06em",
            marginTop: 6,
            textTransform: "uppercase",
          }}>
            {line2}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Feature pill label ────────────────────────────────────────────────────────
// Small floating label — appears in upper-right area of screen during demo.
const FeaturePill: React.FC<{
  label: string;
  localStart: number;
  localEnd: number;
  yPos?: number;
}> = ({ label, localStart, localEnd, yPos = 140 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localF = Math.max(0, frame - localStart);
  const sp = spring({ frame: localF, fps, config: { damping: 20, stiffness: 160, mass: 0.9 } });
  const opacity = interpolate(frame, [localStart, localStart + 12, localEnd - 10, localEnd], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x = interpolate(sp, [0, 1], [18, 0]);

  if (frame < localStart || frame > localEnd) return null;

  return (
    <div style={{
      position: "absolute",
      top: yPos,
      left: 56,
      opacity,
      transform: `translateX(${x}px)`,
    }}>
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        background: "rgba(0, 194, 209, 0.14)",
        border: `1px solid rgba(0, 194, 209, 0.45)`,
        borderRadius: 100,
        padding: "8px 20px",
        backdropFilter: "blur(10px)",
      }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: TEAL }} />
        <span style={{
          fontSize: 20,
          fontWeight: 700,
          color: TEAL,
          fontFamily: MONO,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}>
          {label}
        </span>
      </div>
    </div>
  );
};

// ── Exit CTA overlay ─────────────────────────────────────────────────────────
const ExitCTA: React.FC<{ localStart: number }> = ({ localStart }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localF = Math.max(0, frame - localStart);
  const sp = spring({ frame: localF, fps, config: { damping: 22, stiffness: 130, mass: 1.05 } });
  const opacity = interpolate(localF, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(sp, [0, 1], [24, 0]);

  if (frame < localStart) return null;

  return (
    <div style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "50%",
      background: "linear-gradient(0deg, rgba(8,18,34,0.96) 40%, rgba(8,18,34,0.70) 72%, transparent 100%)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      alignItems: "center",
      paddingBottom: 100,
      paddingLeft: 56,
      paddingRight: 56,
      opacity,
      transform: `translateY(${y}px)`,
    }}>
      <div style={{
        fontSize: 52,
        fontWeight: 800,
        color: WHITE,
        fontFamily: SANS,
        letterSpacing: "-0.03em",
        textAlign: "center",
        lineHeight: 1.1,
        marginBottom: 14,
        textShadow: "0 2px 16px rgba(0,0,0,0.6)",
      }}>
        Clinical Edge Copilot
      </div>
      <div style={{
        fontSize: 26,
        fontWeight: 500,
        color: "rgba(255,255,255,0.72)",
        fontFamily: BODY,
        textAlign: "center",
        marginBottom: 22,
      }}>
        Download on the App Store
      </div>
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        background: "rgba(0,194,209,0.14)",
        border: `1px solid rgba(0,194,209,0.40)`,
        borderRadius: 100,
        padding: "9px 22px",
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: TEAL }} />
        <span style={{
          fontSize: 22,
          fontWeight: 700,
          color: TEAL,
          fontFamily: MONO,
          letterSpacing: "0.04em",
        }}>
          theclinicaledge.org
        </span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SCENE COMPONENTS
// Each scene is self-contained and handles its own fade-in/out.
// ─────────────────────────────────────────────────────────────────────────────

// Scene 1 — Hook (face to camera intro)
// hook.mp4: large file, likely 1–5 min of footage. Uses first 9s by default.
// TODO: adjust startFrom after watching in Studio (e.g. startFrom={90} to skip 3s)
const HookClipScene: React.FC = () => {
  const opacity = useFade(false, true); // no fade-in for first scene
  const zoom = useKenBurns(1.0, 1.04);

  return (
    <AbsoluteFill style={{ opacity, backgroundColor: NAVY }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}>
        <OffthreadVideo
          src={staticFile("assets/hook.mp4")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          startFrom={0}   // ← TODO: adjust after preview
        />
      </AbsoluteFill>
      <LowerThird
        line1="Built by a nurse, for nurses"
        line2="Clinical Edge Copilot"
        localStart={50}
        localEnd={220}
      />
    </AbsoluteFill>
  );
};

// Scene 2 — Transition ("Let me show you")
// transition.mp4: bridge clip. Uses first 3.5s by default.
// TODO: adjust startFrom to hit the right moment
const TransitionClipScene: React.FC = () => {
  const opacity = useFade(true, true);
  const zoom = useKenBurns(1.02, 1.05);

  return (
    <AbsoluteFill style={{ opacity, backgroundColor: NAVY }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}>
        <OffthreadVideo
          src={staticFile("assets/transition.mp4")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          startFrom={0}   // ← TODO: adjust after preview
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 3 — Phone close-up
// phone.mp4: phone in hand. Uses first 5s.
// TODO: adjust startFrom to frame the screen cleanly
const PhoneClipScene: React.FC = () => {
  const opacity = useFade(true, true);
  const zoom = useKenBurns(1.0, 1.04);

  return (
    <AbsoluteFill style={{ opacity, backgroundColor: NAVY }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "center 40%" }}>
        <OffthreadVideo
          src={staticFile("assets/phone.mp4")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          startFrom={0}   // ← TODO: adjust after preview
        />
      </AbsoluteFill>
      <FeaturePill
        label="Thinks with you"
        localStart={30}
        localEnd={130}
        yPos={150}
      />
    </AbsoluteFill>
  );
};

// Scene 4 — Screen demo (main app recording)
// screen.mp4: 6.85s — use the full clip
// Contains the main Copilot output. Let the response speak for itself.
const ScreenDemoScene: React.FC = () => {
  const opacity = useFade(true, true);

  return (
    <AbsoluteFill style={{ opacity, backgroundColor: NAVY }}>
      <OffthreadVideo
        src={staticFile("assets/screen.mp4")}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        startFrom={0}
      />
      {/* Section feature labels — match content timing to what's on screen */}
      <FeaturePill label="Real-time reasoning" localStart={20}  localEnd={100} yPos={140} />
      <FeaturePill label="What matters now"    localStart={110} localEnd={190} yPos={140} />
    </AbsoluteFill>
  );
};

// Scene 5 — Screen demo 2 (additional output)
// screen2.mp4: 11.15s total — use first 7s
const ScreenDemo2Scene: React.FC = () => {
  const opacity = useFade(true, true);

  return (
    <AbsoluteFill style={{ opacity, backgroundColor: NAVY }}>
      <OffthreadVideo
        src={staticFile("assets/screen2.mp4")}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        startFrom={0}
        // endAt={210} — implicitly capped by the Sequence's durationInFrames
      />
      <FeaturePill label="What to assess next"   localStart={20}  localEnd={100} yPos={140} />
      <FeaturePill label="What to do right now"  localStart={110} localEnd={190} yPos={140} />
    </AbsoluteFill>
  );
};

// Scene 6 — SBAR moment
// sbar.mp4: 9.52s — use the full clip
const SbarScene: React.FC = () => {
  const opacity = useFade(true, true);

  return (
    <AbsoluteFill style={{ opacity, backgroundColor: NAVY }}>
      <OffthreadVideo
        src={staticFile("assets/sbar.mp4")}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        startFrom={0}
      />
      <FeaturePill label="Instant SBAR" localStart={20} localEnd={240} yPos={140} />
      <LowerThird
        line1="Ready before you call"
        localStart={80}
        localEnd={255}
        accentLine={false}
      />
    </AbsoluteFill>
  );
};

// Scene 7 — Exit CTA
// exit.mp4: large file (likely face-to-camera outro). Uses first 7s.
// TODO: adjust startFrom to hit the CTA moment
const ExitScene: React.FC = () => {
  const opacity = useFade(true, false); // no fade-out for last scene
  const zoom = useKenBurns(1.02, 1.05);

  return (
    <AbsoluteFill style={{ opacity, backgroundColor: NAVY }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}>
        <OffthreadVideo
          src={staticFile("assets/exit.mp4")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          startFrom={0}   // ← TODO: adjust to CTA moment in clip
        />
      </AbsoluteFill>
      {/* CTA overlay fades in at local frame 90 (3s into exit clip) */}
      <ExitCTA localStart={90} />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPOSITION
// 1350 frames = 45.0 seconds  |  30fps  |  1080×1920
//
// Overlap windows (15f each):
//   S1↔S2:  255–270
//   S2↔S3:  345–360
//   S3↔S4:  480–495
//   S4↔S5:  672–687
//   S5↔S6:  867–882
//   S6↔S7: 1137–1152
// ─────────────────────────────────────────────────────────────────────────────
export const CopilotAppStoreDemoComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: NAVY }}>

      {/* S1 — Hook: 0–270 (9s) */}
      <Sequence from={0}    durationInFrames={270}>
        <HookClipScene />
      </Sequence>

      {/* S2 — Transition: 255–360 (3.5s) */}
      <Sequence from={255}  durationInFrames={105}>
        <TransitionClipScene />
      </Sequence>

      {/* S3 — Phone: 345–495 (5s) */}
      <Sequence from={345}  durationInFrames={150}>
        <PhoneClipScene />
      </Sequence>

      {/* S4 — Screen demo: 480–687 (6.9s — full screen.mp4) */}
      <Sequence from={480}  durationInFrames={207}>
        <ScreenDemoScene />
      </Sequence>

      {/* S5 — Screen demo 2: 672–882 (7s of screen2.mp4) */}
      <Sequence from={672}  durationInFrames={210}>
        <ScreenDemo2Scene />
      </Sequence>

      {/* S6 — SBAR: 867–1152 (9.5s — full sbar.mp4) */}
      <Sequence from={867}  durationInFrames={285}>
        <SbarScene />
      </Sequence>

      {/* S7 — Exit: 1137–1350 (7.1s) */}
      <Sequence from={1137} durationInFrames={213}>
        <ExitScene />
      </Sequence>

    </AbsoluteFill>
  );
};
