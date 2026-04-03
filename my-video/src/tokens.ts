// Clinical Edge Copilot — design tokens
// Sourced directly from frontend/src/App.jsx

export const T = {
  // Backgrounds
  bgApp:    "#0B1F2A",
  bgCard:   "#112936",
  bgGlow:   "#0A1628",

  // Borders
  borderCard:      "rgba(255,255,255,0.09)",
  borderPanel:     "rgba(0,194,209,0.10)",
  borderDivider:   "rgba(255,255,255,0.07)",

  // Text
  textPrimary: "#F8FBFC",
  textBody:    "#A8C1CC",
  textMuted:   "#7F99A5",
  textDimmer:  "#4A6978",
  textHint:    "#3A5566",

  // Accent
  teal:     "#00C2D1",
  tealAlt:  "#00C2CB",

  // Urgency
  urgHigh:        "#fca5a5",
  urgHighBg:      "rgba(239,68,68,0.12)",
  urgHighBorder:  "rgba(239,68,68,0.40)",
  urgMod:         "#fcd34d",
  urgModBg:       "rgba(245,158,11,0.12)",
  urgModBorder:   "rgba(245,158,11,0.40)",
  urgLow:         "#86efac",
  urgLowBg:       "rgba(34,197,94,0.10)",
  urgLowBorder:   "rgba(34,197,94,0.35)",

  // Panels
  panelBg: "rgba(0,194,209,0.04)",

  // Fonts
  sans:  "Syne, system-ui, sans-serif",
  body:  "'DM Sans', system-ui, sans-serif",
  mono:  "'IBM Plex Mono', 'DM Mono', monospace",
};

export type Urgency = "HIGH" | "MODERATE" | "LOW";

export function urgencyTokens(u: Urgency) {
  if (u === "HIGH")     return { color: T.urgHigh,  bg: T.urgHighBg,  border: T.urgHighBorder };
  if (u === "MODERATE") return { color: T.urgMod,   bg: T.urgModBg,   border: T.urgModBorder  };
  return                       { color: T.urgLow,   bg: T.urgLowBg,   border: T.urgLowBorder  };
}
