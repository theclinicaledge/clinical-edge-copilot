import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { T } from "./tokens";
import { ClinicalScenario } from "./data/scenarios";
import { HookScene }             from "./components/HookScene";
import { PatientSnapshotScene }  from "./components/PatientSnapshotScene";
import { CopilotDemoScene }      from "./components/CopilotDemoScene";
import { TakeawayScene }         from "./components/TakeawayScene";
import { CTAScene }              from "./components/CTAScene";

// ─── Scene timing @ 30fps ─────────────────────────────────────────────────────
// S1  HookScene:              0 –  135  (4.5s)
// S2  PatientSnapshotScene:  120 –  240  (4.0s, 15f overlap)
// S3  CopilotDemoScene:      225 –  435  (7.0s, 15f overlap)
// S4  TakeawayScene:         420 –  540  (4.0s, 15f overlap)
// S5  CTAScene:              525 –  690  (5.5s, 15f overlap)
// Total: 690 frames = 23.0 seconds

interface Props {
  scenario: ClinicalScenario;
}

export const ClinicalScenarioVideo: React.FC<Props> = ({ scenario }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: T.pageBg }}>

      <Sequence from={0} durationInFrames={150}>
        <HookScene
          hookLine={scenario.hookLine}
          scenarioLabel={scenario.scenarioLabel}
        />
      </Sequence>

      <Sequence from={120} durationInFrames={120}>
        <PatientSnapshotScene vitals={scenario.vitals} />
      </Sequence>

      <Sequence from={225} durationInFrames={210}>
        <CopilotDemoScene scenario={scenario} />
      </Sequence>

      <Sequence from={420} durationInFrames={120}>
        <TakeawayScene scenario={scenario} />
      </Sequence>

      <Sequence from={525} durationInFrames={165}>
        <CTAScene />
      </Sequence>

    </AbsoluteFill>
  );
};
