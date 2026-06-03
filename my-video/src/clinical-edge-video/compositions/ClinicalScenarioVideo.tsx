import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { T } from "../styles/tokens";
import { ClinicalScenario } from "../data/scenarios";
import { HookScene } from "../components/HookScene";
import { PatientSnapshotScene } from "../components/PatientSnapshotScene";
import { CopilotReasoningScene } from "../components/CopilotReasoningScene";
import { InsightCardsScene } from "../components/InsightCardsScene";
import { CTAScene } from "../components/CTAScene";

// Scene timing @ 30fps
// S1 HookScene:             0 –  90  (3s)
// S2 PatientSnapshotScene: 75 – 165  (3s, 15f overlap)
// S3 CopilotReasoningScene:150 – 330  (6s, 15f overlap)
// S4 InsightCardsScene:    315 – 495  (6s, 15f overlap)
// S5 CTAScene:             480 – 630  (5s, 15f overlap)
// Total: 630 frames = 21s

interface Props {
  scenario: ClinicalScenario;
}

export const ClinicalScenarioVideo: React.FC<Props> = ({ scenario }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: T.bgApp }}>
      <Sequence from={0} durationInFrames={105}>
        <HookScene scenario={scenario} />
      </Sequence>

      <Sequence from={75} durationInFrames={90}>
        <PatientSnapshotScene scenario={scenario} />
      </Sequence>

      <Sequence from={150} durationInFrames={195}>
        <CopilotReasoningScene scenario={scenario} />
      </Sequence>

      <Sequence from={330} durationInFrames={180}>
        <InsightCardsScene scenario={scenario} />
      </Sequence>

      <Sequence from={495} durationInFrames={135}>
        <CTAScene scenario={scenario} />
      </Sequence>
    </AbsoluteFill>
  );
};
