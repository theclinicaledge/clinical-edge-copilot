import React from "react";
import { CarouselSection } from "../components/CarouselSection";

// Section 1 of Copilot output — BLUE (#3CB8FF)
// "What this could be" — differential for chest pain scenario

export const WhatThisCouldBeScene: React.FC = () => (
  <CarouselSection
    accentColor="#3CB8FF"
    sectionLabel="WHAT THIS COULD BE"
    headline={"What this\ncould be"}
    subtitle="The pattern points toward something cardiac first."
    bullets={[
      { text: "ACS / NSTEMI — treat as cardiac until proven otherwise" },
      { text: "Unstable angina — plaque instability, unpredictable" },
      { text: "Pulmonary embolism — especially with tachycardia" },
      { text: "Aortic dissection — can't rule out without imaging" },
    ]}
    glowIntensity={0.92}
  />
);
