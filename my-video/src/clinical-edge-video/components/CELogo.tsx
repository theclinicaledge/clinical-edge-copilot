import React from "react";

// Exact CE logo SVG from frontend/src/App.jsx
// fill: #0ABFBC (current app accent color)
// viewBox: 0 0 225 200

interface CELogoProps {
  size?: number;
  color?: string;
}

export const CELogo: React.FC<CELogoProps> = ({
  size = 30,
  color = "#0ABFBC",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 225 200"
    xmlns="http://www.w3.org/2000/svg"
    fill={color}
    style={{ flexShrink: 0, display: "block" }}
    aria-label="Clinical Edge"
  >
    <path d="M 159.1,24.3 A 96,96 0 1,0 159.1,175.7 L 135.7,145.7 A 58,58 0 1,1 135.7,54.3 Z" />
    <path d="M 144.0,57 L 208,45 L 218,58 L 208,70 L 150.0,71 Z" />
    <path d="M 158.0,92 L 215,82 L 225,95 L 215,107 L 158.0,108 Z" />
    <path d="M 150.0,129 L 208,130 L 218,142 L 208,155 L 144.0,143 Z" />
  </svg>
);
