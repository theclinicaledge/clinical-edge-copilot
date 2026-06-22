import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { T } from "../clinical-edge-video/tokens";
import { completeHeartBlockData } from "./data";
import { HookScene }     from "./scenes/HookScene";
import { ECGScene }      from "./scenes/ECGScene";
import { AnatomyScene }  from "./scenes/AnatomyScene";
import { NursingScene }  from "./scenes/NursingScene";
import { CHBCTAScene }   from "./scenes/CTAScene";

// ─── Scene timing @ 30fps ─────────────────────────────────────────────────────
//
//   S1  HookScene:      0  –  90    3.0s   "This rhythm is a medical emergency."
//   S2  ECGScene:      90  – 330    8.0s   Animated CHB ECG strip + callouts
//   S3  AnatomyScene: 330  – 510    6.0s   SA → AV block → escape rhythm
//   S4  NursingScene: 510  – 660    5.0s   Priority nursing actions
//   S5  CTAScene:     660  – 750    3.0s   Follow + branding
//
// Total: 750 frames = 25.0 seconds at 30fps

export const CompleteHeartBlockVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: T.pageBg }}>

      <Sequence from={0}   durationInFrames={90}>
        <HookScene
          hookLine={completeHeartBlockData.hookLine}
          hookSub={completeHeartBlockData.hookSub}
        />
      </Sequence>

      <Sequence from={90}  durationInFrames={240}>
        <ECGScene />
      </Sequence>

      <Sequence from={330} durationInFrames={180}>
        <AnatomyScene />
      </Sequence>

      <Sequence from={510} durationInFrames={150}>
        <NursingScene />
      </Sequence>

      <Sequence from={660} durationInFrames={90}>
        <CHBCTAScene />
      </Sequence>

    </AbsoluteFill>
  );
};
