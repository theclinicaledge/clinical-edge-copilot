import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Urgency } from "../tokens";
import { CopilotHookScene }   from "../scenes/CopilotHookScene";
import { CopilotInputScene }  from "../scenes/CopilotInputScene";
import { CopilotOutputScene } from "../scenes/CopilotOutputScene";
import { CopilotSafetyScene } from "../scenes/CopilotSafetyScene";
import { CopilotOutroScene }  from "../scenes/CopilotOutroScene";

export interface GhostFragment {
  text: string;
  xPct: number;
  yPct: number;
}

export interface OutputSection {
  label: string;
  content: string;
}

export interface ScenarioData {
  id: string;
  urgency: Urgency;
  hookLine1: string;
  hookLine2?: string;
  hookLabel?: string;
  ghostFragments?: GhostFragment[];
  inputText: string;
  outputSections: OutputSection[];
}

// Timing (frames @ 30fps)
// S1 Hook:    0  –105   (dur 105 = 3.5s, 15f overlap → S2 at 90)
// S2 Input:   90 –270   (dur 180 = 6.0s, 15f overlap → S3 at 255)
// S3 Output: 255 –645   (dur 390 =13.0s, 15f overlap → S4 at 630)
// S4 Safety: 630 –705   (dur  75 = 2.5s, 15f overlap → S5 at 690)
// S5 Outro:  690 –780   (dur  90 = 3.0s, no fade-out)
// Total: 780 frames = 26s

interface Props {
  scenario: ScenarioData;
}

export const CopilotVideoComposition: React.FC<Props> = ({ scenario }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B1F2A" }}>
      <Sequence from={0}   durationInFrames={105}>
        <CopilotHookScene scenario={scenario} />
      </Sequence>
      <Sequence from={90}  durationInFrames={180}>
        <CopilotInputScene scenario={scenario} />
      </Sequence>
      <Sequence from={255} durationInFrames={390}>
        <CopilotOutputScene scenario={scenario} />
      </Sequence>
      <Sequence from={630} durationInFrames={75}>
        <CopilotSafetyScene />
      </Sequence>
      <Sequence from={690} durationInFrames={90}>
        <CopilotOutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
