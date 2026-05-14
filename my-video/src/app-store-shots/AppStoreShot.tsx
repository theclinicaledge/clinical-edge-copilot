import React from "react";
import { AbsoluteFill } from "remotion";
import { MockHomeInput }       from "./screens/MockHomeInput";
import { MockUrgencyHigh }     from "./screens/MockUrgencyHigh";
import { MockResponseActions } from "./screens/MockResponseActions";
import { MockQuickQuestions }  from "./screens/MockQuickQuestions";
import { MockSbar }            from "./screens/MockSbar";

// ─── Screen components indexed by slide ───────────────────────────────────────
const SCREENS = [
  MockHomeInput,        // 0 — home input
  MockUrgencyHigh,      // 1 — urgency + what this could be
  MockResponseActions,  // 2 — assessments + possible causes
  MockQuickQuestions,   // 3 — nursing actions + notify/escalate + action bar
  MockSbar,             // 4 — SBAR handoff
];

// ─── Main component ────────────────────────────────────────────────────────────
// Pure screenshot — no marketing overlay.
// Each Screen component owns its own header (with status bar) and content.
// The warm beige background fills any space below the screen content.
export const AppStoreShot: React.FC<{ slideIndex: number }> = ({ slideIndex }) => {
  const Screen = SCREENS[slideIndex] ?? SCREENS[0];

  return (
    <AbsoluteFill style={{ background: "#E8E2D8", overflow: "hidden" }}>
      <Screen />
    </AbsoluteFill>
  );
};
