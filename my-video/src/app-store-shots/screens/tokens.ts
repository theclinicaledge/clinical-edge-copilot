// ─── Mock Screen Design Tokens ────────────────────────────────────────────────
//
// Scale reference: iPhone 15 Pro Max viewport = 430 CSS px → 1290px canvas
// Every app CSS value × S = canvas pixels
//
// Real app visual system (warm / light theme):
//   Content bg   #E8E2D8   Warm beige — main content area
//   Card bg      #FFFFFF   White — section cards
//   Card bg 2    #F5F2EC   Slightly warm white — input / secondary cards
//   Text primary #1B2433   Dark navy — headings and body on warm bg
//   Text body    #3D4F5C   Medium dark — body text on white cards
//   Teal accent  #0EA5B7   Muted cyan — legible on warm/white bg
//
export const S = 3;

export const C = {
  // Backgrounds — warm / light
  bgApp:   "#E8E2D8",   // warm beige — content area
  bgCard:  "#FFFFFF",   // white section cards
  bgCard2: "#F5F2EC",   // slightly warm white

  // Text (dark on light bg)
  textPrimary: "#1B2433",
  textBody:    "#3D4F5C",
  textMuted:   "#5D7080",
  textDim:     "#8FA3B0",
  textHint:    "rgba(27,36,51,0.35)",

  // Teal accent — muted, legible on light bg
  teal:       "#0EA5B7",
  tealMuted:  "#0891A0",
  tealFaint:  "rgba(14,165,183,0.08)",
  tealBorder: "rgba(14,165,183,0.25)",

  // Borders on light bg
  border:      "rgba(0,0,0,0.08)",
  borderFaint: "rgba(0,0,0,0.05)",
  borderDim:   "rgba(0,0,0,0.07)",

  // Section card colors — richer saturation on white cards
  blue:    "#2563EB",    bgBlue:    "#FFFFFF",
  red:     "#DC2626",    bgRed:     "#FFFFFF",
  green:   "#059669",    bgGreen:   "#FFFFFF",
  yellow:  "#D97706",    bgYellow:  "#FFFFFF",

  // Urgency — HIGH
  urgHigh:       "#DC2626",
  urgHighBg:     "rgba(220,38,38,0.06)",
  urgHighBorder: "rgba(220,38,38,0.20)",

  // Warning — MODERATE
  amber:       "#D97706",
  amberBg:     "rgba(217,119,6,0.07)",
  amberBorder: "rgba(217,119,6,0.25)",
  amberText:   "#92400E",
};

// Font stacks — system fonts render as SF Pro on macOS (where rendering runs)
export const SANS = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif';
export const MONO = '"IBM Plex Mono", "SF Mono", "Courier New", monospace';
