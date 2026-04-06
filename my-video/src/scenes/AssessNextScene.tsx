import React from "react";
import { CarouselSection } from "../components/CarouselSection";

// Section 3 of Copilot output — GREEN (#00D97E)
// "What I'd assess next" — nursing assessment priorities

export const AssessNextScene: React.FC = () => (
  <CarouselSection
    accentColor="#00D97E"
    sectionLabel="WHAT I'D ASSESS NEXT"
    headline={"What I'd\nassess next"}
    subtitle="Start with what you can get in the next 60 seconds."
    bullets={[
      { text: "12-lead ECG — run it now, do not delay" },
      { text: "Bilateral lung sounds — rule out PE, effusion" },
      { text: "Pain character: radiation, quality, timing, onset" },
      { text: "Has anything relieved it? Nitroglycerin response?" },
    ]}
    glowIntensity={0.92}
  />
);
