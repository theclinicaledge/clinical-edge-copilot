import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { T } from "../../clinical-edge-video/tokens";
import { HookScene }         from "../components/HookScene";
import { StripScene }        from "../components/StripScene";
import { PatternScene }      from "../components/PatternScene";
import { RevealScene }       from "../components/RevealScene";
import { RhythmLabCTAScene } from "../components/RhythmLabCTAScene";

// ─── Scene timing @ 30fps — 690 frames = 23.0 seconds ────────────────────────
//
//   S1  HookScene:          0 – 90     3.0s  "Stop memorizing. Start recognizing."
//   S2  StripScene:        90 – 270    6.0s  Full Rhythm Lab Practice Mode screen
//   S3  PatternScene:     270 – 450    6.0s  App screen + callout annotations
//   S4  RevealScene:      450 – 570    4.0s  App post-reveal: Atrial Flutter answer
//   S5  RhythmLabCTAScene:570 – 690    4.0s  CTA: Rhythm Lab / App Store
//
// Total: 690 frames = 23.0 s

export const RhythmLabPatternVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: T.pageBg }}>

      <Sequence from={0}   durationInFrames={90}>
        <HookScene />
      </Sequence>

      <Sequence from={90}  durationInFrames={180}>
        <StripScene />
      </Sequence>

      <Sequence from={270} durationInFrames={180}>
        <PatternScene />
      </Sequence>

      <Sequence from={450} durationInFrames={120}>
        <RevealScene />
      </Sequence>

      <Sequence from={570} durationInFrames={120}>
        <RhythmLabCTAScene />
      </Sequence>

    </AbsoluteFill>
  );
};
