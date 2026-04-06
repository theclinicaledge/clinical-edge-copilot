import React from "react";
import { CarouselSection } from "../components/CarouselSection";

// Section 2 of Copilot output — RED (#FF5C7A)
// "What concerns me most" — urgent clinical red flags

export const WhatConcernsMostScene: React.FC = () => (
  <CarouselSection
    accentColor="#FF5C7A"
    sectionLabel="WHAT CONCERNS ME MOST"
    headline={"What concerns\nme most"}
    subtitle="Three findings together change the urgency level."
    bullets={[
      { text: "SpO₂ 90% on room air — already below safe threshold" },
      { text: "HR 112 + chest pain = cardiac cause until proven otherwise" },
      { text: "Diaphoresis signals a high physiologic stress response" },
      { text: "This is not a 'wait and see' presentation" },
    ]}
    glowIntensity={0.92}
  />
);
