import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { HookScene }              from "./scenes/HookScene";
import { ScenarioBuildScene }     from "./scenes/ScenarioBuildScene";
import { WhatThisCouldBeScene }   from "./scenes/WhatThisCouldBeScene";
import { WhatConcernsMostScene }  from "./scenes/WhatConcernsMostScene";
import { AssessNextScene }        from "./scenes/AssessNextScene";
import { DoRightNowScene }        from "./scenes/DoRightNowScene";
import { OutroScene }             from "./scenes/OutroScene";

// Cross-fade transition system — 15-frame overlaps between every scene.
// Each scene gets +15f of hold vs previous version so transitions feel unhurried.
//
// Absolute frame ranges:
//   S1 Hook:           from=0,    dur=210   →  0–210
//   S2 Scenario:       from=195,  dur=255   →  195–450
//   S3 CouldBe (BLUE): from=435,  dur=225   →  435–660
//   S4 Concerns (RED): from=645,  dur=225   →  645–870
//   S5 Assess  (GRN):  from=855,  dur=225   →  855–1080
//   S6 DoNow   (YLW):  from=1065, dur=225   →  1065–1290
//   S7 Outro:          from=1275, dur=180   →  1275–1455
//
// Overlap windows (15f each):
//   S1↔S2:   195–210
//   S2↔S3:   435–450
//   S3↔S4:   645–660
//   S4↔S5:   855–870
//   S5↔S6:  1065–1080
//   S6↔S7:  1275–1290
//
// Total: 1455 frames = 48.5 seconds at 30fps

export const ChestPainComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0A1628" }}>

      <Sequence from={0}    durationInFrames={210}>
        <HookScene />
      </Sequence>

      <Sequence from={195}  durationInFrames={255}>
        <ScenarioBuildScene />
      </Sequence>

      <Sequence from={435}  durationInFrames={225}>
        <WhatThisCouldBeScene />
      </Sequence>

      <Sequence from={645}  durationInFrames={225}>
        <WhatConcernsMostScene />
      </Sequence>

      <Sequence from={855}  durationInFrames={225}>
        <AssessNextScene />
      </Sequence>

      <Sequence from={1065} durationInFrames={225}>
        <DoRightNowScene />
      </Sequence>

      <Sequence from={1275} durationInFrames={180}>
        <OutroScene />
      </Sequence>

    </AbsoluteFill>
  );
};
