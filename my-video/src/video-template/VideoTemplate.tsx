import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { T } from "../clinical-edge-video/tokens";
import { VideoScript, DEFAULT_VIDEO_SCRIPT } from "./types";
import { TemplateHookScene }      from "./scenes/TemplateHookScene";
import { TemplateBreakdownScene } from "./scenes/TemplateBreakdownScene";
import { TemplateNursingScene }   from "./scenes/TemplateNursingScene";
import { TemplateCTAScene }       from "./scenes/TemplateCTAScene";

// ─── Scene timing @ 30fps ─────────────────────────────────────────────────────
//
//   S1  Hook:       0  –  90    3.0s   Punchy opener
//   S2  Breakdown:  90 – 300    7.0s   Pathophysiology / concepts
//   S3  Nursing:   300 – 510    7.0s   Priority nursing actions
//   S4  CTA:       510 – 600    3.0s   Follow + branding
//
// Total: 600 frames = 20.0 seconds at 30fps
//
// Footage assignment (footageFiles array order):
//   [0] → Hook scene
//   [1] → Breakdown scene
//   [2] → Nursing scene
//   [0] → CTA scene (reuses clip 0 from a later offset for visual variety)

export const VideoTemplate: React.FC<VideoScript> = (script) => {
  const s: VideoScript = { ...DEFAULT_VIDEO_SCRIPT, ...script };

  // Extract footage paths — fall back gracefully when no footage exists
  const ff = s.footageFiles ?? [];
  const clip0 = ff[0];  // e.g. cardiac monitor (used for Hook + CTA)
  const clip1 = ff[1];  // e.g. ICU monitor
  const clip2 = ff[2];  // e.g. nurse/hospital

  return (
    <AbsoluteFill style={{ backgroundColor: T.pageBg }}>

      <Sequence from={0}   durationInFrames={90}>
        <TemplateHookScene
          hookLine={s.hookLine}
          hookSub={s.hookSub}
          badgeText={s.badgeText}
          urgency={s.urgency}
          footageFile={clip0}
        />
      </Sequence>

      <Sequence from={90}  durationInFrames={210}>
        <TemplateBreakdownScene
          breakdownTitle={s.breakdownTitle}
          breakdownSubtitle={s.breakdownSubtitle}
          breakdownCards={s.breakdownCards}
          footageFile={clip1 ?? clip0}
          footageStartFrom={45}
        />
      </Sequence>

      <Sequence from={300} durationInFrames={210}>
        <TemplateNursingScene
          nursingTitle={s.nursingTitle}
          nursingActions={s.nursingActions}
          closingLine={s.closingLine}
          urgency={s.urgency}
          footageFile={clip2 ?? clip1 ?? clip0}
          footageStartFrom={30}
        />
      </Sequence>

      <Sequence from={510} durationInFrames={90}>
        <TemplateCTAScene
          ctaHandle={s.ctaHandle}
          ctaTagline={s.ctaTagline}
          topic={s.topic}
          footageFile={clip0}
          footageStartFrom={120}
        />
      </Sequence>

    </AbsoluteFill>
  );
};
