import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { T } from "../clinical-edge-video/tokens";
import { ProductDemoScript, DEFAULT_PRODUCT_DEMO_SCRIPT } from "./types";
import { ProductHookScene }    from "./scenes/ProductHookScene";
import { ProductTensionScene } from "./scenes/ProductTensionScene";
import { ProductAppDemoScene } from "./scenes/ProductAppDemoScene";
import { ProductCTAScene }     from "./scenes/ProductCTAScene";

// ─── Scene timing @ 30fps ─────────────────────────────────────────────────────
//
//   S1  Hook:       0  –  90    3.0s   Problem statement + clinical subtext
//   S2  Tension:   90  – 300    7.0s   Why this moment tests nurses
//   S3  App demo: 300  – 510    7.0s   CE phone mockup with animated response
//   S4  CTA:      510  – 600    3.0s   Download Clinical Edge
//
// Total: 600 frames = 20.0 seconds at 30fps
//
// Footage assignment:
//   [0] → Hook + CTA (reused at different offset)
//   [1] → Tension scene
//   [2] → (unused — app demo scene has no footage)

export const ProductDemoTemplate: React.FC<ProductDemoScript> = (props) => {
  const s: ProductDemoScript = { ...DEFAULT_PRODUCT_DEMO_SCRIPT, ...props };

  const ff    = s.footageFiles ?? [];
  const clip0 = ff[0];
  const clip1 = ff[1];

  return (
    <AbsoluteFill style={{ backgroundColor: T.pageBg }}>

      <Sequence from={0} durationInFrames={90}>
        <ProductHookScene
          hookLine={s.hookLine}
          hookSub={s.hookSub}
          footageFile={clip0}
        />
      </Sequence>

      <Sequence from={90} durationInFrames={210}>
        <ProductTensionScene
          tensionTitle={s.tensionTitle}
          tensionSubtext={s.tensionSubtext}
          tensionCards={s.tensionCards}
          footageFile={clip1 ?? clip0}
          footageStartFrom={45}
        />
      </Sequence>

      <Sequence from={300} durationInFrames={210}>
        <ProductAppDemoScene
          appPrompt={s.appPrompt}
          appResponseItems={s.appResponseItems}
          appUrgency={s.appUrgency}
          appSections={s.appSections}
        />
      </Sequence>

      <Sequence from={510} durationInFrames={90}>
        <ProductCTAScene
          ctaLine={s.ctaLine}
          ctaHandle={s.ctaHandle}
          ctaTagline={s.ctaTagline}
          footageFile={clip0}
          footageStartFrom={120}
        />
      </Sequence>

    </AbsoluteFill>
  );
};
