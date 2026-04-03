import React from "react";
import { Composition } from "remotion";
import { ChestPainComposition }    from "./Composition";
import { CopilotVideoComposition } from "./compositions/CopilotVideo";
import { bpDropScenario }          from "./scenarios/bp-drop";
import { qtcZofranScenario }       from "./scenarios/qtc-zofran";
import { confusedPatientScenario } from "./scenarios/confused-patient";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="ChestPainVideo"
        component={ChestPainComposition}
        durationInFrames={1050}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="BpDropVideo"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={CopilotVideoComposition as any}
        durationInFrames={780}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ scenario: bpDropScenario }}
      />
      <Composition
        id="QtcZofranVideo"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={CopilotVideoComposition as any}
        durationInFrames={780}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ scenario: qtcZofranScenario }}
      />
      <Composition
        id="ConfusedPatientVideo"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={CopilotVideoComposition as any}
        durationInFrames={780}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ scenario: confusedPatientScenario }}
      />
    </>
  );
};
