import React from "react";
import { Composition } from "remotion";
import { ChestPainComposition }    from "./Composition";
import { CopilotVideoComposition } from "./compositions/CopilotVideo";
import { bpDropScenario }          from "./scenarios/bp-drop";
import { qtcZofranScenario }       from "./scenarios/qtc-zofran";
import { confusedPatientScenario } from "./scenarios/confused-patient";
import { AppStoreShot }            from "./app-store-shots/AppStoreShot";

// App Store screenshot dimensions — 6.7" iPhone display (iPhone 15 Pro Max)
const AS_W = 1284;
const AS_H = 2778;

export const Root: React.FC = () => {
  return (
    <>
      {/* ── Existing video compositions ── */}
      <Composition
        id="ChestPainVideo"
        component={ChestPainComposition}
        durationInFrames={1455}
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

      {/* ── App Store stills — 1284×2778 (iPhone 15 Pro Max) ── */}
      {/* Preview all 5 slides in Remotion Studio. Render via ./render-app-store-shots.sh */}
      <Composition
        id="AppStoreShot1"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={AppStoreShot as any}
        durationInFrames={1}
        fps={1}
        width={AS_W}
        height={AS_H}
        defaultProps={{ slideIndex: 0 }}
      />
      <Composition
        id="AppStoreShot2"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={AppStoreShot as any}
        durationInFrames={1}
        fps={1}
        width={AS_W}
        height={AS_H}
        defaultProps={{ slideIndex: 1 }}
      />
      <Composition
        id="AppStoreShot3"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={AppStoreShot as any}
        durationInFrames={1}
        fps={1}
        width={AS_W}
        height={AS_H}
        defaultProps={{ slideIndex: 2 }}
      />
      <Composition
        id="AppStoreShot4"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={AppStoreShot as any}
        durationInFrames={1}
        fps={1}
        width={AS_W}
        height={AS_H}
        defaultProps={{ slideIndex: 3 }}
      />
      <Composition
        id="AppStoreShot5"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={AppStoreShot as any}
        durationInFrames={1}
        fps={1}
        width={AS_W}
        height={AS_H}
        defaultProps={{ slideIndex: 4 }}
      />
    </>
  );
};
