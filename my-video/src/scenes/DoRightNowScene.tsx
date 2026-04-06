import React from "react";
import { CarouselSection } from "../components/CarouselSection";

// Section 4 of Copilot output — YELLOW (#FFA927)
// "What I'd do right now" — ordered nursing actions

export const DoRightNowScene: React.FC = () => (
  <CarouselSection
    accentColor="#FFA927"
    sectionLabel="WHAT I'D DO RIGHT NOW"
    headline={"What I'd do\nright now"}
    subtitle="Sequence matters. Move in order."
    numbered={[
      { num: "01", action: "Apply oxygen", sub: "Target SpO₂ ≥ 94%. Nasal cannula or NRB — don't wait." },
      { num: "02", action: "Run the 12-lead ECG", sub: "Notify provider while it's printing. Time is tissue." },
      { num: "03", action: "Establish IV access", sub: "18g or larger. Draw labs simultaneously." },
      { num: "04", action: "Escalate immediately", sub: "Vitals + ECG + full clinical picture. Now." },
    ]}
    glowIntensity={0.92}
  />
);
