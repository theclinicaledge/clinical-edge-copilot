import React from "react";
import { T } from "../styles/tokens";

interface ClinicalCardProps {
  children: React.ReactNode;
  accentColor?: string;
  style?: React.CSSProperties;
}

export const ClinicalCard: React.FC<ClinicalCardProps> = ({
  children,
  accentColor = T.teal,
  style,
}) => {
  return (
    <div style={{
      background: "rgba(13,32,64,0.72)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: `1px solid ${accentColor}28`,
      borderLeft: `3px solid ${accentColor}`,
      borderRadius: 16,
      padding: "28px 32px",
      boxShadow: `0 4px 32px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.05)`,
      ...style,
    }}>
      {children}
    </div>
  );
};
