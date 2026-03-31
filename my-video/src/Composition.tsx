import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { HookScene } from "./scenes/HookScene";
import { ScenarioBuildScene } from "./scenes/ScenarioBuildScene";
import { ReasoningScene } from "./scenes/ReasoningScene";
import { PriorityActionsScene } from "./scenes/PriorityActionsScene";
import { OutroScene } from "./scenes/OutroScene";

// Cross-fade transition system — 15-frame overlaps between every scene
// Each scene handles its own fade-in/out internally via useVideoConfig().durationInFrames
//
// Absolute frame ranges:
//   S1 Hook:       from=0,   dur=195   → 0–195   (content 0–180 + 15f fade-out tail)
//   S2 Scenario:   from=180, dur=255   → 180–435 (15f overlap in + content + 15f out)
//   S3 Reasoning:  from=420, dur=255   → 420–675 (15f overlap in + content + 15f out)
//   S4 Priority:   from=660, dur=225   → 660–885 (15f overlap in + content + 15f out)
//   S5 Outro:      from=870, dur=180   → 870–1050(15f overlap in + content, no out)
//
// Overlapping windows:
//   S1↔S2: frames 180–195
//   S2↔S3: frames 420–435
//   S3↔S4: frames 660–675
//   S4↔S5: frames 870–885
//
// Total: 1050 frames = 35.0 seconds at 30fps

export const ChestPainComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0A1628" }}>
      <Sequence from={0} durationInFrames={195}>
        <HookScene />
      </Sequence>

      <Sequence from={180} durationInFrames={255}>
        <ScenarioBuildScene />
      </Sequence>

      <Sequence from={420} durationInFrames={255}>
        <ReasoningScene />
      </Sequence>

      <Sequence from={660} durationInFrames={225}>
        <PriorityActionsScene />
      </Sequence>

      <Sequence from={870} durationInFrames={180}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
