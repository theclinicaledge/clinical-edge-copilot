import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { T } from "./tokens";
import { ClinicalScenario } from "./data/scenarios";
import { HookScene }        from "./components/HookScene";
import { PatientScene }     from "./components/PatientScene";
import { CopilotScene }     from "./components/CopilotScene";
import { TakeawayScene }    from "./components/TakeawayScene";
import { CTAScene }         from "./components/CTAScene";

// ─── Scene timing @ 30fps ─────────────────────────────────────────────────────
// Sequential — total = 690f = 23.0s
//
//   S1  HookScene:      0 – 105    3.5s
//   S2  PatientScene: 105 – 270    5.5s  ← extended so vitals are readable
//   S3  CopilotScene: 270 – 480    7.0s  ← hero
//   S4  TakeawayScene:480 – 600    4.0s
//   S5  CTAScene:     600 – 690    3.0s

interface Props { scenario: ClinicalScenario }

export const ClinicalScenarioVideo: React.FC<Props> = ({ scenario }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: T.pageBg }}>

      <Sequence from={0}   durationInFrames={105}>
        <HookScene hookLine={scenario.hookLine} scenarioLabel={scenario.scenarioLabel} />
      </Sequence>

      <Sequence from={105} durationInFrames={165}>
        <PatientScene vitals={scenario.vitals} />
      </Sequence>

      <Sequence from={270} durationInFrames={210}>
        <CopilotScene scenario={scenario} />
      </Sequence>

      <Sequence from={480} durationInFrames={120}>
        <TakeawayScene
          line1="Do not read the vitals separately."
          line2="Read the pattern."
        />
      </Sequence>

      <Sequence from={600} durationInFrames={90}>
        <CTAScene />
      </Sequence>

    </AbsoluteFill>
  );
};
