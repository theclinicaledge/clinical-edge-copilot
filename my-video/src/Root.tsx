import React from "react";
import { Composition } from "remotion";
import { ChestPainComposition }    from "./Composition";
import { CopilotVideoComposition } from "./compositions/CopilotVideo";
import { bpDropScenario }          from "./scenarios/bp-drop";
import { qtcZofranScenario }       from "./scenarios/qtc-zofran";
import { confusedPatientScenario } from "./scenarios/confused-patient";
import { AppStoreShot }            from "./app-store-shots/AppStoreShot";
import { CopilotAppStoreDemoComposition } from "./compositions/AppStoreDemo";
import { ClinicalScenarioVideo }    from "./clinical-edge-video/ClinicalScenarioVideo";
import { septicShockScenario }      from "./clinical-edge-video/data/scenarios";
import { RhythmLabPatternVideo }    from "./rhythm-lab-video/compositions/RhythmLabPatternVideo";
import { CompleteHeartBlockVideo }  from "./complete-heart-block/CompleteHeartBlockVideo";
import { VideoTemplate }           from "./video-template/VideoTemplate";
import { DEFAULT_VIDEO_SCRIPT }    from "./video-template/types";

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

      {/* ── Product demo video — filmed clips ── */}
      <Composition
        id="CopilotAppStoreDemo"
        component={CopilotAppStoreDemoComposition}
        durationInFrames={1350}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* ── Clinical Edge vertical videos — 1080×1920 TikTok/Reels ── */}
      <Composition
        id="ClinicalScenarioVideo"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={ClinicalScenarioVideo as any}
        durationInFrames={690}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ scenario: septicShockScenario }}
      />

      {/* ── Generic video template — driven by JSON props ── */}
      {/* Usage: remotion render VideoTemplate --props=path/to/script.json */}
      <Composition
        id="VideoTemplate"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={VideoTemplate as any}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={DEFAULT_VIDEO_SCRIPT}
      />

      {/* ── Complete Heart Block — TikTok/Reels 1080×1920 ── */}
      <Composition
        id="CompleteHeartBlockVideo"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={CompleteHeartBlockVideo as any}
        durationInFrames={750}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />

      <Composition
        id="RhythmLabPatternVideo"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={RhythmLabPatternVideo as any}
        durationInFrames={690}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
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
