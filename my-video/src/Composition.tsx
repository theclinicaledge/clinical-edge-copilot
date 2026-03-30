import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { HookScene } from "./scenes/HookScene";
import { ScenarioBuildScene } from "./scenes/ScenarioBuildScene";
import { ReasoningScene } from "./scenes/ReasoningScene";
import { PriorityActionsScene } from "./scenes/PriorityActionsScene";
import { OutroScene } from "./scenes/OutroScene";

// Scene timing (absolute frames)
// Scene 1 — HookScene:           0–96    (96 frames)
// Scene 2 — ScenarioBuildScene:  96–260  (164 frames)
// Scene 3 — ReasoningScene:      260–420 (160 frames)
// Scene 4 — PriorityActionsScene:420–560 (140 frames)
// Scene 5 — OutroScene:          560–660 (100 frames)
// TOTAL: 660 frames

export const ChestPainComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0A1628" }}>
      <Sequence from={0} durationInFrames={96}>
        <HookScene />
      </Sequence>

      <Sequence from={96} durationInFrames={164}>
        <ScenarioBuildScene />
      </Sequence>

      <Sequence from={260} durationInFrames={160}>
        <ReasoningScene />
      </Sequence>

      <Sequence from={420} durationInFrames={140}>
        <PriorityActionsScene />
      </Sequence>

      <Sequence from={560} durationInFrames={100}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
