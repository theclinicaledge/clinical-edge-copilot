import React from "react";
import { Composition } from "remotion";
import { ChestPainComposition } from "./Composition";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="ChestPainVideo"
        component={ChestPainComposition}
        durationInFrames={660}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
